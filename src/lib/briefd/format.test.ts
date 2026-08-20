import { describe, expect, it } from "vitest";
import { mediaSpecs } from "./brain";
import { resolveManually, resolveWithSpec } from "./corrections";
import { buildCalendarMonth, formatsByDeadline, moveMonth } from "./calendar";
import { deadlineSortValue, formatDimensions, ratioLabel } from "./format";
import { formatsToCsv, safeExportName, sortFormats } from "./table";
import type { UnmatchedRow } from "./mapJobs";

const row: UnmatchedRow = {
  id: "row-2-example",
  source: { sheetName: "Plan", rowNumber: 2 },
  publisher: "Unknown",
  format: "Custom",
  deadline: "2027-01-04",
  deadlineRaw: "4 Jan 2027",
  error: "No match",
};

describe("Briefd format helpers", () => {
  it("keeps dimensions structured and produces stable ratios", () => {
    expect(formatDimensions({ width: 1080, height: 1920, unit: "px" })).toBe("1080 × 1920 px");
    expect(ratioLabel({ width: 1080, height: 1920, unit: "px" })).toBe("9:16");
    expect(deadlineSortValue(null)).toBe(Number.POSITIVE_INFINITY);
  });

  it("marks Brain assignments verified and manual corrections user-provided", () => {
    const verified = resolveWithSpec(row, mediaSpecs[0].id);
    expect(verified.trust).toBe("verified");
    expect(verified.source?.url).toMatch(/^https:/);
    expect(verified.sourceRow).toEqual(row.source);

    const manual = resolveManually(row, {
      publisher: "Agency supplied", formatName: "Custom", width: 320, height: 100,
      unit: "px", deadline: null, sectionCategory: "Digital Display & High-Impact", categoryTag: "Display",
    });
    expect(manual.trust).toBe("user-provided");
    expect(manual.source).toBeUndefined();
    expect(() => resolveManually(row, {
      publisher: "Agency supplied", formatName: "Custom", width: 0, height: 100,
      unit: "px", deadline: null, sectionCategory: "Digital Display & High-Impact", categoryTag: "Display",
    })).toThrow(/positive/);
  });

  it("builds Monday-first calendars and crosses year boundaries", () => {
    const weeks = buildCalendarMonth("2026-02");
    expect(weeks[0].days[0].isoDate).toBe("2026-01-26");
    expect(weeks.at(-1)?.days.at(-1)?.isoDate).toBe("2026-03-01");
    expect(moveMonth("2026-12", 1)).toBe("2027-01");
  });

  it("groups ISO deadlines and leaves null deadlines unscheduled", () => {
    const verified = resolveWithSpec(row, mediaSpecs[0].id);
    const unscheduled = { ...verified, id: "none", deadline: null };
    const grouped = formatsByDeadline([verified, unscheduled]);
    expect(grouped.get("2027-01-04")).toEqual([verified]);
    expect(grouped.has("")).toBe(false);
  });

  it("sorts true dates and exports visible rows with safe CSV cells", () => {
    const first = resolveWithSpec({ ...row, id: "first", deadline: "2026-12-31" }, mediaSpecs[0].id);
    const second = { ...first, id: "second", formatName: '=HYPERLINK("bad")', deadline: "2027-01-01" };
    const noDate = { ...first, id: "none", deadline: null };
    expect(sortFormats([noDate, second, first], "deadline").map((format) => format.id)).toEqual(["first", "second", "none"]);
    expect(formatsToCsv([second])).toContain("'=HYPERLINK");
    expect(safeExportName("Spring / Launch 2027")).toBe("spring-launch-2027.csv");
  });
});
