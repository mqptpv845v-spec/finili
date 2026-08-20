import { mediaSpecs } from "./brain";
import { sourceBackedFormat } from "./format";
import type { CategoryTag, DimensionUnit, FormatData, SectionCategory } from "./types";
import type { UnmatchedRow } from "./mapJobs";

export interface ManualCorrection {
  publisher: string;
  formatName: string;
  width: number;
  height: number;
  unit: DimensionUnit;
  deadline: string | null;
  sectionCategory: SectionCategory;
  categoryTag: CategoryTag;
  fileTypes?: string[];
}

function requireCorrectedDeadline(row: UnmatchedRow, deadline: string | null): void {
  if (row.deadline === null && row.deadlineRaw.trim() !== "" && deadline === null) {
    throw new Error("Enter a valid deadline for the unrecognized workbook date.");
  }
  if (deadline) {
    const match = deadline.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const parsed = match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : null;
    if (!match || parsed?.toISOString().slice(0, 10) !== deadline) throw new Error("Deadline must be a valid date using YYYY-MM-DD.");
  }
}

export function resolveWithSpec(row: UnmatchedRow, specId: string, deadline: string | null = row.deadline): FormatData {
  const spec = mediaSpecs.find((candidate) => candidate.id === specId);
  if (!spec) throw new Error("Choose a verified specification.");
  requireCorrectedDeadline(row, deadline);
  return sourceBackedFormat(spec, {
    id: row.id,
    deadline,
    deadlineRaw: deadline ?? row.deadlineRaw,
    sourceRow: row.source,
  });
}

export function resolveManually(row: UnmatchedRow, input: ManualCorrection): FormatData {
  if (!input.publisher.trim()) throw new Error("Publisher is required.");
  if (!input.formatName.trim()) throw new Error("Format name is required.");
  if (!Number.isFinite(input.width) || input.width <= 0 || !Number.isFinite(input.height) || input.height <= 0) {
    throw new Error("Width and height must be positive numbers.");
  }
  requireCorrectedDeadline(row, input.deadline);
  return {
    id: row.id,
    categoryTag: input.categoryTag,
    publisher: input.publisher.trim(),
    formatName: input.formatName.trim(),
    sectionCategory: input.sectionCategory,
    dimensions: { width: input.width, height: input.height, unit: input.unit },
    deadline: input.deadline,
    deadlineRaw: input.deadline ?? row.deadlineRaw,
    requirements: {},
    fileTypes: input.fileTypes?.filter(Boolean) ?? [],
    trust: "user-provided",
    sourceRow: row.source,
  };
}
