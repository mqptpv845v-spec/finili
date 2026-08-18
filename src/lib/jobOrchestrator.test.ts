import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import { parseExcelBuffer, matchToBrain } from "./jobOrchestrator";

async function buildWorkbook(headers: string[], rows: (string | number)[][]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Mediaplan");
    sheet.addRow(headers);
    rows.forEach(row => sheet.addRow(row));
    return Buffer.from(await workbook.xlsx.writeBuffer());
}

describe("parseExcelBuffer", () => {
    it("reads English column names", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format", "Notes"],
            [["Black Friday", "SvD", "Helsida (Stående)", "rush"]],
        );
        const rows = await parseExcelBuffer(buffer);
        expect(rows).toEqual([
            { Campaign: "Black Friday", Publisher: "SvD", Format: "Helsida (Stående)", Deadline: "", Notes: "rush" },
        ]);
    });

    it("reads Swedish column names case-insensitively", async () => {
        const buffer = await buildWorkbook(
            ["kampanj", "MEDIEHUS", "typ"],
            [["Vårkampanj", "JCDecaux", "Eurosize"]],
        );
        const rows = await parseExcelBuffer(buffer);
        expect(rows[0].Campaign).toBe("Vårkampanj");
        expect(rows[0].Publisher).toBe("JCDecaux");
        expect(rows[0].Format).toBe("Eurosize");
    });

    it("skips empty rows and rejects workbooks without sheets", async () => {
        const buffer = await buildWorkbook(
            ["Campaign", "Publisher", "Format"],
            [["Black Friday", "SvD", "Helsida (Stående)"], ["", "", ""]],
        );
        const rows = await parseExcelBuffer(buffer);
        expect(rows).toHaveLength(1);

        const empty = new ExcelJS.Workbook();
        const emptyBuffer = Buffer.from(await empty.xlsx.writeBuffer());
        await expect(parseExcelBuffer(emptyBuffer)).rejects.toThrow(/no worksheets/);
    });
});

describe("matchToBrain", () => {
    it("matches an exact publisher + format", () => {
        const job = matchToBrain({ Campaign: "BF", Publisher: "SvD", Format: "Helsida (Stående)" });
        expect(job.status).toBe("pending");
        expect(job.specs?.id).toBe("svd-helsida");
    });

    it("matches a partial format name", () => {
        const job = matchToBrain({ Campaign: "BF", Publisher: "DN", Format: "halvsida" });
        expect(job.status).toBe("pending");
        expect(job.specs?.id).toBe("dn-halvsida");
    });

    it("does not match a 1-character format against everything", () => {
        const job = matchToBrain({ Campaign: "BF", Publisher: "SvD", Format: "a" });
        expect(job.status).toBe("error");
        expect(job.specs).toBeNull();
    });

    it("errors when the publisher is unknown", () => {
        const job = matchToBrain({ Campaign: "BF", Publisher: "Aftonbladet", Format: "Helsida" });
        expect(job.status).toBe("error");
        expect(job.error).toContain("Aftonbladet");
    });

    it("fills every occurrence of a naming-convention token and strips spaces", () => {
        const job = matchToBrain({ Campaign: "Black Friday", Publisher: "SvD", Format: "Helsida (Stående)" });
        expect(job.generatedFileName).not.toContain("{{");
        expect(job.generatedFileName).not.toContain(" ");
        expect(job.generatedFileName).toContain("Black_Friday");
    });
});
