// Test script to verify local InDesign execution via AppleScript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkInDesign() {
    const versionsToTest = [
        "Adobe InDesign 2026",
        "Adobe InDesign 21.2",
        "Adobe InDesign",
        "InDesign"
    ];

    for (const appName of versionsToTest) {
        console.log(`Testing application "${appName}"...`);
        const script = `
      try
        tell application "${appName}"
          get version
        end tell
      on error errStr number errNum
        return "ERROR: " & errStr
      end try
    `;

        try {
            const { stdout } = await execAsync(`osascript -e '${script}'`);
            const result = stdout.trim();
            if (result.startsWith("ERROR:")) {
                console.log(`  Failed: ${result}`);
            } else {
                console.log(`  SUCCESS! Connected to InDesign. Version: ${result}`);
                console.log(`\nWe should use "${appName}" in our bridge!`);
                return;
            }
        } catch (error) {
            console.log(`  Execution failed for ${appName}`);
        }
    }

    console.log("\nCould not connect with any of the tested names.");
}

checkInDesign();
