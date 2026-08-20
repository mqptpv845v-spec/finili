import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { mediaSpecs } from "@/lib/briefd/brain";
import { sourceBackedFormat } from "@/lib/briefd/format";
import type { FormatData } from "@/lib/briefd/types";
import type { MediaPlanRow } from "@/lib/jobOrchestrator";
import { hashCapabilitySecret } from "./security";
import type { CampaignSnapshot } from "./contracts";
import { CampaignService, campaignUpdateFromSnapshot, type StoredCampaign, type StoredShare } from "./service";
import { PostgresCampaignRepository } from "./repository";

const databaseUrl = process.env.DATABASE_URL?.trim();
const databaseDescribe = databaseUrl ? describe : describe.skip;
const sql = databaseUrl ? postgres(databaseUrl, { max: 4 }) : null;
const repository = sql ? new PostgresCampaignRepository(sql) : null;
const createdCampaignIds = new Set<string>();
const repositoryNow = "2026-08-20T12:00:00.000Z";

function campaignRecord(): StoredCampaign {
  const campaignId = randomUUID();
  const firstRow: MediaPlanRow = {
    id: `source-row-one-${campaignId}`,
    source: { sheetName: "Campaign plan", rowNumber: 7 },
    campaign: "Autumn launch",
    publisher: "LinkedIn",
    format: "Single Image — Square",
    deadline: "2026-09-24",
    deadlineRaw: "24 Sep 2026",
    notes: "Use approved copy",
    rawValues: { "1": "Autumn launch", "2": "LinkedIn", "8": "keep me" },
  };
  const secondRow: MediaPlanRow = {
    id: `source-row-two-${campaignId}`,
    source: { sheetName: "Campaign plan", rowNumber: 12 },
    campaign: "Autumn launch",
    publisher: "Local publisher",
    format: "Custom panorama",
    deadline: null,
    deadlineRaw: "Awaiting publisher",
    notes: "",
    rawValues: { "1": "Autumn launch", "2": "Local publisher" },
  };
  const spec = mediaSpecs.find((candidate) => candidate.id === "linkedin-single-image-square");
  if (!spec) throw new Error("Integration fixture requires the LinkedIn square Brain spec.");
  const verified = sourceBackedFormat(spec, {
    id: firstRow.id,
    deadline: firstRow.deadline,
    deadlineRaw: firstRow.deadlineRaw,
    sourceRow: firstRow.source,
    notes: firstRow.notes,
    metadata: "Wave A",
  });
  const manual: FormatData = {
    id: secondRow.id,
    categoryTag: "High-Impact",
    publisher: "Local publisher",
    formatName: "Custom panorama",
    sectionCategory: "Digital Display & High-Impact",
    dimensions: { width: 1_920, height: 540, unit: "px", visibleWidth: 1_760, visibleHeight: 500 },
    deadline: null,
    requirements: { maxFileSizeKb: 5_120, durationSeconds: [10, 15] },
    fileTypes: ["JPG", "MP4"],
    trust: "user-provided",
    sourceRow: secondRow.source,
  };
  const snapshot: CampaignSnapshot = {
    id: campaignId,
    revision: 1,
    clientName: "Example & Co",
    campaignName: "Autumn launch",
    sourceFilename: "media plan åäö.xlsx",
    sheetName: "Campaign plan",
    headerRow: 5,
    columnMapping: { campaign: 1, publisher: 2, format: 4, deadline: 6, notes: 8 },
    rows: [firstRow, secondRow],
    // Deliberately differs from row order: each persisted array has its own ordering contract.
    formats: [manual, verified],
  };
  return {
    snapshot,
    ownerSessionHash: hashCapabilitySecret(`owner-${campaignId}`),
  };
}

