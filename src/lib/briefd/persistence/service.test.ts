import { describe, expect, it } from "vitest";
import type { MediaPlanRow } from "@/lib/jobOrchestrator";
import { mediaSpecs } from "@/lib/briefd/brain";
import { CampaignService, campaignUpdateFromSnapshot, type CampaignDraft, type CampaignRepository, type StoredCampaign, type StoredShare } from "./service";

class MemoryRepository implements CampaignRepository {
  campaigns = new Map<string, StoredCampaign>(); shares = new Map<string, StoredShare>();
  async createCampaign(record: StoredCampaign) { this.campaigns.set(record.snapshot.id, structuredClone(record)); }
  async findCampaign(id: string) { return structuredClone(this.campaigns.get(id) ?? null); }
  async replaceCampaign(record: StoredCampaign, expectedRevision: number) {
    const current = this.campaigns.get(record.snapshot.id);
    if (!current || current.snapshot.revision !== expectedRevision) return false;
    this.campaigns.set(record.snapshot.id, structuredClone(record)); return true;
  }
  async deleteCampaign(id: string) { this.campaigns.delete(id); for (const [key, share] of this.shares) if (share.campaignId === id) this.shares.delete(key); }
  async listShares(campaignId: string) { return structuredClone([...this.shares.values()].filter((share) => share.campaignId === campaignId)); }
  async createShare(share: StoredShare) { this.shares.set(share.id, structuredClone(share)); }
  async findShareByTokenHash(hash: string) { return structuredClone([...this.shares.values()].find((share) => share.tokenHash === hash) ?? null); }
  async revokeShare(campaignId: string, shareId: string, revokedAt: string) { const share = this.shares.get(shareId); if (!share || share.campaignId !== campaignId || share.revokedAt) return false; share.revokedAt = revokedAt; return true; }
}

const sourceRow: MediaPlanRow = { id: "row-1", source: { sheetName: "Plan", rowNumber: 2 }, campaign: "Launch", publisher: "LinkedIn", format: "Single Image — Square", deadline: "2026-09-24", deadlineRaw: "24 Sep 2026", notes: "", rawValues: { "1": "LinkedIn" } };
const spec = mediaSpecs.find((item) => item.id === "linkedin-single-image-square")!;
const draft: CampaignDraft = { clientName: "Client", campaignName: "Launch", sourceFilename: "plan.xlsx", sheetName: "Plan", headerRow: 1, columnMapping: { publisher: 1, format: 2 }, rows: [sourceRow], resolutions: [{ rowId: sourceRow.id, kind: "brain", specId: spec.id, deadline: sourceRow.deadline }] };
const fixedNow = () => new Date("2026-08-20T12:00:00.000Z");

describe("CampaignService", () => {
  it("creates and reloads a campaign only with its owner capability", async () => {
    const repository = new MemoryRepository(); const service = new CampaignService(repository, fixedNow);
    const created = await service.createCampaign(draft);
    expect(created.response.campaign.revision).toBe(1);
    await expect(service.loadOwnerCampaign(created.response.campaign.id, created.ownerSecret)).resolves.toMatchObject({ access: "edit" });
    await expect(service.loadOwnerCampaign(created.response.campaign.id, "wrong")).rejects.toMatchObject({ status: 404 });
  });

  it("rebuilds verified fields from the Brain instead of trusting the client", async () => {
    const repository = new MemoryRepository(); const service = new CampaignService(repository, fixedNow);
    const created = await service.createCampaign(draft);
    expect(created.response.campaign.formats[0].dimensions.width).toBe(spec.dimensions.width_px);
    expect(created.response.campaign.formats[0].publisher).toBe(spec.publisher);
    expect("format" in draft.resolutions[0]).toBe(false);
  });

  it("uses optimistic revisions for updates", async () => {
    const repository = new MemoryRepository(); const service = new CampaignService(repository, fixedNow);
    const created = await service.createCampaign(draft); const snapshot = created.response.campaign;
    const updated = await service.updateCampaign(campaignUpdateFromSnapshot({ ...snapshot, campaignName: "Updated" }), created.ownerSecret);
    expect(updated.campaign).toMatchObject({ campaignName: "Updated", revision: 2 });
    await expect(service.updateCampaign(campaignUpdateFromSnapshot(snapshot), created.ownerSecret)).rejects.toMatchObject({ status: 409 });
  });

  it("creates redacted view-only links and makes revocation immediate", async () => {
    const repository = new MemoryRepository(); const service = new CampaignService(repository, fixedNow);
    const created = await service.createCampaign(draft); const campaignId = created.response.campaign.id;
    const share = await service.createShare(campaignId, created.ownerSecret);
    const viewed = await service.loadSharedCampaign(share.token);
    expect(viewed.access).toBe("view"); expect("rows" in viewed.campaign).toBe(false);
    await service.revokeShare(campaignId, share.id, created.ownerSecret);
    await expect(service.loadSharedCampaign(share.token)).rejects.toMatchObject({ status: 404 });
  });

  it("blocks shares while rows remain unresolved and invalidates links on deletion", async () => {
    const repository = new MemoryRepository(); const service = new CampaignService(repository, fixedNow);
    const unresolved = await service.createCampaign({ ...draft, resolutions: [] });
    await expect(service.createShare(unresolved.response.campaign.id, unresolved.ownerSecret)).rejects.toMatchObject({ status: 409 });
    const created = await service.createCampaign(draft); const share = await service.createShare(created.response.campaign.id, created.ownerSecret);
    await service.deleteCampaign(created.response.campaign.id, created.ownerSecret);
    await expect(service.loadSharedCampaign(share.token)).rejects.toMatchObject({ status: 404 });
  });

  it("rejects invalid or past share expirations", async () => {
    const repository = new MemoryRepository(); const service = new CampaignService(repository, fixedNow);
    const created = await service.createCampaign(draft); const id = created.response.campaign.id;
    await expect(service.createShare(id, created.ownerSecret, "not-a-date")).rejects.toMatchObject({ status: 400 });
    await expect(service.createShare(id, created.ownerSecret, "2026-08-19T12:00:00.000Z")).rejects.toMatchObject({ status: 400 });
  });
});
