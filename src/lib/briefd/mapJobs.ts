import type { OrchestratedJob } from "@/lib/jobOrchestrator";
import type { CategoryTag, FormatData, SectionCategory } from "./types";
import { CATEGORIES } from "./categories";

export interface UnmatchedRow {
    publisher: string;
    format: string;
    error: string;
}

export interface MappedPlan {
    formats: FormatData[];
    unmatched: UnmatchedRow[];
    campaignName: string;
}

const VALID_TAGS: CategoryTag[] = ["SoMe", "OOH", "DOOH", "Print", "Display", "High-Impact"];

function isSectionCategory(value: string): value is SectionCategory {
    return value in CATEGORIES;
}

function isCategoryTag(value: string): value is CategoryTag {
    return (VALID_TAGS as string[]).includes(value);
}

/** Greatest common divisor, for simplifying pixel aspect ratios (1080:1920 → 9:16). */
function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

function ratioLabel(width: number, height: number): string {
    const divisor = gcd(width, height);
    const w = width / divisor;
    const h = height / divisor;
    // Simple integer ratios read well (9:16); otherwise normalize to 1:x
    if (w <= 32 && h <= 32) return `${w}:${h}`;
    return width >= height
        ? `${(width / height).toFixed(2)}:1`
        : `1:${(height / width).toFixed(2)}`;
}

/**
 * Turn the parse API's jobs into Briefd format cards.
 * Matched jobs become cards; unmatched rows are reported separately so the
 * UI can surface them honestly instead of faking a card.
 */
export function mapJobsToFormats(jobs: OrchestratedJob[]): MappedPlan {
    const formats: FormatData[] = [];
    const unmatched: UnmatchedRow[] = [];

    jobs.forEach((job, index) => {
        const spec = job.specs;
        if (job.status === "error" || !spec) {
            unmatched.push({
                publisher: job.publisher,
                format: job.formatName,
                error: job.error ?? "No matching spec found",
            });
            return;
        }

        const isPx = spec.dimensions.width_px != null && spec.dimensions.height_px != null;
        const width = (isPx ? spec.dimensions.width_px : spec.dimensions.width_mm) ?? 1;
        const height = (isPx ? spec.dimensions.height_px : spec.dimensions.height_mm) ?? 1;
        const unit = isPx ? "px" : "mm";

        const safeParts: string[] = [];
        if (spec.safe_zones.text_mm > 0) safeParts.push(`Text ${spec.safe_zones.text_mm} mm`);
        if (spec.safe_zones.image_mm > 0) safeParts.push(`Image ${spec.safe_zones.image_mm} mm`);
        if (spec.bleed_mm > 0) safeParts.push(`Bleed ${spec.bleed_mm} mm`);

        formats.push({
            id: `${spec.id}-${index + 1}`,
            categoryTag: isCategoryTag(spec.category_tag) ? spec.category_tag : "Display",
            publisher: spec.publisher,
            formatName: spec.name,
            sectionCategory: isSectionCategory(spec.category)
                ? spec.category
                : "Digital Display & High-Impact",
            dimensions: `${width} × ${height} ${unit}`,
            widthRatio: width,
            heightRatio: height,
            ratioLabel: ratioLabel(width, height),
            deadline: job.deadline || "TBD",
            safeZone: safeParts.length > 0 ? safeParts.join(" · ") : "None",
            fileType: spec.color.pdf_preset,
            // The Brain does not carry publisher spec URLs yet; the card
            // hides the link when specsUrl is empty.
            specsLabel: "",
            specsUrl: "",
            metadata: `${spec.color.icc_profile} · ${job.generatedFileName}`,
        });
    });

    return {
        formats,
        unmatched,
        campaignName: jobs[0]?.campaign ?? "Uploaded campaign",
    };
}
