import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { mediaSpecs } from "./briefd/brain";
import {
    matchToBrain,
    parseExcelBuffer,
    type MediaPlanRow,
} from "./jobOrchestrator";

type TestCell = string | number | Date | null;

async function workbookBuffer(
    configure: (workbook: ExcelJS.Workbook) => void,
): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    configure(workbook);
    return Buffer.from(await workbook.xlsx.writeBuffer());
}

async function buildWorkbook(headers: string[], rows: TestCell[][]): Promise<Buffer> {
    return workbookBuffer((workbook) => {
        const sheet = workbook.addWorksheet("Mediaplan");
        sheet.addRow(headers);
        rows.forEach((row) => sheet.addRow(row));
    });
}

function mediaPlanRow(overrides: Partial<MediaPlanRow> = {}): MediaPlanRow {
    return {
        id: "row-2-test",
        source: { sheetName: "Mediaplan", rowNumber: 2 },
        campaign: "Black Friday",
        publisher: "Ena Håbo-Tidningen",
        format: "Print Spread",
        deadline: "2026-09-24",
        deadlineRaw: "24 Sep 2026",
        notes: "",
        rawValues: {},
        ...overrides,
    };
}

describe("parseExcelBuffer", () => {
    it("reads English column names and preserves source identity", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format", "Notes"],
            [["Black Friday", "Ena Håbo-Tidningen", "Print Spread", "rush"]],
        );
        const plan = await parseExcelBuffer(buffer);

        expect(plan.sheetName).toBe("Mediaplan");
        expect(plan.headerRow).toBe(1);
        expect(plan.mapping).toMatchObject({ campaign: 1, publisher: 2, format: 3, notes: 4 });
        expect(plan.rows[0]).toMatchObject({
            source: { sheetName: "Mediaplan", rowNumber: 2 },
            campaign: "Black Friday",
            publisher: "Ena Håbo-Tidningen",
            format: "Print Spread",
            notes: "rush",
        });
        expect(plan.rows[0].id).toMatch(/^row-2-[a-f0-9]{12}$/);
    });

    it("detects a Swedish header below title rows on the relevant worksheet", async () => {
        const buffer = await workbookBuffer((workbook) => {
            const cover = workbook.addWorksheet("Läs mig");
            cover.addRow(["Campaign overview"]);
            const plan = workbook.addWorksheet("Köpplan");
            plan.addRow(["Kund: Exempel AB"]);
            plan.addRow([]);
            plan.addRow(["kampanj", "MEDIEHUS", "typ", "materialdatum"]);
            plan.addRow(["Vårkampanj", "JCDecaux", "Eurosize", new Date(Date.UTC(2026, 8, 24))]);
        });

        const plan = await parseExcelBuffer(buffer);
        expect(plan.sheetName).toBe("Köpplan");
        expect(plan.headerRow).toBe(3);
        expect(plan.rows[0]).toMatchObject({
            campaign: "Vårkampanj",
            publisher: "JCDecaux",
            format: "Eurosize",
            deadline: "2026-09-24",
        });
    });

    it("detects headers below a merged title and ignores formatted trailing blank rows", async () => {
        const buffer = await workbookBuffer((workbook) => {
            const sheet = workbook.addWorksheet("Campaign plan");
            sheet.mergeCells("A1:E1");
            sheet.getCell("A1").value = "Autumn launch media plan";
            sheet.addRow([]);
            sheet.addRow(["Campaign", "Publisher", "Format", "Deadline", "Notes"]);
            sheet.addRow([
                "Autumn launch",
                "Google Display",
                "Panorama — Sweden",
                "2026-10-12",
                "Hero placement",
            ]);

            // Real agency workbooks often retain formatting well below their data.
            // These rows must not become empty media-plan records after serialization.
            for (const rowNumber of [5, 6]) {
                const row = sheet.getRow(rowNumber);
                row.height = 18;
                row.getCell(1).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFF3F4F6" },
                };
            }
        });

        const plan = await parseExcelBuffer(buffer);

        expect(plan.sheetName).toBe("Campaign plan");
        expect(plan.headerRow).toBe(3);
        expect(plan.rows).toHaveLength(1);
        expect(plan.rows[0]).toMatchObject({
            source: { sheetName: "Campaign plan", rowNumber: 4 },
            campaign: "Autumn launch",
            publisher: "Google Display",
            format: "Panorama — Sweden",
            deadline: "2026-10-12",
            notes: "Hero placement",
        });
    });

    it("normalizes genuine Excel dates without leaking timezone display text", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format", "Deadline"],
            [["Black Friday", "Ena Håbo-Tidningen", "Print Spread", new Date(Date.UTC(2026, 8, 24))]],
        );
        const plan = await parseExcelBuffer(buffer);
        expect(plan.rows[0].deadline).toBe("2026-09-24");
        expect(plan.rows[0].deadlineRaw).not.toContain("GMT");
    });

    it("treats Excel date objects as UTC date-only values", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format", "Deadline"],
            [["Black Friday", "Ena Håbo-Tidningen", "Print Spread", new Date("2026-09-24T00:00:00.000Z")]],
        );
        const plan = await parseExcelBuffer(buffer);
        expect(plan.rows[0].deadline).toBe("2026-09-24");
    });

    it("preserves local-midnight dates in programmatically generated workbooks", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format", "Deadline"],
            [["Black Friday", "Ena Håbo-Tidningen", "Print Spread", new Date(2026, 8, 24)]],
        );
        const plan = await parseExcelBuffer(buffer);
        expect(plan.rows[0].deadline).toBe("2026-09-24");
    });

    it("keeps impossible calendar dates unresolved instead of normalizing them", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format", "Deadline"],
            [["Black Friday", "Ena Håbo-Tidningen", "Print Spread", "2026-02-31"]],
        );
        const plan = await parseExcelBuffer(buffer);
        expect(plan.rows[0].deadline).toBeNull();
        expect(plan.rows[0].deadlineRaw).toBe("2026-02-31");
    });

    it("parses explicit named date text without host timezone shifts", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format", "Deadline"],
            [
                ["Black Friday", "Ena Håbo-Tidningen", "Print Spread", "24 Sep 2026"],
                ["Spring", "Ena Håbo-Tidningen", "Print Full Page", "4 mars 2027"],
                ["Ambiguous", "LinkedIn", "Square single image ad", "24 Sep"],
            ],
        );
        const plan = await parseExcelBuffer(buffer);
        expect(plan.rows.map((row) => row.deadline)).toEqual(["2026-09-24", "2027-03-04", null]);
    });

    it("detects the header within an explicitly selected worksheet", async () => {
        const buffer = await workbookBuffer((workbook) => {
            workbook.addWorksheet("Cover").addRow(["Campaign", "Publisher", "Format"]);
            const plan = workbook.addWorksheet("Selected plan");
            plan.addRow(["Prepared by agency"]);
            plan.addRow([]);
            plan.addRow(["Campaign", "Publisher", "Format"]);
            plan.addRow(["Launch", "LinkedIn", "Square single image ad"]);
        });
        const result = await parseExcelBuffer(buffer, { sheetName: "Selected plan" });
        expect(result.headerRow).toBe(3);
        expect(result.rows[0]).toMatchObject({ campaign: "Launch", publisher: "LinkedIn" });
    });

    it("accepts an explicit column mapping and keeps incomplete rows for correction", async () => {
        const buffer = await buildWorkbook(
            ["Kunddata", "Leverans", "Storlek"],
            [["Vårkampanj", "Ena Håbo-Tidningen", "Print Spread"], ["Höstkampanj", "", "Halvsida"]],
        );
        const plan = await parseExcelBuffer(buffer, {
            headerRow: 1,
            mapping: { campaign: 1, publisher: 2, format: 3 },
        });

        expect(plan.rows).toHaveLength(2);
        expect(plan.rows[1]).toMatchObject({ campaign: "Höstkampanj", publisher: "", format: "Halvsida" });
    });

    it("treats an explicit mapping as authoritative when an optional column is unmapped", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format", "Deadline"],
            [["Launch", "LinkedIn", "Single Image — Square", "not a delivery date"]],
        );
        const detected = await parseExcelBuffer(buffer);
        expect(detected.mapping.deadline).toBe(4);
        expect(detected.rows[0].deadlineRaw).toBe("not a delivery date");

        const corrected = await parseExcelBuffer(buffer, {
            headerRow: 1,
            mapping: { campaign: 1, publisher: 2, format: 3 },
        });
        expect(corrected.mapping.deadline).toBeUndefined();
        expect(corrected.rows[0]).toMatchObject({ deadline: null, deadlineRaw: "" });
        expect(corrected.warnings).toContain("Deadline column was not detected.");
    });

    it("keeps stable ids across equivalent parses", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format"],
            [["Black Friday", "Ena Håbo-Tidningen", "Print Spread"]],
        );
        const first = await parseExcelBuffer(buffer);
        const second = await parseExcelBuffer(buffer);
        expect(first.rows[0].id).toBe(second.rows[0].id);
    });

    it("skips empty rows and rejects workbooks without recognizable headers", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format"],
            [["Black Friday", "Ena Håbo-Tidningen", "Print Spread"], ["", "", ""]],
        );
        expect((await parseExcelBuffer(buffer)).rows).toHaveLength(1);

        const unknown = await workbookBuffer((workbook) => {
            workbook.addWorksheet("Sheet 1").addRow(["Nothing useful"]);
        });
        await expect(parseExcelBuffer(unknown)).rejects.toThrow(/header row/);
    });
});

