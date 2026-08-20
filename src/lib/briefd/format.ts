import type { MediaSpec } from "./brain";
import type { FormatData, FormatDimensions, FormatRequirements } from "./types";

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(Math.abs(b), Math.abs(a) % Math.abs(b));
}

export function formatDimensions(dimensions: FormatDimensions): string {
  return `${dimensions.width} × ${dimensions.height} ${dimensions.unit}`;
}

export function ratioLabel(dimensions: FormatDimensions): string {
  const { width, height } = dimensions;
  if (Number.isInteger(width) && Number.isInteger(height)) {
    const divisor = gcd(width, height);
    const simpleWidth = width / divisor;
    const simpleHeight = height / divisor;
    if (simpleWidth <= 32 && simpleHeight <= 32) return `${simpleWidth}:${simpleHeight}`;
  }
  return width >= height
    ? `${(width / height).toFixed(2)}:1`
    : `1:${(height / width).toFixed(2)}`;
}

export function formatDeadline(value: string | null, options: { year?: boolean } = {}): string {
  if (!value) return "TBD";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "TBD";
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(date.getTime())) return "TBD";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...(options.year ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  }).format(date);
}

export function deadlineSortValue(value: string | null): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

export function formatRequirements(requirements: FormatRequirements): string {
  const parts: string[] = [];
  if (requirements.textSafeMm != null) parts.push(`Text ${requirements.textSafeMm} mm`);
  if (requirements.imageSafeMm != null) parts.push(`Image ${requirements.imageSafeMm} mm`);
  if (requirements.bleedMm != null) parts.push(`Bleed ${requirements.bleedMm} mm`);
  if (requirements.maxFileSizeKb != null) parts.push(`Max ${requirements.maxFileSizeKb} KB`);
  return parts.length > 0 ? parts.join(" · ") : "No additional requirement recorded";
}

export function dimensionsFromSpec(spec: MediaSpec): FormatDimensions {
  if (spec.dimensions.width_px != null && spec.dimensions.height_px != null) {
    return { width: spec.dimensions.width_px, height: spec.dimensions.height_px, unit: "px" };
  }
  return {
    width: spec.dimensions.width_mm ?? 1,
    height: spec.dimensions.height_mm ?? 1,
    unit: "mm",
    visibleWidth: spec.dimensions.visible_width_mm,
    visibleHeight: spec.dimensions.visible_height_mm,
  };
}

export function requirementsFromSpec(spec: MediaSpec): FormatRequirements {
  return {
    bleedMm: spec.bleed_mm,
    textSafeMm: spec.safe_zones?.text_mm,
    imageSafeMm: spec.safe_zones?.image_mm,
    maxFileSizeKb: spec.delivery?.max_file_size_kb,
    resolutionDpi: spec.delivery?.resolution_dpi,
    durationSeconds: spec.delivery?.duration_seconds,
    colorProfile: spec.color?.icc_profile ?? spec.color?.color_space,
  };
}

export function sourceBackedFormat(
  spec: MediaSpec,
  input: Pick<FormatData, "id" | "deadline"> & Partial<Pick<FormatData, "sourceRow" | "deadlineRaw" | "notes" | "metadata">>,
): FormatData {
  const source = spec.sources[0];
  return {
    id: input.id,
    specId: spec.id,
    categoryTag: spec.category_tag,
    publisher: spec.publisher,
    formatName: spec.name,
    sectionCategory: spec.category,
    dimensions: dimensionsFromSpec(spec),
    deadline: input.deadline,
    deadlineRaw: input.deadlineRaw,
    requirements: requirementsFromSpec(spec),
    fileTypes: spec.delivery?.file_types ?? [],
    trust: "verified",
    source: source && {
      title: source.title,
      url: source.url,
      verifiedAt: source.verified_at,
      authority: source.authority,
    },
    sourceRow: input.sourceRow,
    notes: input.notes,
    metadata: input.metadata,
  };
}
