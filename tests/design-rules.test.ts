import { describe, it, expect } from "vitest";
import { execFileSync } from "child_process";
import { readFileSync, statSync } from "fs";
import path from "path";

// Mechanical enforcement of docs/design-system.md.
// These tests run with `npm test`, so a rule violation fails the build gate
// no matter who (or which agent) wrote the code.

const repoRoot = path.resolve(__dirname, "..");

function trackedFiles(): string[] {
    // -z: NUL-separated raw paths (no quoting of non-ASCII characters)
    const out = execFileSync("git", ["ls-files", "-z"], { cwd: repoRoot, encoding: "utf8" });
    return out.split("\0").filter(Boolean);
}

const componentFiles = trackedFiles().filter(
    (f) =>
        (f.startsWith("src/app/") || f.startsWith("src/components/") || f.startsWith("src/hooks/")) &&
        (f.endsWith(".tsx") || f.endsWith(".ts")),
);

const briefdFiles = componentFiles.filter(
    (f) =>
        f.startsWith("src/app/briefd/") ||
        f.startsWith("src/components/briefd/") ||
        f.startsWith("src/components/atoms/") ||
        f.startsWith("src/components/molecules/"),
);

interface Rule {
    name: string;
    pattern: RegExp;
    files: string[];
}

const RULES: Rule[] = [
    // Rule 7 / tone_on_tone_colors: only token utilities, never raw hex
    { name: "raw hex color (use the brand tokens: bg-plum, text-magenta, ...)", pattern: /#[0-9a-fA-F]{6}\b/, files: componentFiles },
    // no_drop_shadows
    { name: "shadow (design is 100% flat — no shadow-* / drop-shadow-*)", pattern: /\b(?:hover:|focus:)?(?:drop-)?shadow-/, files: componentFiles },
    // no_scaling_hovers
    { name: "scaling hover (morph border-radius via .btn-morph instead)", pattern: /hover:scale-/, files: componentFiles },
    // no_uppercase
    { name: "uppercase (never ALL CAPS — sentence case everywhere)", pattern: /\buppercase\b/, files: componentFiles },
    // Rule 8: Instrument Sans only
    { name: "monospace (Instrument Sans only, no font-mono)", pattern: /\bfont-mono\b/, files: componentFiles },
    // Rule 3: no pulsing dots
    { name: "pulsing element (no animate-pulse badges/dots)", pattern: /\banimate-pulse\b/, files: componentFiles },
    // Rule 9: Briefd uses only the 5 scale tokens
    { name: "arbitrary text size in Briefd (use text-hero/section/title/value/label)", pattern: /\btext-\[/, files: briefdFiles },
    { name: "off-scale Tailwind size in Briefd (use the 5 scale tokens)", pattern: /\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b/, files: briefdFiles },
];

describe("design rules (docs/design-system.md)", () => {
    for (const rule of RULES) {
        it(`bans: ${rule.name}`, () => {
            const violations: string[] = [];
            for (const file of rule.files) {
                const content = readFileSync(path.join(repoRoot, file), "utf8");
                content.split("\n").forEach((line, i) => {
                    if (rule.pattern.test(line)) {
                        violations.push(`${file}:${i + 1}  ${line.trim().slice(0, 100)}`);
                    }
                });
            }
            expect(violations, `Design-rule violation — ${rule.name}:\n${violations.join("\n")}`).toEqual([]);
        });
    }
});

describe("repository hygiene", () => {
    it("tracks no file larger than 5 MB (runtime output and design dumps stay out of git)", () => {
        const LIMIT = 5 * 1024 * 1024;
        const tooBig = trackedFiles()
            .map((f) => ({ f, size: statSync(path.join(repoRoot, f)).size }))
            .filter(({ size }) => size > LIMIT)
            .map(({ f, size }) => `${f} (${(size / 1024 / 1024).toFixed(1)} MB)`);
        expect(tooBig, `Files too large for git:\n${tooBig.join("\n")}`).toEqual([]);
    });

    it("tracks no runtime or junk paths", () => {
        const banned = trackedFiles().filter(
            (f) =>
                f.startsWith(".tmp/") ||
                f.startsWith("public/output/") ||
                f.startsWith(".specific/") ||
                f.includes("__MACOSX/") ||
                f.endsWith(".DS_Store"),
        );
        expect(banned, `Junk paths tracked in git:\n${banned.join("\n")}`).toEqual([]);
    });
});
