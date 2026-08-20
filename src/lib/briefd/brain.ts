import rawBrainData from "@/lib/data/brain.json";
import type { CategoryTag, SectionCategory } from "./types";

export interface MediaSpecSource {
    title: string;
    url: string;
    verified_at: string;
    authority: "publisher" | "platform" | "publisher-profile";
    note?: string;
}

export interface MediaSpec {
    id: string;
    name: string;
    aliases: string[];
    publisher: string;
    publisher_aliases: string[];
    category: SectionCategory;
    category_tag: CategoryTag;
    dimensions: {
        width_mm?: number;
        height_mm?: number;
        width_px?: number;
        height_px?: number;
        visible_width_mm?: number;
        visible_height_mm?: number;
    };
    bleed_mm?: number;
    safe_zones?: {
        text_mm?: number;
        image_mm?: number;
    };
    color?: {
        icc_profile?: string;
        color_space?: string;
        pdf_preset?: string;
        transparency_flattener?: string;
        max_ink_percent?: number;
    };
    delivery?: {
        file_types: string[];
        max_file_size_kb?: number;
        resolution_dpi?: number;
        duration_seconds?: number[];
        deadline_business_days?: number;
    };
    naming_convention: string;
    sources: MediaSpecSource[];
}

export interface BrainData {
    version: number;
    media_specs: MediaSpec[];
}

const SECTION_CATEGORIES: SectionCategory[] = [
    "Social Media (SoMe)",
    "Out of Home (OOH & DOOH)",
    "Newsprint & Magazines (Print)",
    "Digital Display & High-Impact",
];

const CATEGORY_TAGS: CategoryTag[] = ["SoMe", "OOH", "DOOH", "Print", "Display", "High-Impact"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function positive(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function nonNegative(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(`Invalid Brain data: ${message}`);
}

export function validateBrainData(value: unknown): BrainData {
    assert(value != null && typeof value === "object", "root must be an object");
    const data = value as Partial<BrainData>;
    assert(Number.isInteger(data.version) && Number(data.version) >= 1, "version must be a positive integer");
    assert(Array.isArray(data.media_specs) && data.media_specs.length > 0, "media_specs must not be empty");

    const ids = new Set<string>();
    const categories = new Set<SectionCategory>();

    for (const [index, candidate] of data.media_specs.entries()) {
        const spec = candidate as MediaSpec;
        const label = `media_specs[${index}]`;
        assert(typeof spec.id === "string" && spec.id.length > 0, `${label}.id is required`);
        assert(!ids.has(spec.id), `${label}.id must be unique (${spec.id})`);
        ids.add(spec.id);
        assert(typeof spec.name === "string" && spec.name.length > 0, `${label}.name is required`);
        assert(Array.isArray(spec.aliases), `${label}.aliases must be an array`);
        assert(typeof spec.publisher === "string" && spec.publisher.length > 0, `${label}.publisher is required`);
        assert(Array.isArray(spec.publisher_aliases), `${label}.publisher_aliases must be an array`);
        assert(SECTION_CATEGORIES.includes(spec.category), `${label}.category is unknown`);
        assert(CATEGORY_TAGS.includes(spec.category_tag), `${label}.category_tag is unknown`);
        categories.add(spec.category);

        const dimensions = spec.dimensions;
        assert(dimensions != null && typeof dimensions === "object", `${label}.dimensions is required`);
        const hasMillimetres = positive(dimensions.width_mm) && positive(dimensions.height_mm);
        const hasPixels = positive(dimensions.width_px) && positive(dimensions.height_px);
        assert(hasMillimetres !== hasPixels, `${label} must define one complete mm or px dimension pair`);
        if (dimensions.visible_width_mm != null) {
            assert(hasMillimetres && positive(dimensions.visible_width_mm), `${label}.visible_width_mm is invalid`);
        }
        if (dimensions.visible_height_mm != null) {
            assert(hasMillimetres && positive(dimensions.visible_height_mm), `${label}.visible_height_mm is invalid`);
        }
        if (spec.bleed_mm != null) assert(nonNegative(spec.bleed_mm), `${label}.bleed_mm is invalid`);
        if (spec.safe_zones?.text_mm != null) {
            assert(nonNegative(spec.safe_zones.text_mm), `${label}.safe_zones.text_mm is invalid`);
        }
        if (spec.safe_zones?.image_mm != null) {
            assert(nonNegative(spec.safe_zones.image_mm), `${label}.safe_zones.image_mm is invalid`);
        }
        if (spec.delivery) {
            assert(Array.isArray(spec.delivery.file_types) && spec.delivery.file_types.length > 0, `${label}.delivery.file_types is required`);
        }
        assert(
            typeof spec.naming_convention === "string" &&
                (spec.naming_convention.endsWith(".pdf") || spec.naming_convention.endsWith(".asset")),
            `${label}.naming_convention needs a supported extension`,
        );
        assert(Array.isArray(spec.sources) && spec.sources.length > 0, `${label}.sources must not be empty`);
        for (const [sourceIndex, source] of spec.sources.entries()) {
            const sourceLabel = `${label}.sources[${sourceIndex}]`;
            assert(typeof source.title === "string" && source.title.length > 0, `${sourceLabel}.title is required`);
            assert(typeof source.url === "string" && source.url.startsWith("https://"), `${sourceLabel}.url must use HTTPS`);
            assert(ISO_DATE.test(source.verified_at), `${sourceLabel}.verified_at must be YYYY-MM-DD`);
            assert(["publisher", "platform", "publisher-profile"].includes(source.authority), `${sourceLabel}.authority is invalid`);
        }
    }

    for (const category of SECTION_CATEGORIES) {
        assert(categories.has(category), `category has no verified specs: ${category}`);
    }

    return data as BrainData;
}

export const brainData = validateBrainData(rawBrainData);
export const mediaSpecs = brainData.media_specs;
