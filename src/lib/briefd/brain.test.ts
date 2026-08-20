import { describe, expect, it } from "vitest";
import rawBrainData from "@/lib/data/brain.json";
import { brainData, validateBrainData } from "./brain";

function cloneBrain(): unknown {
    return JSON.parse(JSON.stringify(rawBrainData));
}

describe("Brain data", () => {
    it("contains source-backed coverage in every Briefd category", () => {
        expect(brainData.media_specs).toHaveLength(12);
        expect(new Set(brainData.media_specs.map((spec) => spec.category))).toEqual(new Set([
            "Social Media (SoMe)",
            "Digital Display & High-Impact",
            "Out of Home (OOH & DOOH)",
            "Newsprint & Magazines (Print)",
        ]));

        for (const spec of brainData.media_specs) {
            expect(spec.sources.length).toBeGreaterThan(0);
            expect(spec.sources.every((source) => source.url.startsWith("https://"))).toBe(true);
            expect(spec.sources.every((source) => source.verified_at === "2026-08-20")).toBe(true);
        }
    });

    it("rejects duplicate ids", () => {
        const data = cloneBrain() as typeof rawBrainData;
        data.media_specs[1].id = data.media_specs[0].id;
        expect(() => validateBrainData(data)).toThrow(/id must be unique/);
    });

    it("rejects unsourced specs", () => {
        const data = cloneBrain() as typeof rawBrainData;
        data.media_specs[0].sources = [];
        expect(() => validateBrainData(data)).toThrow(/sources must not be empty/);
    });

    it("rejects incomplete or mixed dimension pairs", () => {
        const data = cloneBrain() as typeof rawBrainData;
        data.media_specs[0].dimensions = { width_px: 1200 } as typeof data.media_specs[0]["dimensions"];
        expect(() => validateBrainData(data)).toThrow(/dimension pair/);
    });
});
