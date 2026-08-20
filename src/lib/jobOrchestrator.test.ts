import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
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
        publisher: "Dagens Nyheter",
        format: "News Spread — Full Height",
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
            [["Black Friday", "Dagens Nyheter", "News Spread — Full Height", "rush"]],
        );
        const plan = await parseExcelBuffer(buffer);

        expect(plan.sheetName).toBe("Mediaplan");
        expect(plan.headerRow).toBe(1);
        expect(plan.mapping).toMatchObject({ campaign: 1, publisher: 2, format: 3, notes: 4 });
        expect(plan.rows[0]).toMatchObject({
            source: { sheetName: "Mediaplan", rowNumber: 2 },
            campaign: "Black Friday",
            publisher: "Dagens Nyheter",
            format: "News Spread — Full Height",
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
            plan.addRow(["Vårkampanj", "JCDecaux", "Eurosize", new Date(2026, 8, 24)]);
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

    it("normalizes genuine Excel dates without leaking timezone display text", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format", "Deadline"],
            [["Black Friday", "Dagens Nyheter", "News Spread — Full Height", new Date(2026, 8, 24)]],
        );
        const plan = await parseExcelBuffer(buffer);
        expect(plan.rows[0].deadline).toBe("2026-09-24");
        expect(plan.rows[0].deadlineRaw).not.toContain("GMT");
    });

    it("accepts an explicit column mapping and keeps incomplete rows for correction", async () => {
        const buffer = await buildWorkbook(
            ["Kunddata", "Leverans", "Storlek"],
            [["Vårkampanj", "Dagens Nyheter", "News Spread — Full Height"], ["Höstkampanj", "", "Halvsida"]],
        );
        const plan = await parseExcelBuffer(buffer, {
            headerRow: 1,
            mapping: { campaign: 1, publisher: 2, format: 3 },
        });

        expect(plan.rows).toHaveLength(2);
        expect(plan.rows[1]).toMatchObject({ campaign: "Höstkampanj", publisher: "", format: "Halvsida" });
    });

    it("keeps stable ids across equivalent parses", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format"],
            [["Black Friday", "Dagens Nyheter", "News Spread — Full Height"]],
        );
        const first = await parseExcelBuffer(buffer);
        const second = await parseExcelBuffer(buffer);
        expect(first.rows[0].id).toBe(second.rows[0].id);
    });

    it("skips empty rows and rejects workbooks without recognizable headers", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format"],
            [["Black Friday", "Dagens Nyheter", "News Spread — Full Height"], ["", "", ""]],
        );
        expect((await parseExcelBuffer(buffer)).rows).toHaveLength(1);

        const unknown = await workbookBuffer((workbook) => {
            workbook.addWorksheet("Sheet 1").addRow(["Nothing useful"]);
        });
        await expect(parseExcelBuffer(unknown)).rejects.toThrow(/header row/);
    });
});

describe("matchToBrain", () => {
    it("matches an exact publisher and format", () => {
        const job = matchToBrain(mediaPlanRow());
        expect(job.status).toBe("pending");
        expect(job.specs?.id).toBe("dn-news-spread-full-height");
        expect(job.id).toBe("row-2-test");
        expect(job.matchConfidence).toBe("canonical");
    });

    it("matches curated publisher and format aliases", () => {
        const job = matchToBrain(mediaPlanRow({ publisher: "DN", format: "522x178" }));
        expect(job.status).toBe("pending");
        expect(job.specs?.id).toBe("dn-news-spread-half-height");
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
