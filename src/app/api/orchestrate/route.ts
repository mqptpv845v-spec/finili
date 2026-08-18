import { NextRequest, NextResponse } from "next/server";
import { parseExcelBuffer, matchToBrain, OrchestratedJob } from "@/lib/jobOrchestrator";
import { runLocalInDesignJob } from "@/lib/api/adobe/localBridge";
import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// NOTE: This route drives a locally installed Adobe InDesign over AppleScript.
// It only works in local development on macOS — it is the Finali AI prototype,
// not a deployable cloud endpoint. See docs/architecture.md.

async function findInddFiles(dir: string): Promise<string[]> {
    const found: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.name === "__MACOSX" || entry.name.startsWith("._")) continue;
        if (entry.isDirectory()) {
            found.push(...(await findInddFiles(fullPath)));
        } else if (entry.name.toLowerCase().endsWith(".indd")) {
            found.push(fullPath);
        }
    }
    return found;
}

export async function POST(req: NextRequest) {
    let tmpDir = "";
    try {
        const formData = await req.formData();
        const mediaPlanFile = formData.get("mediaPlan");
        const masterFile = formData.get("masterFile"); // Expected to be a .zip file

        if (!(mediaPlanFile instanceof File) || !(masterFile instanceof File)) {
            return NextResponse.json({ error: "Missing required files" }, { status: 400 });
        }

        const mediaPlanBuffer = Buffer.from(await mediaPlanFile.arrayBuffer());
        const masterBuffer = Buffer.from(await masterFile.arrayBuffer());

        const parsedRows = await parseExcelBuffer(mediaPlanBuffer);
        const jobs: OrchestratedJob[] = parsedRows.map(row => matchToBrain(row));
        const validJobs = jobs.filter(job => job.status !== "error");

        if (validJobs.length === 0) {
            return NextResponse.json({ error: "No valid specs found in the media plan." }, { status: 400 });
        }

        // --- LOCAL INDESIGN WORKFLOW ---
        // 1. Create a unique temporary directory
        const jobId = Date.now().toString();
        tmpDir = path.join(process.cwd(), ".tmp", jobId);
        await fs.mkdir(tmpDir, { recursive: true });

        // 2. Save the Master ZIP
        const zipPath = path.join(tmpDir, "master.zip");
        await fs.writeFile(zipPath, masterBuffer);

        // 3. Unzip the package
        console.log(`[Backend] Extracting master ZIP to ${tmpDir}...`);
        await execFileAsync("unzip", ["-o", zipPath, "-d", tmpDir]);

        // 4. Find the .indd file inside the extracted folder
        const inddFiles = await findInddFiles(tmpDir);

        if (inddFiles.length === 0) {
            throw new Error("No valid .indd file found inside the uploaded ZIP archive.");
        }

        const masterFilePath = inddFiles[0];
        console.log(`[Backend] Found Master InDesign File: ${masterFilePath}`);

        // 5. Process Jobs via AppleScript
        const processedJobs: OrchestratedJob[] = [];

        // Ensure "public/output" exists so the dev server can serve the PDFs.
        // (Local-dev only: this route never runs in a deployed environment.)
        const outputDir = path.join(process.cwd(), "public", "output");
        await fs.mkdir(outputDir, { recursive: true });

        for (const job of jobs) {
            if (job.status === "error") {
                processedJobs.push(job);
                continue;
            }

            try {
                const pdfFileName = job.generatedFileName;
                const pdfOutputPath = path.join(outputDir, pdfFileName);

                // Run the local InDesign bridge
                console.log(`[Backend] Generating ${pdfFileName}...`);
                await runLocalInDesignJob(masterFilePath, pdfOutputPath, job);

                processedJobs.push({
                    ...job,
                    status: "complete",
                    outputUrl: `/output/${pdfFileName}` // Public URL route
                });

            } catch (jobErr) {
                console.error(`[Backend] Job Failed for ${job.generatedFileName}:`, jobErr);
                processedJobs.push({
                    ...job,
                    status: "error",
                    error: (jobErr as Error).message
                });
            }
        }

        return NextResponse.json({
            success: true,
            jobs: processedJobs
        });

    } catch (err: unknown) {
        console.error("[Backend POST Error]", err);
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: message }, { status: 500 });
    } finally {
        // Cleanup the temporary unzipped files (don't leave heavy files lying around)
        if (tmpDir) {
            await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
        }
    }
}
