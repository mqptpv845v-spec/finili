import { randomUUID } from "node:crypto";
import { mediaSpecs } from "@/lib/briefd/brain";
import { sourceBackedFormat } from "@/lib/briefd/format";
import type { FormatData } from "@/lib/briefd/types";
import {
  assertCampaignSnapshot,
  sharedCampaign,
  unresolvedRowIds,
  type CampaignSnapshot,
  type OwnerCampaignResponse,
  type SharedCampaignResponse,
} from "./contracts";
import { capabilityMatches, createCapabilitySecret, hashCapabilitySecret } from "./security";

export interface BrainResolutionInput {
  rowId: string;
  kind: "brain";
  specId: string;
  deadline: string | null;
  deadlineRaw?: string;
  notes?: string;
  metadata?: string;
}

export interface ManualResolutionInput {
  rowId: string;
  kind: "manual";
  format: Omit<FormatData, "id" | "specId" | "trust" | "source" | "sourceRow">;
}

export type ResolutionInput = BrainResolutionInput | ManualResolutionInput;
type CampaignWriteFields = Omit<CampaignSnapshot, "id" | "revision" | "formats"> & { resolutions: ResolutionInput[] };
export type CampaignDraft = CampaignWriteFields;
export type CampaignUpdate = CampaignWriteFields & Pick<CampaignSnapshot, "id" | "revision">;

export interface StoredCampaign {
  snapshot: CampaignSnapshot;
  ownerSessionHash: string;
}

export interface StoredShare {
  id: string;
  campaignId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
}

export interface CampaignRepository {
  createCampaign(record: StoredCampaign): Promise<void>;
  findCampaign(id: string): Promise<StoredCampaign | null>;
  replaceCampaign(record: StoredCampaign, expectedRevision: number): Promise<boolean>;
  deleteCampaign(id: string): Promise<void>;
  listShares(campaignId: string): Promise<StoredShare[]>;
  createShare(share: StoredShare): Promise<void>;
  findShareByTokenHash(tokenHash: string): Promise<StoredShare | null>;
  revokeShare(campaignId: string, shareId: string, revokedAt: string): Promise<boolean>;
}

export class PersistenceError extends Error {
  constructor(message: string, readonly status: 400 | 404 | 409) { super(message); }
}

function normalizedSnapshot(snapshot: CampaignSnapshot): CampaignSnapshot {
  assertCampaignSnapshot(snapshot);
  const rows = new Map(snapshot.rows.map((row) => [row.id, row]));
  const formats = snapshot.formats.map((format): FormatData => {
    const row = rows.get(format.id);
    if (!row) throw new PersistenceError("Every resolved format must belong to an imported row.", 400);
    if (format.trust === "user-provided") return structuredClone(format);
    const spec = mediaSpecs.find((candidate) => candidate.id === format.specId);
    if (!spec) throw new PersistenceError("Verified formats must reference a current Brain specification.", 400);
    return sourceBackedFormat(spec, {
      id: row.id,
      deadline: format.deadline,
      deadlineRaw: format.deadlineRaw ?? row.deadlineRaw,
      sourceRow: row.source,
      notes: format.notes ?? row.notes,
      metadata: format.metadata,
    });
  });
  return { ...structuredClone(snapshot), formats };
}

function materializeSnapshot(input: CampaignWriteFields, id: string, revision: number): CampaignSnapshot {
  const rows = new Map(input.rows.map((row) => [row.id, row]));
  const seen = new Set<string>();
  const formats = input.resolutions.map((resolution): FormatData => {
    const row = rows.get(resolution.rowId);
    if (!row || seen.has(resolution.rowId)) throw new PersistenceError("Each resolution must reference one unique imported row.", 400);
    seen.add(resolution.rowId);
    if (resolution.kind === "brain") {
      const spec = mediaSpecs.find((candidate) => candidate.id === resolution.specId);
      if (!spec) throw new PersistenceError("Verified formats must reference a current Brain specification.", 400);
      return sourceBackedFormat(spec, {
        id: row.id,
        deadline: resolution.deadline,
        deadlineRaw: resolution.deadlineRaw ?? row.deadlineRaw,
        sourceRow: row.source,
        notes: resolution.notes ?? row.notes,
        metadata: resolution.metadata,
      });
    }
    return {
      ...structuredClone(resolution.format),
      id: row.id,
      trust: "user-provided",
      sourceRow: row.source,
    };
  });
  const { resolutions: _resolutions, ...fields } = structuredClone(input);
  void _resolutions;
  return normalizedSnapshot({ ...fields, id, revision, formats });
}

