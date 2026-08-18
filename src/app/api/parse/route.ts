import { NextRequest, NextResponse } from "next/server";
import { parseExcelBuffer, matchToBrain } from "@/lib/jobOrchestrator";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const mediaPlanFile = formData.get("mediaPlan");

        if (!(mediaPlanFile instanceof File)) {
            return NextResponse.json({ error: "Missing required files" }, { status: 400 });
        }

        const mediaPlanBuffer = Buffer.from(await mediaPlanFile.arrayBuffer());
        const parsedRows = await parseExcelBuffer(mediaPlanBuffer);
        const jobs = parsedRows.map(row => matchToBrain(row));

        return NextResponse.json({
            success: true,
            jobs
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
