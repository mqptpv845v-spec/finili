import { describe, expect, it } from "vitest";
import type { FormatData } from "@/lib/briefd/types";
import type { ParsedMediaPlan } from "@/lib/jobOrchestrator";
import { campaignDraftFromImport, workspaceFormatUrl } from "./client-payload";

const plan: ParsedMediaPlan = {
  sheetName: "Plan",
  availableSheets: ["Plan"],
  headerRow: 2,
  columns: [{ index: 1, label: "Publisher" }, { index: 2, label: "Format" }],
  mapping: { publisher: 1, format: 2 },
  rows: [
    {
      id: "row-1",
      source: { sheetName: "Plan", rowNumber: 3 },
      campaign: "Launch",
      publisher: "Aftonbladet",
      format: "Panorama",
      deadline: "2026-09-24",
      deadlineRaw: "24/09/2026",
      notes: "",
      rawValues: { Publisher: "Aftonbladet", Format: "Panorama" },
    },
  ],
  warnings: [],
};

const verified: FormatData = {
  id: "row-1",
  specId: "aftonbladet-panorama",
  trust: "verified",
  categoryTag: "Display",
  publisher: "Aftonbladet",
  formatName: "Panorama",
  sectionCategory: "Digital Display & High-Impact",
  dimensions: { width: 980, height: 240, unit: "px" },
  deadline: "2026-09-24",
  deadlineRaw: "24/09/2026",
  requirements: {},
  fileTypes: ["JPG"],
  sourceRow: { sheetName: "Plan", rowNumber: 3 },
  source: { authority: "publisher", title: "Specification", url: "https://example.com/spec", verifiedAt: "2026-08-20" },
};

describe("campaignDraftFromImport", () => {
  it("keeps import provenance while sending verified rows as Brain references", () => {
    const draft = campaignDraftFromImport({
      clientName: "Acme.xlsx",
      campaignName: "Launch",
      sourceFilename: "Acme.xlsx",
      plan,
      formats: [verified],
    });

    expect(draft).toMatchObject({
      clientName: "Acme.xlsx",
      campaignName: "Launch",
      sourceFilename: "Acme.xlsx",
      sheetName: "Plan",
      headerRow: 2,
      columnMapping: { publisher: 1, format: 2 },
      rows: plan.rows,
      resolutions: [{ rowId: "row-1", kind: "brain", specId: "aftonbladet-panorama", deadline: "2026-09-24" }],
    });
  });

  it("strips evidence claims from user-provided resolutions", () => {
    const manual: FormatData = { ...verified, trust: "user-provided", specId: undefined, source: undefined };
    const draft = campaignDraftFromImport({
      clientName: "Acme",
      campaignName: "Launch",
      sourceFilename: "plan.xlsx",
      plan,
      formats: [manual],
    });

    expect(draft.resolutions[0]).toMatchObject({ rowId: "row-1", kind: "manual", format: { publisher: "Aftonbladet" } });
    expect(JSON.stringify(draft.resolutions[0])).not.toContain("specId");
    expect(JSON.stringify(draft.resolutions[0])).not.toContain("sourceRow");
    expect(JSON.stringify(draft.resolutions[0])).not.toContain("source\"");
  });

  it("refuses a verified row without a Brain specification id", () => {
    expect(() => campaignDraftFromImport({
      clientName: "Acme",
      campaignName: "Launch",
      sourceFilename: "plan.xlsx",
      plan,
      formats: [{ ...verified, specId: undefined }],
    })).toThrow("missing its Brain specification");
  });
});

describe("workspaceFormatUrl", () => {
  it("preserves owner and share capabilities while selecting and closing formats", () => {
    expect(workspaceFormatUrl("/briefd", "campaign=campaign-id", "row 1"))
      .toBe("/briefd?campaign=campaign-id&format=row+1");
    expect(workspaceFormatUrl("/briefd", "share=secret&format=row-1", null))
      .toBe("/briefd?share=secret");
  });
});
