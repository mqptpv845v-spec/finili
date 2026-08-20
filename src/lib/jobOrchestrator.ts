import { createHash } from "node:crypto";
import ExcelJS from "exceljs";
import { mediaSpecs, type MediaSpec } from "./briefd/brain";

export type { MediaSpec } from "./briefd/brain";

export type MediaPlanField = "campaign" | "publisher" | "format" | "deadline" | "notes";
export type MediaPlanColumnMapping = Partial<Record<MediaPlanField, number>>;

export interface MediaPlanColumn {
    index: number;
    label: string;
}

export interface MediaPlanSource {
    sheetName: string;
    rowNumber: number;
}

export interface MediaPlanRow {
    id: string;
    source: MediaPlanSource;
    campaign: string;
    publisher: string;
    format: string;
    deadline: string | null;
    deadlineRaw: string;
    notes: string;
    rawValues: Record<string, string>;
}

export interface ParsedMediaPlan {
    sheetName: string;
    availableSheets: string[];
    headerRow: number;
    columns: MediaPlanColumn[];
    mapping: MediaPlanColumnMapping;
    rows: MediaPlanRow[];
    warnings: string[];
}

export interface ParseMediaPlanOptions {
    sheetName?: string;
    headerRow?: number;
    mapping?: MediaPlanColumnMapping;
}

export interface OrchestratedJob {
    id: string;
    source: MediaPlanSource;
    campaign: string;
    publisher: string;
    formatName: string;
    deadline: string | null;
    deadlineRaw: string;
    specs: MediaSpec | null;
    matchConfidence: "canonical" | "alias" | null;
    generatedFileName: string;
    status: "pending" | "error" | "complete";
    error?: string;
    outputUrl?: string;
}

const HEADER_SCAN_LIMIT = 30;

const HEADER_ALIASES: Record<MediaPlanField, string[]> = {
    campaign: ["campaign", "kampanj", "kampanjtext", "headline", "copy", "kund", "client"],
    publisher: ["publisher", "mediehus", "media", "publisher name", "publicist", "kanal", "leverantör"],
    format: ["format", "size", "dimensioner", "typ", "annonsformat", "formatnamn", "placering"],
    deadline: ["deadline", "materialdag", "materialdeadline", "datum", "due", "inlämning", "materialdatum"],
    notes: ["notes", "noteringar", "kommentarer", "kommentar", "övrigt", "information"],
};

function normalize(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

const NORMALIZED_HEADER_ALIASES = Object.fromEntries(
    Object.entries(HEADER_ALIASES).map(([field, aliases]) => [
        field,
        new Set(aliases.map(normalize)),
    ]),
) as Record<MediaPlanField, Set<string>>;

function fieldForHeader(value: string): MediaPlanField | null {
    const normalized = normalize(value);
    for (const field of Object.keys(NORMALIZED_HEADER_ALIASES) as MediaPlanField[]) {
        if (NORMALIZED_HEADER_ALIASES[field].has(normalized)) return field;
    }
    return null;
}

function cellText(cell: ExcelJS.Cell): string {
    return String(cell.text ?? "").replace(/\s+/g, " ").trim();
}

function mappingForRow(row: ExcelJS.Row): MediaPlanColumnMapping {
    const mapping: MediaPlanColumnMapping = {};
    row.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
        const field = fieldForHeader(cellText(cell));
        if (field && mapping[field] == null) mapping[field] = columnNumber;
    });
    return mapping;
}

function mappingScore(mapping: MediaPlanColumnMapping): number {
    let score = Object.keys(mapping).length;
    if (mapping.publisher != null) score += 3;
    if (mapping.format != null) score += 3;
    if (mapping.deadline != null) score += 1;
    return score;
}

function detectSheetAndHeader(workbook: ExcelJS.Workbook): {
    worksheet: ExcelJS.Worksheet;
    headerRow: number;
    mapping: MediaPlanColumnMapping;
} {
    let best: {
        worksheet: ExcelJS.Worksheet;
        headerRow: number;
        mapping: MediaPlanColumnMapping;
        score: number;
    } | null = null;

    for (const worksheet of workbook.worksheets) {
        const finalRow = Math.min(worksheet.actualRowCount || worksheet.rowCount, HEADER_SCAN_LIMIT);
        for (let rowNumber = 1; rowNumber <= finalRow; rowNumber += 1) {
            const mapping = mappingForRow(worksheet.getRow(rowNumber));
            const score = mappingScore(mapping);
            if (!best || score > best.score) {
                best = { worksheet, headerRow: rowNumber, mapping, score };
            }
        }
    }

    if (!best || best.score === 0) {
        throw new Error("No recognizable media-plan header row was found in the workbook.");
    }

    return best;
}

