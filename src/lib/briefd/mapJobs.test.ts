import { describe, it, expect } from "vitest";
import { matchToBrain, type MediaPlanRow } from "@/lib/jobOrchestrator";
import { mapJobsToFormats } from "./mapJobs";

function mediaPlanRow(overrides: Partial<MediaPlanRow> = {}): MediaPlanRow {
    return {
        id: "row-2-test",
        source: { sheetName: "Mediaplan", rowNumber: 2 },
        campaign: "Black Friday",
        publisher: "SvD",
        format: "Helsida (Stående)",
        deadline: "2026-09-24",
        deadlineRaw: "2026-09-24",
        notes: "",
        rawValues: {},
        ...overrides,
    };
}

describe("mapJobsToFormats", () => {
    it("maps a matched print job to a complete format card", () => {
        const job = matchToBrain(mediaPlanRow());
        const { formats, unmatched, campaignName } = mapJobsToFormats([job]);

        expect(unmatched).toHaveLength(0);
        expect(campaignName).toBe("Black Friday");
        const card = formats[0];
        expect(card.sectionCategory).toBe("Newsprint & Magazines (Print)");
        expect(card.categoryTag).toBe("Print");
        expect(card.dimensions).toBe("248 × 360 mm");
        expect(card.deadline).toBe("24 Sep");
        expect(card.safeZone).toContain("Text 10 mm");
        expect(card.safeZone).toContain("Bleed 3 mm");
        expect(card.fileType).toBe("PDF/X-1a:2001");
        expect(card.specsUrl).toBe("");
    });

    it("uses pixel dimensions and simplified ratios for digital specs", () => {
        const job = matchToBrain(mediaPlanRow({
            campaign: "BF",
            publisher: "Clear Channel",
            format: "Play Digital",
            deadline: null,
            deadlineRaw: "",
        }));
        const { formats } = mapJobsToFormats([job]);
        expect(formats[0].dimensions).toBe("1080 × 1920 px");
        expect(formats[0].ratioLabel).toBe("9:16");
        expect(formats[0].deadline).toBe("TBD");
    });

    it("reports unmatched rows separately instead of faking cards", () => {
        const jobs = [
            matchToBrain(mediaPlanRow({ campaign: "BF" })),
            matchToBrain(mediaPlanRow({ campaign: "BF", publisher: "Aftonbladet", format: "Panorama" })),
        ];
        const { formats, unmatched } = mapJobsToFormats(jobs);
        expect(formats).toHaveLength(1);
        expect(unmatched).toHaveLength(1);
        expect(unmatched[0].publisher).toBe("Aftonbladet");
        expect(unmatched[0].error).toContain("Aftonbladet");
    });
});
