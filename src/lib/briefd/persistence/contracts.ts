import type { MediaPlanColumnMapping, MediaPlanRow } from "@/lib/jobOrchestrator";
import type { FormatData } from "@/lib/briefd/types";

export interface CampaignSnapshot {
  id: string;
  revision: number;
  clientName: string;
  campaignName: string;
  sourceFilename?: string;
  sheetName: string;
  headerRow: number;
  columnMapping: MediaPlanColumnMapping;
  rows: MediaPlanRow[];
  formats: FormatData[];
}

export interface OwnerCampaignResponse {
  access: "edit";
  campaign: CampaignSnapshot;
  shares: { id: string; createdAt: string; expiresAt: string | null }[];
}

export interface SharedCampaignResponse {
  access: "view";
  campaign: Pick<CampaignSnapshot, "id" | "revision" | "clientName" | "campaignName" | "formats">;
}

export function unresolvedRowIds(snapshot: Pick<CampaignSnapshot, "rows" | "formats">): string[] {
  const resolvedIds = new Set(snapshot.formats.map((format) => format.id));
  return snapshot.rows.filter((row) => !resolvedIds.has(row.id)).map((row) => row.id);
}

export function sharedCampaign(snapshot: CampaignSnapshot): SharedCampaignResponse {
  if (unresolvedRowIds(snapshot).length > 0) throw new Error("Resolve every imported row before sharing.");
  return {
    access: "view",
    campaign: {
      id: snapshot.id,
      revision: snapshot.revision,
      clientName: snapshot.clientName,
      campaignName: snapshot.campaignName,
      formats: snapshot.formats,
    },
  };
}

export function assertCampaignSnapshot(value: unknown): asserts value is CampaignSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Campaign payload must be an object.");
  const candidate = value as Partial<CampaignSnapshot>;
  if (typeof candidate.id !== "string" || candidate.id.length === 0) throw new Error("Campaign id is required.");
  if (!Number.isInteger(candidate.revision) || Number(candidate.revision) < 1) throw new Error("Campaign revision is invalid.");
  if (typeof candidate.clientName !== "string" || typeof candidate.campaignName !== "string") throw new Error("Campaign names are invalid.");
  if (typeof candidate.sheetName !== "string" || !Number.isInteger(candidate.headerRow) || Number(candidate.headerRow) < 1) throw new Error("Campaign import metadata is invalid.");
  if (!candidate.columnMapping || typeof candidate.columnMapping !== "object") throw new Error("Column mapping is required.");
  if (!Array.isArray(candidate.rows) || !Array.isArray(candidate.formats)) throw new Error("Campaign rows and formats are required.");
  const rowIds = new Set<string>();
  for (const row of candidate.rows) {
    if (!row || typeof row.id !== "string" || rowIds.has(row.id)) throw new Error("Campaign row ids must be present and unique.");
    rowIds.add(row.id);
  }
  const formatIds = new Set<string>();
  for (const format of candidate.formats) {
    if (!format || typeof format.id !== "string" || formatIds.has(format.id) || !rowIds.has(format.id)) throw new Error("Every format must resolve one unique campaign row.");
    if (!Number.isFinite(format.dimensions?.width) || format.dimensions.width <= 0 || !Number.isFinite(format.dimensions?.height) || format.dimensions.height <= 0) throw new Error("Format dimensions must be positive.");
    if (format.trust === "verified" && (!format.specId || !format.source)) throw new Error("Verified formats require a Brain spec and source evidence.");
    if (format.trust === "user-provided" && (format.specId || format.source)) throw new Error("User-provided formats cannot claim verified evidence.");
    formatIds.add(format.id);
  }
}
