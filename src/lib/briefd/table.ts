import { deadlineSortValue, formatDeadline, formatDimensions, formatRequirements, ratioLabel } from "./format";
import type { FormatData } from "./types";

function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function sortFormats(formats: FormatData[], field: "deadline" | "formatName" | "publisher" | "category" | "dimensions", ascending = true): FormatData[] {
  return [...formats].sort((a, b) => {
    let comparison: number;
    if (field === "deadline") comparison = deadlineSortValue(a.deadline) - deadlineSortValue(b.deadline);
    else if (field === "dimensions") comparison = formatDimensions(a.dimensions).localeCompare(formatDimensions(b.dimensions));
    else if (field === "category") comparison = a.sectionCategory.localeCompare(b.sectionCategory);
    else comparison = a[field].localeCompare(b[field]);
    return ascending ? comparison : -comparison;
  });
}

export function formatsToCsv(formats: FormatData[]): string {
  const headers = ["Format", "Channel", "Publisher", "Dimensions", "Ratio", "Requirements", "File types", "Deadline", "Trust", "Source"];
  const rows = formats.map((format) => [
    format.formatName,
    format.sectionCategory,
    format.publisher,
    formatDimensions(format.dimensions),
    ratioLabel(format.dimensions),
    formatRequirements(format.requirements),
    format.fileTypes.join(", "),
    format.deadline ?? "",
    format.trust,
    format.source?.url ?? "",
  ]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function formatsToTsv(formats: FormatData[]): string {
  return [
    ["Format", "Publisher", "Dimensions", "Requirements", "File types", "Deadline", "Trust"].join("\t"),
    ...formats.map((format) => [
      format.formatName,
      format.publisher,
      formatDimensions(format.dimensions),
      formatRequirements(format.requirements),
      format.fileTypes.join(", "),
      formatDeadline(format.deadline, { year: true }),
      format.trust,
    ].join("\t")),
  ].join("\n");
}

export function safeExportName(campaignName: string): string {
  const base = campaignName.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  return `${base || "briefd-campaign"}.csv`;
}