export function campaignUpdateFromSnapshot(snapshot: CampaignSnapshot): CampaignUpdate {
  const resolutions: ResolutionInput[] = snapshot.formats.map((format) => format.trust === "verified"
    ? { rowId: format.id, kind: "brain", specId: format.specId!, deadline: format.deadline, deadlineRaw: format.deadlineRaw, notes: format.notes, metadata: format.metadata }
    : {
        rowId: format.id,
        kind: "manual",
        format: {
          categoryTag: format.categoryTag, publisher: format.publisher, formatName: format.formatName,
          sectionCategory: format.sectionCategory, dimensions: format.dimensions, deadline: format.deadline,
          deadlineRaw: format.deadlineRaw, requirements: format.requirements, fileTypes: format.fileTypes,
          notes: format.notes, metadata: format.metadata,
        },
      });
  const { formats: _formats, ...fields } = structuredClone(snapshot);
  void _formats;
  return { ...fields, resolutions };
}

function ownerMatches(record: StoredCampaign | null, secret: string): record is StoredCampaign {
  return Boolean(record && secret && capabilityMatches(secret, record.ownerSessionHash));
}

export class CampaignService {
  constructor(private readonly repository: CampaignRepository, private readonly now = () => new Date()) {}

  async createCampaign(draft: CampaignDraft): Promise<{ ownerSecret: string; response: OwnerCampaignResponse }> {
    const ownerSecret = createCapabilitySecret();
    const snapshot = materializeSnapshot(draft, randomUUID(), 1);
    const record = { snapshot, ownerSessionHash: hashCapabilitySecret(ownerSecret) };
    await this.repository.createCampaign(record);
    return { ownerSecret, response: { access: "edit", campaign: snapshot, shares: [] } };
  }

  async loadOwnerCampaign(id: string, ownerSecret: string): Promise<OwnerCampaignResponse> {
    const record = await this.repository.findCampaign(id);
    if (!ownerMatches(record, ownerSecret)) throw new PersistenceError("Campaign not found.", 404);
    const shares = (await this.repository.listShares(id))
      .filter((share) => !share.revokedAt)
      .map(({ id: shareId, createdAt, expiresAt }) => ({ id: shareId, createdAt, expiresAt }));
    return { access: "edit", campaign: record.snapshot, shares };
  }

  async updateCampaign(input: CampaignUpdate, ownerSecret: string): Promise<OwnerCampaignResponse> {
    const current = await this.repository.findCampaign(input.id);
    if (!ownerMatches(current, ownerSecret)) throw new PersistenceError("Campaign not found.", 404);
    if (input.revision !== current.snapshot.revision) throw new PersistenceError("Campaign changed since it was loaded.", 409);
    const next = materializeSnapshot(input, input.id, input.revision + 1);
    const updated = await this.repository.replaceCampaign({ snapshot: next, ownerSessionHash: current.ownerSessionHash }, input.revision);
    if (!updated) throw new PersistenceError("Campaign changed since it was loaded.", 409);
    return this.loadOwnerCampaign(input.id, ownerSecret);
  }

  async deleteCampaign(id: string, ownerSecret: string): Promise<void> {
    const current = await this.repository.findCampaign(id);
    if (!ownerMatches(current, ownerSecret)) throw new PersistenceError("Campaign not found.", 404);
    await this.repository.deleteCampaign(id);
  }

  async createShare(id: string, ownerSecret: string, expiresAt: string | null = null): Promise<{ id: string; token: string }> {
    const current = await this.repository.findCampaign(id);
    if (!ownerMatches(current, ownerSecret)) throw new PersistenceError("Campaign not found.", 404);
    if (unresolvedRowIds(current.snapshot).length > 0) throw new PersistenceError("Resolve every imported row before sharing.", 409);
    if (expiresAt && (!Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= this.now().getTime())) {
      throw new PersistenceError("Share expiry must be a future date.", 400);
    }
    const token = createCapabilitySecret();
    const share: StoredShare = {
      id: randomUUID(), campaignId: id, tokenHash: hashCapabilitySecret(token),
      createdAt: this.now().toISOString(), expiresAt, revokedAt: null,
    };
    await this.repository.createShare(share);
    return { id: share.id, token };
  }

  async loadSharedCampaign(token: string): Promise<SharedCampaignResponse> {
    const share = await this.repository.findShareByTokenHash(hashCapabilitySecret(token));
    const now = this.now().getTime();
    if (!share || share.revokedAt || (share.expiresAt && Date.parse(share.expiresAt) <= now)) throw new PersistenceError("Shared campaign not found.", 404);
    const campaign = await this.repository.findCampaign(share.campaignId);
    if (!campaign) throw new PersistenceError("Shared campaign not found.", 404);
    return sharedCampaign(campaign.snapshot);
  }

  async revokeShare(campaignId: string, shareId: string, ownerSecret: string): Promise<void> {
    const current = await this.repository.findCampaign(campaignId);
    if (!ownerMatches(current, ownerSecret)) throw new PersistenceError("Campaign not found.", 404);
    const revoked = await this.repository.revokeShare(campaignId, shareId, this.now().toISOString());
    if (!revoked) throw new PersistenceError("Share link not found.", 404);
  }
}
