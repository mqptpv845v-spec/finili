export type SectionCategory =
  | "Social Media (SoMe)"
  | "Out of Home (OOH & DOOH)"
  | "Newsprint & Magazines (Print)"
  | "Digital Display & High-Impact";

export type CategoryTag = "SoMe" | "OOH" | "DOOH" | "Print" | "Display" | "High-Impact";

export interface FormatData {
  id: string;
  categoryTag: CategoryTag;
  publisher: string;
  formatName: string;
  sectionCategory: SectionCategory;
  dimensions: string;
  widthRatio: number;
  heightRatio: number;
  ratioLabel: string;
  deadline: string;
  safeZone: string;
  fileType: string;
  specsLabel: string;
  specsUrl: string;
  metadata?: string;
  anomaly?: {
    message: string;
    standard: string;
  };
}
