export type SectionCategory =
  | "Social Media (SoMe)"
  | "Out of Home (OOH & DOOH)"
  | "Newsprint & Magazines (Print)"
  | "Digital Display & High-Impact";

export type CategoryTag = "SoMe" | "OOH" | "DOOH" | "Print" | "Display" | "High-Impact";

export type DimensionUnit = "px" | "mm";
export type SpecTrust = "verified" | "user-provided";

export interface FormatDimensions {
  width: number;
  height: number;
  unit: DimensionUnit;
  visibleWidth?: number;
  visibleHeight?: number;
}

export interface FormatRequirements {
  bleedMm?: number;
  textSafeMm?: number;
  imageSafeMm?: number;
  maxFileSizeKb?: number;
  resolutionDpi?: number;
  durationSeconds?: number[];
  colorProfile?: string;
}

export interface FormatSource {
  title: string;
  url: string;
  verifiedAt: string;
  authority: "publisher" | "platform" | "publisher-profile";
}

export interface SourceRow {
  sheetName: string;
  rowNumber: number;
}

export interface FormatData {
  id: string;
  specId?: string;
  categoryTag: CategoryTag;
  publisher: string;
  formatName: string;
  sectionCategory: SectionCategory;
  dimensions: FormatDimensions;
  deadline: string | null;
  deadlineRaw?: string;
  requirements: FormatRequirements;
  fileTypes: string[];
  trust: SpecTrust;
  source?: FormatSource;
  sourceRow?: SourceRow;
  notes?: string;
  metadata?: string;
}