databaseDescribe("PostgresCampaignRepository", () => {
  afterEach(async () => {
    if (!repository) return;
    for (const id of createdCampaignIds) await repository.deleteCampaign(id);
    createdCampaignIds.clear();
  });

  afterAll(async () => {
    await sql?.end({ timeout: 5 });
  });

  it("round-trips every campaign snapshot field and both array orders", async () => {
    const record = campaignRecord();
    createdCampaignIds.add(record.snapshot.id);
    await repository!.createCampaign(record);

    await expect(repository!.findCampaign(record.snapshot.id)).resolves.toEqual(record);
  });

  it("replaces rows and formats atomically with owner-and-revision concurrency guards", async () => {
    const record = campaignRecord();
    createdCampaignIds.add(record.snapshot.id);
    await repository!.createCampaign(record);

    const replacement: StoredCampaign = {
      ...record,
      snapshot: {
        ...record.snapshot,
        revision: 2,
        campaignName: "Updated launch",
        rows: record.snapshot.rows.slice(0, 1),
        formats: record.snapshot.formats.slice(1),
      },
    };
    await expect(repository!.replaceCampaign(replacement, 1, repositoryNow)).resolves.toBe("replaced");
    await expect(repository!.findCampaign(record.snapshot.id)).resolves.toEqual(replacement);

    const stale = { ...replacement, snapshot: { ...replacement.snapshot, revision: 3, campaignName: "Stale write" } };
    await expect(repository!.replaceCampaign(stale, 1, repositoryNow)).resolves.toBe("revision-conflict");
    await expect(repository!.replaceCampaign({ ...stale, ownerSessionHash: "0".repeat(64) }, 2, repositoryNow)).resolves.toBe("revision-conflict");
    await expect(repository!.findCampaign(record.snapshot.id)).resolves.toEqual(replacement);

    const invalidReplacement: StoredCampaign = {
      ...replacement,
      snapshot: {
        ...replacement.snapshot,
        revision: 3,
        formats: [{ ...replacement.snapshot.formats[0], id: "missing-source-row" }],
      },
    };
    await expect(repository!.replaceCampaign(invalidReplacement, 2, repositoryNow)).rejects.toThrow("does not belong");
    await expect(repository!.findCampaign(record.snapshot.id)).resolves.toEqual(replacement);
  });

  it("stores only capability hashes and supports share lookup, listing, and one-way revocation", async () => {
    const record = campaignRecord();
    createdCampaignIds.add(record.snapshot.id);
    await repository!.createCampaign(record);
    const plainToken = `plain-share-${randomUUID()}`;
    const share: StoredShare = {
      id: randomUUID(),
      campaignId: record.snapshot.id,
      tokenHash: hashCapabilitySecret(plainToken),
      createdAt: "2026-08-20T12:00:00.000Z",
      expiresAt: "2026-09-20T12:00:00.000Z",
      revokedAt: null,
    };

    await expect(repository!.createShare(share, repositoryNow)).resolves.toBe("created");
    await expect(repository!.findShareByTokenHash(share.tokenHash)).resolves.toEqual(share);
    await expect(repository!.findShareByTokenHash(plainToken)).resolves.toBeNull();
    await expect(repository!.listShares(record.snapshot.id)).resolves.toEqual([share]);

    const stored = await sql!<{ owner_session_hash: string; token_hash: string }[]>`
      SELECT c.owner_session_hash, s.token_hash
        FROM briefd_campaigns AS c
        JOIN briefd_share_tokens AS s ON s.campaign_id = c.id
       WHERE s.id = ${share.id}
    `;
    const plainOwner = `owner-${record.snapshot.id}`;
    expect(stored[0]?.owner_session_hash).toBe(record.ownerSessionHash);
    expect(stored[0]?.token_hash).toBe(share.tokenHash);
    expect(JSON.stringify(stored)).not.toContain(plainToken);
    expect(JSON.stringify(stored)).not.toContain(plainOwner);

    const revokedAt = "2026-08-21T09:30:00.000Z";
    await expect(repository!.revokeShare(record.snapshot.id, share.id, revokedAt)).resolves.toBe(true);
    await expect(repository!.revokeShare(record.snapshot.id, share.id, revokedAt)).resolves.toBe(false);
    await expect(repository!.findShareByTokenHash(share.tokenHash)).resolves.toMatchObject({ revokedAt });
  });

  it("rejects unresolved updates while a share is active and keeps that link readable", async () => {
    const record = campaignRecord();
    createdCampaignIds.add(record.snapshot.id);
    await repository!.createCampaign(record);
    const service = new CampaignService(repository!, () => new Date(repositoryNow));
    const ownerSecret = `owner-${record.snapshot.id}`;
    const share = await service.createShare(record.snapshot.id, ownerSecret);
    const unresolved = {
      ...campaignUpdateFromSnapshot(record.snapshot),
      resolutions: campaignUpdateFromSnapshot(record.snapshot).resolutions.slice(0, 1),
    };

    await expect(service.updateCampaign(unresolved, ownerSecret)).rejects.toMatchObject({
      status: 409,
      message: "Revoke active share links before leaving campaign rows unresolved.",
    });
    await expect(service.loadSharedCampaign(share.token)).resolves.toMatchObject({
      access: "view",
      campaign: { id: record.snapshot.id, revision: 1 },
    });
  });

  it("serializes share creation against an unresolved replacement", async () => {
    const record = campaignRecord();
    createdCampaignIds.add(record.snapshot.id);
    await repository!.createCampaign(record);
    const unresolved: StoredCampaign = {
      ...record,
      snapshot: { ...record.snapshot, revision: 2, formats: record.snapshot.formats.slice(0, 1) },
    };
    const share: StoredShare = {
      id: randomUUID(),
      campaignId: record.snapshot.id,
      tokenHash: hashCapabilitySecret(`racing-share-${randomUUID()}`),
      createdAt: repositoryNow,
      expiresAt: null,
      revokedAt: null,
    };

    const [replaceResult, shareResult] = await Promise.all([
      repository!.replaceCampaign(unresolved, 1, repositoryNow),
      repository!.createShare(share, repositoryNow),
    ]);

    expect([
      ["replaced", "campaign-unresolved"],
      ["active-share-conflict", "created"],
    ]).toContainEqual([replaceResult, shareResult]);
    const stored = await repository!.findCampaign(record.snapshot.id);
    const shares = await repository!.listShares(record.snapshot.id);
    expect(stored).not.toBeNull();
    expect(stored!.snapshot.formats).toHaveLength(shareResult === "created" ? 2 : 1);
    expect(shares).toHaveLength(shareResult === "created" ? 1 : 0);
  });

  it("filters expired and revoked shares from the owner response at the service clock", async () => {
    const record = campaignRecord();
    createdCampaignIds.add(record.snapshot.id);
    await repository!.createCampaign(record);
    const shares: StoredShare[] = [
      { id: randomUUID(), campaignId: record.snapshot.id, tokenHash: "1".repeat(64), createdAt: repositoryNow, expiresAt: "2026-08-21T12:00:00.000Z", revokedAt: null },
      { id: randomUUID(), campaignId: record.snapshot.id, tokenHash: "2".repeat(64), createdAt: "2026-08-19T12:00:00.000Z", expiresAt: "2026-08-20T11:59:59.000Z", revokedAt: null },
      { id: randomUUID(), campaignId: record.snapshot.id, tokenHash: "3".repeat(64), createdAt: "2026-08-19T12:00:00.000Z", expiresAt: null, revokedAt: "2026-08-20T11:00:00.000Z" },
    ];
    for (const share of shares) await expect(repository!.createShare(share, repositoryNow)).resolves.toBe("created");
    const service = new CampaignService(repository!, () => new Date(repositoryNow));

    await expect(service.loadOwnerCampaign(record.snapshot.id, `owner-${record.snapshot.id}`)).resolves.toMatchObject({
      shares: [{ id: shares[0].id, expiresAt: shares[0].expiresAt }],
    });
  });

  it("cascades campaign deletion to rows, resolved formats, and shares", async () => {
    const record = campaignRecord();
    await repository!.createCampaign(record);
    const share: StoredShare = {
      id: randomUUID(),
      campaignId: record.snapshot.id,
      tokenHash: hashCapabilitySecret(`share-${randomUUID()}`),
      createdAt: "2026-08-20T12:00:00.000Z",
      expiresAt: null,
      revokedAt: null,
    };
    await expect(repository!.createShare(share, repositoryNow)).resolves.toBe("created");
    await repository!.deleteCampaign(record.snapshot.id);

    const counts = await sql!<{ campaigns: number; rows: number; formats: number; shares: number }[]>`
      SELECT
        (SELECT COUNT(*)::int FROM briefd_campaigns WHERE id = ${record.snapshot.id}) AS campaigns,
        (SELECT COUNT(*)::int FROM briefd_campaign_rows WHERE campaign_id = ${record.snapshot.id}) AS rows,
        (SELECT COUNT(*)::int
           FROM briefd_resolved_formats AS f
           JOIN briefd_campaign_rows AS r ON r.id = f.campaign_row_id
          WHERE r.campaign_id = ${record.snapshot.id}) AS formats,
        (SELECT COUNT(*)::int FROM briefd_share_tokens WHERE campaign_id = ${record.snapshot.id}) AS shares
    `;
    expect(counts[0]).toEqual({ campaigns: 0, rows: 0, formats: 0, shares: 0 });
  });
});
