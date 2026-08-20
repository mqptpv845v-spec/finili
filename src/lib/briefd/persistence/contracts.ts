import type { MediaPlanColumnMapping, MediaPlanRow } from "@/lib/jobOrchestrator";
import type { CategoryTag, FormatData, SectionCategory } from "@/lib/briefd/types";

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

export type SharedFormatData = Omit<FormatData, "sourceRow" | "deadlineRaw" | "metadata">;

export interface SharedCampaignResponse {
  access: "view";
  campaign: Pick<CampaignSnapshot, "id" | "revision" | "clientName" | "campaignName"> & {
    formats: SharedFormatData[];
  };
}

export function unresolvedRowIds(snapshot: Pick<CampaignSnapshot, "rows" | "formats">): string[] {
  const resolvedIds = new Set(snapshot.formats.map((format) => format.id));
  return snapshot.rows.filter((row) => !resolvedIds.has(row.id)).map((row) => row.id);
}

export function sharedCampaign(snapshot: CampaignSnapshot): SharedCampaignResponse {
  if (unresolvedRowIds(snapshot).length > 0) throw new Error("Resolve every imported row before sharing.");
  const formats = snapshot.formats.map(({ sourceRow, deadlineRaw, metadata, ...format }) => {
    void sourceRow;
    void deadlineRaw;
    void metadata;
    return format;
  });
  return {
    access: "view",
    campaign: {
      id: snapshot.id,
      revision: snapshot.revision,
      clientName: snapshot.clientName,
      campaignName: snapshot.campaignName,
      formats,
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
  if (!isRecord(candidate.columnMapping)) throw new Error("Column mapping is required.");
  const mappingValues: number[] = [];
  for (const [key, column] of Object.entries(candidate.columnMapping)) {
    if (!MEDIA_PLAN_FIELDS.has(key) || !Number.isInteger(column) || Number(column) < 1) throw new Error("Column mapping contains an invalid field or column.");
    mappingValues.push(Number(column));
  }
  if (new Set(mappingValues).size !== mappingValues.length) throw new Error("Each media-plan field must map to a different column.");
  if (!Array.isArray(candidate.rows) || !Array.isArray(candidate.formats)) throw new Error("Campaign rows and formats are required.");
  const rowIds = new Set<string>();
  for (const row of candidate.rows) {
    if (!row || typeof row.id !== "string" || rowIds.has(row.id)) throw new Error("Campaign row ids must be present and unique.");
    if (!isRecord(row.source) || typeof row.source.sheetName !== "string" || !Number.isInteger(row.source.rowNumber) || row.source.rowNumber < 1) throw new Error("Campaign row source is invalid.");
    if (![row.campaign, row.publisher, row.format, row.deadlineRaw, row.notes].every((field) => typeof field === "string")) throw new Error("Campaign row text fields are invalid.");
    if (!isIsoDateOrNull(row.deadline) || !isStringRecord(row.rawValues)) throw new Error("Campaign row data is invalid.");
    rowIds.add(row.id);
  }
  const formatIds = new Set<string>();
  for (const format of candidate.formats) {
    if (!format || typeof format.id !== "string" || formatIds.has(format.id) || !rowIds.has(format.id)) throw new Error("Every format must resolve one unique campaign row.");
    if (format.trust !== "verified" && format.trust !== "user-provided") throw new Error("Format trust state is invalid.");
    if (!SECTION_CATEGORIES.has(format.sectionCategory) || !CATEGORY_TAGS.has(format.categoryTag)) throw new Error("Format category is invalid.");
    if (!format.publisher?.trim() || !format.formatName?.trim()) throw new Error("Format publisher and name are required.");
    if (!Number.isFinite(format.dimensions?.width) || format.dimensions.width <= 0 || !Number.isFinite(format.dimensions?.height) || format.dimensions.height <= 0) throw new Error("Format dimensions must be positive.");
    if (format.dimensions.unit !== "px" && format.dimensions.unit !== "mm") throw new Error("Format dimension unit is invalid.");
    if (!isIsoDateOrNull(format.deadline) || !Array.isArray(format.fileTypes) || !format.fileTypes.every((fileType) => typeof fileType === "string")) throw new Error("Format delivery data is invalid.");
    if (!isRecord(format.requirements) || !Object.values(format.requirements).every(validRequirementValue)) throw new Error("Format requirements are invalid.");
    const matchingRow = candidate.rows.find((row) => row.id === format.id)!;
    if (format.sourceRow && (format.sourceRow.sheetName !== matchingRow.source.sheetName || format.sourceRow.rowNumber !== matchingRow.source.rowNumber)) throw new Error("Format source row must match its imported row.");
    if (format.trust === "verified" && (!format.specId || !format.source)) throw new Error("Verified formats require a Brain spec and source evidence.");
    if (format.trust === "user-provided" && (format.specId || format.source)) throw new Error("User-provided formats cannot claim verified evidence.");
    if (format.source && (!format.source.url.startsWith("https://") || !ISO_DATE.test(format.source.verifiedAt) || !SOURCE_AUTHORITIES.has(format.source.authority))) throw new Error("Format source evidence is invalid.");
    formatIds.add(format.id);
  }
}

const MEDIA_PLAN_FIELDS = new Set(["campaign", "publisher", "format", "deadline", "notes"]);
const SECTION_CATEGORIES = new Set<SectionCategory>(["Social Media (SoMe)", "Out of Home (OOH & DOOH)", "Newsprint & Magazines (Print)", "Digital Display & High-Impact"]);
const CATEGORY_TAGS = new Set<CategoryTag>(["SoMe", "OOH", "DOOH", "Print", "Display", "High-Impact"]);
const SOURCE_AUTHORITIES = new Set(["publisher", "platform", "publisher-profile"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value && typeof value === "object" && !Array.isArray(value)); }
function isStringRecord(value: unknown): value is Record<string, string> { return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string"); }
function isIsoDateOrNull(value: unknown): value is string | null { return value === null || (typeof value === "string" && ISO_DATE.test(value)); }
function validRequirementValue(value: unknown): boolean {
  return value === undefined || (typeof value === "number" && Number.isFinite(value) && value >= 0) || (Array.isArray(value) && value.every((entry) => typeof entry === "number" && Number.isFinite(entry) && entry >= 0)) || typeof value === "string";
}
