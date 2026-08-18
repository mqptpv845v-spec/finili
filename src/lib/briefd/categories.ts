import type { SectionCategory } from "./types";

// Single source of truth for the four Briefd categories.
// Every view (sections, sidebar, calendar, spreadsheet) styles itself from
// this record — adding a category means editing exactly this file.
// Colors are restricted to the tone-on-tone pairs in TYPOGRAPHY_RULES.md rule 7.
export interface CategoryMeta {
  /** Stable slug, used as DOM id for scroll targets */
  key: string;
  /** Order in the workspace, "01".."04" */
  number: string;
  /** Human title used in section headers and the sidebar */
  title: string;
  /** Short label used in the calendar legend */
  shortLabel: string;
  /** One-line description shown under the section title */
  description: string;
  /** 10px stripe on top of white format cards */
  stripe: string;
  /** Dot marker (spreadsheet rows, legends) */
  dot: string;
  /** Row hover tint in the spreadsheet */
  hoverBg: string;
  /** Deep-colored event bar in the calendar */
  calendarBar: string;
  /** Full-bleed section background in the workspace */
  sectionBg: string;
  /** Title color on the section background */
  titleColor: string;
  /** Description color on the section background */
  descColor: string;
  /** Bordered counter chip in the section header */
  badgeBorder: string;
  /** Divider lines inside the section */
  dividerColor: string;
}

export const CATEGORIES: Record<SectionCategory, CategoryMeta> = {
  "Social Media (SoMe)": {
    key: "some",
    number: "01",
    title: "Social Media (SoMe)",
    shortLabel: "Social Media",
    description: "Meta, Snapchat & LinkedIn stories, feed and video formats",
    stripe: "bg-yellow",
    dot: "bg-taupe",
    hoverBg: "hover:bg-yellow/60",
    calendarBar: "bg-taupe",
    sectionBg: "bg-taupe",
    titleColor: "text-yellow",
    descColor: "text-yellow/80",
    badgeBorder: "border-yellow/40 text-yellow",
    dividerColor: "border-yellow/20",
  },
  "Digital Display & High-Impact": {
    key: "display",
    number: "02",
    title: "Digital Banners",
    shortLabel: "Digital Banners",
    description: "Programmatic, desktop panorama and mobile topscroll",
    stripe: "bg-magenta",
    dot: "bg-plum",
    hoverBg: "hover:bg-magenta/35",
    calendarBar: "bg-plum",
    sectionBg: "bg-plum",
    titleColor: "text-magenta",
    descColor: "text-magenta/80",
    badgeBorder: "border-magenta/40 text-magenta",
    dividerColor: "border-magenta/20",
  },
  "Out of Home (OOH & DOOH)": {
    key: "ooh",
    number: "03",
    title: "Out of Home (OOH)",
    shortLabel: "Out of Home",
    description: "Classic printed outdoor placements and digital series",
    stripe: "bg-cyan",
    dot: "bg-petrol",
    hoverBg: "hover:bg-cyan/30",
    calendarBar: "bg-petrol",
    sectionBg: "bg-petrol",
    titleColor: "text-cyan",
    descColor: "text-cyan/80",
    badgeBorder: "border-cyan/40 text-cyan",
    dividerColor: "border-cyan/20",
  },
  "Newsprint & Magazines (Print)": {
    key: "print",
    number: "04",
    title: "Printed Media",
    shortLabel: "Printed Media",
    description: "Dagens industri tabloid, half page and magazine with ICC profiles",
    stripe: "bg-light border-b border-black/10",
    dot: "bg-graphite",
    hoverBg: "hover:bg-light",
    calendarBar: "bg-graphite",
    sectionBg: "bg-graphite",
    titleColor: "text-white",
    descColor: "text-white/70",
    badgeBorder: "border-white/30 text-white",
    dividerColor: "border-white/20",
  },
};

export const CATEGORY_ORDER: SectionCategory[] = [
  "Social Media (SoMe)",
  "Digital Display & High-Impact",
  "Out of Home (OOH & DOOH)",
  "Newsprint & Magazines (Print)",
];
