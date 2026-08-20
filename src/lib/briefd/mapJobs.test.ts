import { describe, it, expect } from "vitest";
import { matchToBrain, type MediaPlanRow } from "@/lib/jobOrchestrator";
import { mapJobsToFormats } from "./mapJobs";
import { formatDeadline, formatDimensions, formatRequirements, ratioLabel } from "./format";

function mediaPlanRow(overrides: Partial<MediaPlanRow> = {}): MediaPlanRow {
    return {
        id: "row-2-test",
        source: { sheetName: "Mediaplan", rowNumber: 2 },
        campaign: "Black Friday",
        publisher: "Ena Håbo-Tidningen",
        format: "Print Spread",
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
        expect(formatDimensions(card.dimensions)).toBe("522 × 372 mm");
        expect(formatDeadline(card.deadline)).toBe("24 Sept");
        expect(formatRequirements(card.requirements)).toBe("No additional requirement recorded");
        expect(card.requirements).toMatchObject({ resolutionDpi: 200, colorProfile: "CMYK" });
        expect(card.fileTypes).toEqual(["PDF", "EPS"]);
        expect(card.source?.url).toContain("vasterastidning.se");
        expect(card.trust).toBe("verified");
        expect(card.sourceRow).toEqual({ sheetName: "Mediaplan", rowNumber: 2 });
    });

    it("uses pixel dimensions and simplified ratios for digital specs", () => {
        const job = matchToBrain(mediaPlanRow({
            campaign: "BF",
            publisher: "Bauer Media Outdoor",
            format: "Digital Adshel",
            deadline: null,
            deadlineRaw: "",
        }));
        const { formats } = mapJobsToFormats([job]);
        expect(formatDimensions(formats[0].dimensions)).toBe("1080 × 1920 px");
        expect(ratioLabel(formats[0].dimensions)).toBe("9:16");
        expect(formatDeadline(formats[0].deadline)).toBe("TBD");
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

    it("keeps a matched row with an unparsed deadline in the review worklist", () => {
        const job = matchToBrain(mediaPlanRow({ deadline: null, deadlineRaw: "24 Sep" }));
        const { formats, unmatched } = mapJobsToFormats([job]);

        expect(job.specs).not.toBeNull();
        expect(formats).toHaveLength(0);
        expect(unmatched).toHaveLength(1);
        expect(unmatched[0].error).toContain("could not be interpreted");
    });
});
