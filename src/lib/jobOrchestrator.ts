import * as xlsx from "xlsx";
import brainData from "./data/brain.json";

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
    specs: unknown;
    generatedFileName: string;
    status: "pending" | "error" | "complete";
    error?: string;
    outputUrl?: string;
}

export async function parseExcelBuffer(buffer: Buffer): Promise<MediaPlanRow[]> {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to JSON array
    const rawData = xlsx.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    // Map to our expected format with robust column detection
    return rawData.map(row => {
        // Find keys case-insensitively
        const findKey = (candidates: string[]) => {
            const keys = Object.keys(row);
            for (const cand of candidates) {
                const found = keys.find(k => k.toLowerCase() === cand.toLowerCase());
                if (found) return row[found] as string;
            }
            return null;
        };

        return {
            Campaign: findKey(["Campaign", "Kampanj", "Kampanjtext", "Headline", "Copy"]) || "Finali_Launch",
            Publisher: findKey(["Publisher", "Mediehus", "Media", "Publisher Name"]) || "Unknown",
            Format: findKey(["Format", "Size", "Dimensioner", "Typ"]) || "Unknown",
            Notes: findKey(["Notes", "Noteringar", "Kommentarer"]) || ""
        };
    });
}

export function matchToBrain(row: MediaPlanRow): OrchestratedJob {
    // Try to find a match in the brain based on publisher and format
    const match = brainData.media_specs.find(spec =>
        spec.publisher.toLowerCase() === row.Publisher.toLowerCase() &&
        spec.name.toLowerCase().includes(row.Format.toLowerCase())
    );

    if (match) {
        const dateStr = new Date().toISOString().split('T')[0];
        let fileName = match.naming_convention
            .replace("{{Campaign}}", row.Campaign)
            .replace("{{Publisher}}", row.Publisher)
            .replace("{{Format}}", match.name)
            .replace("{{Date}}", dateStr);

        // Replace spaces with underscores for a clean filename
        fileName = fileName.replace(/\s+/g, "_");

        return {
            campaign: row.Campaign,
            publisher: row.Publisher,
            formatName: match.name,
            specs: match,
            generatedFileName: fileName,
            status: "pending"
        };
    }

    return {
        campaign: row.Campaign,
        publisher: row.Publisher,
        formatName: row.Format,
        specs: null,
        generatedFileName: "",
        status: "error",
        error: `No matching spec found in The Brain for: ${row.Publisher} - ${row.Format}`
    };
}