function getWorksheet(workbook: ExcelJS.Workbook, sheetName: string): ExcelJS.Worksheet {
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) throw new Error(`Worksheet not found: ${sheetName}`);
    return worksheet;
}

function validateHeaderRow(worksheet: ExcelJS.Worksheet, headerRow: number): void {
    if (!Number.isInteger(headerRow) || headerRow < 1 || headerRow > worksheet.rowCount) {
        throw new Error(`Header row ${headerRow} is outside worksheet ${worksheet.name}.`);
    }
}

function columnsForRow(row: ExcelJS.Row): MediaPlanColumn[] {
    const columns: MediaPlanColumn[] = [];
    row.eachCell({ includeEmpty: false }, (cell, index) => {
        columns.push({ index, label: cellText(cell) || `Column ${index}` });
    });
    return columns;
}

function isValidDate(date: Date): boolean {
    return !Number.isNaN(date.getTime());
}

function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseStringDate(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
        const date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
        return isValidDate(date) ? toIsoDate(date) : null;
    }

    const numericMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (numericMatch) {
        const date = new Date(Number(numericMatch[3]), Number(numericMatch[2]) - 1, Number(numericMatch[1]));
        return isValidDate(date) ? toIsoDate(date) : null;
    }

    const parsed = new Date(trimmed);
    return isValidDate(parsed) ? toIsoDate(parsed) : null;
}

function deadlineValue(cell: ExcelJS.Cell | undefined): { iso: string | null; raw: string } {
    if (!cell) return { iso: null, raw: "" };
    const value = cell.value;
    if (value instanceof Date) {
        const iso = toIsoDate(value);
        return { iso, raw: iso };
    }

    if (value && typeof value === "object" && "result" in value) {
        const result = value.result;
        if (result instanceof Date) {
            const iso = toIsoDate(result);
            return { iso, raw: iso };
        }
    }

    const raw = cellText(cell);
    return { iso: parseStringDate(raw), raw };
}

function mappedCellText(row: ExcelJS.Row, mapping: MediaPlanColumnMapping, field: MediaPlanField): string {
    const column = mapping[field];
    return column == null ? "" : cellText(row.getCell(column));
}

function stableRowId(sheetName: string, rowNumber: number, rawValues: Record<string, string>): string {
    const digest = createHash("sha256")
        .update(JSON.stringify([sheetName, rowNumber, rawValues]))
        .digest("hex")
        .slice(0, 12);
    return `row-${rowNumber}-${digest}`;
}

export async function parseExcelBuffer(
    buffer: Buffer,
    options: ParseMediaPlanOptions = {},
): Promise<ParsedMediaPlan> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

    if (workbook.worksheets.length === 0) {
        throw new Error("The uploaded file contains no worksheets.");
    }

    const explicitlySelectedWorksheet = options.sheetName
        ? getWorksheet(workbook, options.sheetName)
        : workbook.worksheets[0];
    const detected = options.headerRow != null && options.mapping
        ? null
        : detectSheetAndHeader(workbook);
    const worksheet = options.sheetName
        ? explicitlySelectedWorksheet
        : detected?.worksheet ?? explicitlySelectedWorksheet;
    const headerRow = options.headerRow ?? (worksheet === detected?.worksheet ? detected.headerRow : 1);
    validateHeaderRow(worksheet, headerRow);

    const detectedMapping = mappingForRow(worksheet.getRow(headerRow));
    const mapping = { ...detectedMapping, ...options.mapping };
    const columns = columnsForRow(worksheet.getRow(headerRow));
    const warnings: string[] = [];

    if (mapping.publisher == null) warnings.push("Publisher column needs to be mapped.");
    if (mapping.format == null) warnings.push("Format column needs to be mapped.");
    if (mapping.deadline == null) warnings.push("Deadline column was not detected.");

    const rows: MediaPlanRow[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber <= headerRow) return;

        const rawValues: Record<string, string> = {};
        columns.forEach((column) => {
            rawValues[String(column.index)] = cellText(row.getCell(column.index));
        });

        const campaign = mappedCellText(row, mapping, "campaign");
        const publisher = mappedCellText(row, mapping, "publisher");
        const format = mappedCellText(row, mapping, "format");
        const notes = mappedCellText(row, mapping, "notes");
        const deadlineColumn = mapping.deadline;
        const deadline = deadlineValue(deadlineColumn == null ? undefined : row.getCell(deadlineColumn));

        if (!campaign && !publisher && !format && !deadline.raw && !notes) return;

        rows.push({
            id: stableRowId(worksheet.name, rowNumber, rawValues),
            source: { sheetName: worksheet.name, rowNumber },
            campaign,
            publisher,
            format,
            deadline: deadline.iso,
            deadlineRaw: deadline.raw,
            notes,
            rawValues,
        });
    });

    return {
        sheetName: worksheet.name,
        availableSheets: workbook.worksheets.map((sheet) => sheet.name),
        headerRow,
        columns,
        mapping,
        rows,
        warnings,
    };
}

