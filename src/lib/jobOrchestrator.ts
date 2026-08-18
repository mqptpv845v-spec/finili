import ExcelJS from "exceljs";
import brainData from "./data/brain.json";

export interface MediaSpec {
    id: string;
    name: string;
    publisher: string;
    dimensions: {
        width_mm?: number;
        height_mm?: number;
        width_px?: number;
        height_px?: number;
    };
    bleed_mm: number;
    safe_zones: {
        text_mm: number;
        image_mm: number;
    };
    color: {
        icc_profile: string;
        pdf_preset: string;
        transparency_flattener: string;
    };
    naming_convention: string;
}

export interface MediaPlanRow {
    Campaign: string;
    Publisher: string;
    Format: string;
    Notes?: string;
}

export interface OrchestratedJob {
    campaign: string;
    publisher: string;
    formatName: string;
    specs: MediaSpec | null;
    generatedFileName: string;
    status: "pending" | "error" | "complete";
    error?: string;
    outputUrl?: string;
}

const mediaSpecs: MediaSpec[] = brainData.media_specs;

export async function parseExcelBuffer(buffer: Buffer): Promise<MediaPlanRow[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        throw new Error("The uploaded file contains no worksheets.");
    }

    // Header row -> column index lookup, case-insensitive
    const headerByColumn = new Map<number, string>();
    worksheet.getRow(1).eachCell((cell, colNumber) => {
        headerByColumn.set(colNumber, String(cell.value ?? "").trim());
    });

    const rows: MediaPlanRow[] = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const values: Record<string, string> = {};
        row.eachCell((cell, colNumber) => {
            const header = headerByColumn.get(colNumber);
            if (header) values[header.toLowerCase()] = String(cell.text ?? "").trim();
        });

        const findColumn = (candidates: string[]): string | null => {
            for (const candidate of candidates) {
                const value = values[candidate.toLowerCase()];
                if (value) return value;
            }
            return null;
        };

        const parsed: MediaPlanRow = {
            Campaign: findColumn(["Campaign", "Kampanj", "Kampanjtext", "Headline", "Copy"]) || "Finali_Launch",
            Publisher: findColumn(["Publisher", "Mediehus", "Media", "Publisher Name", "Publicist"]) || "Unknown",
            Format: findColumn(["Format", "Size", "Dimensioner", "Typ"]) || "Unknown",
            Notes: findColumn(["Notes", "Noteringar", "Kommentarer"]) || "",
        };

        // Skip fully empty rows
        if (parsed.Publisher !== "Unknown" || parsed.Format !== "Unknown") {
            rows.push(parsed);
        }
    });

    return rows;
}

function normalize(value: string): string {
    return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function findSpec(row: MediaPlanRow): MediaSpec | undefined {
    const publisher = normalize(row.Publisher);
    const format = normalize(row.Format);

    const forPublisher = mediaSpecs.filter(spec => normalize(spec.publisher) === publisher);

    // Prefer an exact format-name match, fall back to a substring match —
    // but only when the query is long enough to be meaningful.
    return (
        forPublisher.find(spec => normalize(spec.name) === format) ??
        forPublisher.find(spec => format.length >= 4 && normalize(spec.name).includes(format))
    );
}

function fillNamingConvention(template: string, tokens: Record<string, string>): string {
    let result = template;
    for (const [token, value] of Object.entries(tokens)) {
        result = result.replaceAll(`{{${token}}}`, value);
    }
    return result;
}

export function matchToBrain(row: MediaPlanRow): OrchestratedJob {
    const match = findSpec(row);

    if (!match) {
        return {
            campaign: row.Campaign,
            publisher: row.Publisher,
            formatName: row.Format,
            specs: null,
            generatedFileName: "",
            status: "error",
            error: `No matching spec found in The Brain for: ${row.Publisher} - ${row.Format}`,
        };
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = fillNamingConvention(match.naming_convention, {
        Campaign: row.Campaign,
        Publisher: row.Publisher,
        Format: match.name,
        Date: dateStr,
    }).replace(/\s+/g, "_");

    return {
        campaign: row.Campaign,
        publisher: row.Publisher,
        formatName: match.name,
        specs: match,
        generatedFileName: fileName,
        status: "pending",
    };
}