describe("matchToBrain", () => {
    it.each(mediaSpecs.map((spec) => [spec.id, spec.publisher, spec.name] as const))(
        "matches the canonical publisher and format for %s",
        (specId, publisher, format) => {
            const job = matchToBrain(mediaPlanRow({ publisher, format }));

            expect(job.status).toBe("pending");
            expect(job.specs?.id).toBe(specId);
            expect(job.matchConfidence).toBe("canonical");
        },
    );

    it.each(mediaSpecs.map((spec) => [
        spec.id,
        spec.publisher_aliases[0],
        spec.aliases[0],
    ] as const))(
        "matches a curated publisher and format alias for %s",
        (specId, publisher, format) => {
            expect(publisher, `${specId} needs a representative publisher alias`).toBeTruthy();
            expect(format, `${specId} needs a representative format alias`).toBeTruthy();

            const job = matchToBrain(mediaPlanRow({ publisher, format }));

            expect(job.status).toBe("pending");
            expect(job.specs?.id).toBe(specId);
            expect(job.matchConfidence).not.toBeNull();
        },
    );

    it("matches an exact publisher and format", () => {
        const job = matchToBrain(mediaPlanRow());
        expect(job.status).toBe("pending");
        expect(job.specs?.id).toBe("ena-habo-print-spread");
        expect(job.id).toBe("row-2-test");
        expect(job.matchConfidence).toBe("canonical");
    });

    it("matches curated publisher and format aliases", () => {
        const job = matchToBrain(mediaPlanRow({ publisher: "Ena Habo", format: "248x372" }));
        expect(job.status).toBe("pending");
        expect(job.specs?.id).toBe("ena-habo-print-full-page");
        expect(job.matchConfidence).toBe("alias");
    });

    it("does not match a one-character format against everything", () => {
        const job = matchToBrain(mediaPlanRow({ format: "news" }));
        expect(job.status).toBe("error");
        expect(job.specs).toBeNull();
    });

    it("reports missing mapped values with the source row", () => {
        const job = matchToBrain(mediaPlanRow({ publisher: "", format: "" }));
        expect(job.status).toBe("error");
        expect(job.error).toContain("row 2");
    });

    it("errors when the publisher is unknown", () => {
        const job = matchToBrain(mediaPlanRow({ publisher: "Aftonbladet" }));
        expect(job.status).toBe("error");
        expect(job.error).toContain("Aftonbladet");
    });

    it("sanitizes every filename token", () => {
        const job = matchToBrain(mediaPlanRow({ campaign: "../../Black / Friday" }));
        expect(job.generatedFileName).not.toContain("..");
        expect(job.generatedFileName).not.toContain("/");
        expect(job.generatedFileName).not.toContain("{{");
    });
});