function normalizedOptions(primary: string, aliases: string[]): Set<string> {
    return new Set([primary, ...aliases].map(normalize));
}

function findSpec(row: MediaPlanRow): { spec: MediaSpec; confidence: "canonical" | "alias" } | null {
    const publisher = normalize(row.publisher);
    const format = normalize(row.format);
    const forPublisher = mediaSpecs.filter((spec) =>
        normalizedOptions(spec.publisher, spec.publisher_aliases).has(publisher),
    );
    const canonical = forPublisher.find((spec) => normalize(spec.name) === format);
    if (canonical) return { spec: canonical, confidence: "canonical" };
    const alias = forPublisher.find((spec) => normalizedOptions(spec.name, spec.aliases).has(format));
    return alias ? { spec: alias, confidence: "alias" } : null;
}

function safeFileToken(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[\\/]/g, "-")
        .replace(/\.\.+/g, ".")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .replace(/^\.+/, "")
        .replace(/_+/g, "_")
        .slice(0, 120) || "untitled";
}

function fillNamingConvention(template: string, tokens: Record<string, string>): string {
    let result = template;
    for (const [token, value] of Object.entries(tokens)) {
        result = result.replaceAll(`{{${token}}}`, safeFileToken(value));
    }
    return result.replace(/\s+/g, "_");
}

export function matchToBrain(row: MediaPlanRow): OrchestratedJob {
    const match = findSpec(row);

    if (!row.publisher || !row.format) {
        const missing = [!row.publisher ? "publisher" : null, !row.format ? "format" : null]
            .filter(Boolean)
            .join(" and ");
        return {
            id: row.id,
            source: row.source,
            campaign: row.campaign,
            publisher: row.publisher,
            formatName: row.format,
            deadline: row.deadline,
            deadlineRaw: row.deadlineRaw,
            specs: null,
            matchConfidence: null,
            generatedFileName: "",
            status: "error",
            error: `Missing ${missing} on row ${row.source.rowNumber}.`,
        };
    }

    if (!match) {
        return {
            id: row.id,
            source: row.source,
            campaign: row.campaign,
            publisher: row.publisher,
            formatName: row.format,
            deadline: row.deadline,
            deadlineRaw: row.deadlineRaw,
            specs: null,
            matchConfidence: null,
            generatedFileName: "",
            status: "error",
            error: `No matching spec found in The Brain for: ${row.publisher} - ${row.format}`,
        };
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = fillNamingConvention(match.spec.naming_convention, {
        Campaign: row.campaign || "Campaign",
        Publisher: row.publisher,
        Format: match.spec.name,
        Date: dateStr,
    });

    return {
        id: row.id,
        source: row.source,
        campaign: row.campaign,
        publisher: row.publisher,
        formatName: match.spec.name,
        deadline: row.deadline,
        deadlineRaw: row.deadlineRaw,
        specs: match.spec,
        matchConfidence: match.confidence,
        generatedFileName: fileName,
        status: "pending",
    };
}
