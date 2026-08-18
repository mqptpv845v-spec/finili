import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export async function runLocalInDesignJob(masterPath: string, outputPath: string, specs: any): Promise<string> {

    const jsxScriptPath = path.resolve(process.cwd(), "src/scripts/processJob.jsx");
    const inddApp = "Adobe InDesign 2026";

    // The arguments we want to pass to the JSX script
    const scriptArgs = {
        masterPath: masterPath,
        outputPath: outputPath,
        campaignText: specs.campaign || "Test Campaign!",
        specs: specs.specs // The matching brain.json spec
    };

    // Pass arguments securely using Base64 to bypass ALL AppleScript quoting issues
    const argsJson = JSON.stringify(scriptArgs);
    const argsBase64 = Buffer.from(argsJson).toString("base64");

    // AppleScript to run the JSX script and pass arguments
    const appleScript = `
        tell application "${inddApp}"
            tell script args
                set value name "jobArgsBase64" value "${argsBase64}"
            end tell
            
            -- Run the JSX file
            set scriptResult to do script POSIX file "${jsxScriptPath}" language javascript
            
            -- Clear args
            tell script args
                clear
            end tell
            
            return scriptResult
        end tell
    `;

    try {
        console.log(`[InDesign Bridge] Executing AppleScript to process ${path.basename(masterPath)}...`);
        const { stdout, stderr } = await execAsync(`osascript -e '${appleScript}'`);

        const result = stdout.trim();
        console.log(`[InDesign Bridge] Result: ${result}`);

        if (result.startsWith("ERROR:")) {
            throw new Error(result.replace("ERROR:", "").trim());
        }

        if (stderr) {
            console.warn("[InDesign Bridge] stderr:", stderr);
        }

        return outputPath;

    } catch (error) {
        console.error("[InDesign Bridge] Failed:", error);
        throw error;
    }
}
