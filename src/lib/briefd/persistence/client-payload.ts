import type { FormatData } from "@/lib/briefd/types";
import type { ParsedMediaPlan } from "@/lib/jobOrchestrator";
import type { CampaignDraft, ResolutionInput } from "./service";

function resolutionFromFormat(format: FormatData): ResolutionInput {
  if (format.trust === "verified") {
    if (!format.specId) throw new Error(`Verified format ${format.id} is missing its Brain specification.`);
    return {
      rowId: format.id,
      kind: "brain",
      specId: format.specId,
      deadline: format.deadline,
      deadlineRaw: format.deadlineRaw,
      notes: format.notes,
      metadata: format.metadata,
    };
  }

  return {
    rowId: format.id,
    kind: "manual",
    format: {
      categoryTag: format.categoryTag,
      publisher: format.publisher,
      formatName: format.formatName,
      sectionCategory: format.sectionCategory,
      dimensions: format.dimensions,
      deadline: format.deadline,
      deadlineRaw: format.deadlineRaw,
      requirements: format.requirements,
      fileTypes: format.fileTypes,
      notes: format.notes,
      metadata: format.metadata,
    },
  };
}

export function campaignDraftFromImport(input: {
  clientName: string;
  campaignName: string;
  sourceFilename: string;
  plan: ParsedMediaPlan;
  formats: FormatData[];
}): CampaignDraft {
  return {
    clientName: input.clientName,
    campaignName: input.campaignName,
    sourceFilename: input.sourceFilename,
    sheetName: input.plan.sheetName,
    headerRow: input.plan.headerRow,
    columnMapping: input.plan.mapping,
    rows: input.plan.rows,
    resolutions: input.formats.map(resolutionFromFormat),
  };
}

export function workspaceFormatUrl(pathname: string, query: string, formatId: string | null): string {
  const next = new URLSearchParams(query);
  if (formatId) next.set("format", formatId);
  else next.delete("format");
  const serialized = next.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}
