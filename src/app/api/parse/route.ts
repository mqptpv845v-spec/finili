import { NextRequest, NextResponse } from "next/server";
import {
    parseExcelBuffer,
    matchToBrain,
    type MediaPlanColumnMapping,
} from "@/lib/jobOrchestrator";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_UPLOAD_BYTES + 1024 * 1024;

class UploadTooLargeError extends Error {}

async function boundedFormData(req: NextRequest): Promise<FormData> {
    if (!req.body) return new FormData();
    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_REQUEST_BYTES) {
            await reader.cancel();
            throw new UploadTooLargeError();
        }
        chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const contentType = req.headers.get("content-type");
    if (!contentType) throw new Error("Missing multipart content type.");
    return new Request(req.url, {
        method: "POST",
        headers: { "content-type": contentType },
        body: bytes.buffer,
    }).formData();
}

function parseMapping(value: FormDataEntryValue | null): MediaPlanColumnMapping | undefined {
    if (typeof value !== "string" || value.trim() === "") return undefined;
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Column mapping must be a JSON object.");
    }

    const mapping: MediaPlanColumnMapping = {};
    for (const field of ["campaign", "publisher", "format", "deadline", "notes"] as const) {
        const column = (parsed as Record<string, unknown>)[field];
        if (column == null) continue;
        if (!Number.isInteger(column) || Number(column) < 1) {
            throw new Error(`Column mapping for ${field} must be a positive column number.`);
        }
        mapping[field] = Number(column);
    }
    return mapping;
}

export async function POST(req: NextRequest) {
    try {
        const contentLength = Number(req.headers.get("content-length"));
        if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
            return NextResponse.json({ error: "The media plan must be smaller than 10 MB." }, { status: 413 });
        }
        const formData = await boundedFormData(req);
        const mediaPlanFile = formData.get("mediaPlan");

        if (!(mediaPlanFile instanceof File)) {
            return NextResponse.json({ error: "Choose an .xlsx media plan to continue." }, { status: 400 });
        }
        if (!mediaPlanFile.name.toLowerCase().endsWith(".xlsx")) {
            return NextResponse.json({ error: "Only .xlsx media plans are supported." }, { status: 415 });
        }
        if (mediaPlanFile.size > MAX_UPLOAD_BYTES) {
            return NextResponse.json({ error: "The media plan must be smaller than 10 MB." }, { status: 413 });
        }

        const mediaPlanBuffer = Buffer.from(await mediaPlanFile.arrayBuffer());
        const headerRowValue = formData.get("headerRow");
        const headerRow = typeof headerRowValue === "string" && headerRowValue !== ""
            ? Number(headerRowValue)
            : undefined;
        const sheetNameValue = formData.get("sheetName");
        const sheetName = typeof sheetNameValue === "string" && sheetNameValue !== ""
            ? sheetNameValue
            : undefined;
        const plan = await parseExcelBuffer(mediaPlanBuffer, {
            headerRow,
            sheetName,
            mapping: parseMapping(formData.get("mapping")),
        });
        const jobs = plan.rows.map((row) => matchToBrain(row));

        return NextResponse.json({
            success: true,
            plan,
            jobs,
        });

    } catch (err: unknown) {
        if (err instanceof UploadTooLargeError) {
            return NextResponse.json({ error: "The media plan must be smaller than 10 MB." }, { status: 413 });
        }
        const detail = err instanceof Error ? err.message : String(err);
        console.error("Media-plan parsing failed:", detail);
        return NextResponse.json(
            { error: "Briefd could not read this workbook. Check that it is a valid .xlsx file and try again." },
            { status: 422 },
        );
    }
}
