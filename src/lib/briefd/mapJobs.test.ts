import { describe, it, expect } from "vitest";
import { matchToBrain } from "@/lib/jobOrchestrator";
import { mapJobsToFormats } from "./mapJobs";

describe("mapJobsToFormats", () => {
    it("maps a matched print job to a complete format card", () => {
        const job = matchToBrain({
            Campaign: "Black Friday",
            Publisher: "SvD",
            Format: "Helsida (Stående)",
            Deadline: "24 Sep",
        });
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
        const job = matchToBrain({
            Campaign: "BF",
            Publisher: "Clear Channel",
            Format: "Play Digital",
        });
        const { formats } = mapJobsToFormats([job]);
        expect(formats[0].dimensions).toBe("1080 × 1920 px");
        expect(formats[0].ratioLabel).toBe("9:16");
        expect(formats[0].deadline).toBe("TBD");
    });

    it("reports unmatched rows separately instead of faking cards", () => {
        const jobs = [
            matchToBrain({ Campaign: "BF", Publisher: "SvD", Format: "Helsida (Stående)" }),
            matchToBrain({ Campaign: "BF", Publisher: "Aftonbladet", Format: "Panorama" }),
        ];
        const { formats, unmatched } = mapJobsToFormats(jobs);
        expect(formats).toHaveLength(1);
        expect(unmatched).toHaveLength(1);
        expect(unmatched[0].publisher).toBe("Aftonbladet");
        expect(unmatched[0].error).toContain("Aftonbladet");
    });
});
