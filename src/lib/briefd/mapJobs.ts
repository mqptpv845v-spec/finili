import type { OrchestratedJob } from "@/lib/jobOrchestrator";
import type { CategoryTag, FormatData, SectionCategory } from "./types";
import { CATEGORIES } from "./categories";
import { sourceBackedFormat } from "./format";

export interface UnmatchedRow {
    id: string;
    source: OrchestratedJob["source"];
    publisher: string;
    format: string;
    deadline: string | null;
    deadlineRaw: string;
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

/**
 * Turn the parse API's jobs into Briefd format cards.
 * Fully usable matched jobs become cards. Unmatched rows and rows with a
 * non-empty deadline that could not be normalized stay in the review worklist.
 */
export function mapJobsToFormats(jobs: OrchestratedJob[]): MappedPlan {
    const formats: FormatData[] = [];
    const unmatched: UnmatchedRow[] = [];

    jobs.forEach((job, index) => {
        const spec = job.specs;
        const invalidDeadline = job.deadline === null && job.deadlineRaw.trim() !== "";
        if (job.status === "error" || !spec || invalidDeadline) {
            unmatched.push({
                id: job.id,
                source: job.source,
                publisher: job.publisher,
                format: job.formatName,
                deadline: job.deadline,
                deadlineRaw: job.deadlineRaw,
                error: invalidDeadline
                    ? `Deadline "${job.deadlineRaw}" could not be interpreted. Enter a valid date.`
                    : job.error ?? "No matching spec found",
            });
            return;
        }

        const profile = spec.color?.icc_profile ?? spec.color?.color_space;
        const format = sourceBackedFormat(spec, {
            id: job.id || `${spec.id}-${index + 1}`,
            deadline: job.deadline,
            deadlineRaw: job.deadlineRaw,
            sourceRow: job.source,
            metadata: [profile, job.generatedFileName].filter(Boolean).join(" · "),
        });
        formats.push({
            ...format,
            categoryTag: isCategoryTag(spec.category_tag) ? spec.category_tag : "Display",
            sectionCategory: isSectionCategory(spec.category)
                ? spec.category
                : "Digital Display & High-Impact",
        });
    });

    return {
        formats,
        unmatched,
        campaignName: jobs.find((job) => job.campaign.trim() !== "")?.campaign ?? "Uploaded campaign",
    };
}
