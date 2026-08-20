import { describe, expect, it } from "vitest";
import { matchToBrain, type MediaPlanRow } from "@/lib/jobOrchestrator";
import { markUnsupportedPdfJobs } from "./pdfOrchestration";

function row(publisher: string, format: string): MediaPlanRow {
  return { id: `row-${publisher}`, source: { sheetName: "Plan", rowNumber: 2 }, campaign: "Launch", publisher, format, deadline: null, deadlineRaw: "", notes: "", rawValues: {} };
}

describe("local PDF orchestration", () => {
  it("keeps print PDF jobs exportable", () => {
    const [job] = markUnsupportedPdfJobs([matchToBrain(row("Ena Håbo-Tidningen", "Print Spread"))]);
    expect(job.status).toBe("pending");
    expect(job.generatedFileName).toMatch(/\.pdf$/);
  });

  it("rejects digital asset jobs before invoking InDesign", () => {
    const [job] = markUnsupportedPdfJobs([matchToBrain(row("LinkedIn", "Single Image — Square"))]);
    expect(job.status).toBe("error");
    expect(job.error).toContain("not a PDF deliverable");
  });
});
