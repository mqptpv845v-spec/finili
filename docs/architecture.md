# Architecture

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 (`@theme` tokens, no config file) · Vitest · ESLint 9 flat config. Infrastructure via [Specific](https://specific.dev) (`specific.hcl`). Path alias `@/* → ./src/*`.

## Routes

| Route | File | What it is |
|---|---|---|
| `/` | `src/app/page.tsx` | Marketing landing page (server component) |
| `/briefd` | `src/app/briefd/page.tsx` | The Briefd app (client component) |
| `POST /api/parse` | `src/app/api/parse/route.ts` | Parse an uploaded `.xlsx` media plan and match rows against The Brain |
| `POST /api/orchestrate` | `src/app/api/orchestrate/route.ts` | Full local InDesign pipeline (macOS only, see below) |

## The two halves

**1. Briefd (the app).** `src/app/briefd/page.tsx` renders a three-tab workspace (format cards / calendar / spreadsheet) over `CAMPAIGN_FORMATS` demo data. The open format detail is driven by the `?format=` URL parameter (`useSearchParams`), so browser back/forward works. Components follow atomic design:

```
src/components/
├── atoms/       Button (the btn-morph pill), CropFrame (print crop marks), GeometricGlyph
├── molecules/   Modal (accessible shell used by both dialogs)
└── briefd/      Feature organisms: FormatCardItem, FormatDetailView, BriefdSidebar,
                 BriefdCalendarView, BriefdSpreadsheetView, ShareLiveBriefModal,
                 FinaliAIModal, PreflightLoader
```

Shared domain modules:

- `src/lib/briefd/types.ts` — `FormatData`, `SectionCategory`
- `src/lib/briefd/categories.ts` — the four categories with every color/title used by any view
- `src/hooks/useCopyToClipboard.ts` — copy-with-feedback

**2. The InDesign pipeline (the engine).** The Finali AI prototype:

```
.xlsx upload ─▶ parseExcelBuffer (exceljs) ─▶ matchToBrain (brain.json)
                                                    │
.zip with .indd master ─▶ unzip ─▶ find master ─────┤
                                                    ▼
                        runLocalInDesignJob (AppleScript → InDesign 2026)
                                                    ▼
                        src/scripts/processJob.jsx (ExtendScript, runs inside InDesign)
                                                    ▼
                        PDF written to public/output/ (gitignored)
```

- `src/lib/jobOrchestrator.ts` — Excel parsing with Swedish/English column detection, and spec matching. Unit-tested in `jobOrchestrator.test.ts`.
- `src/lib/data/brain.json` — "The Brain": the publisher spec database (6 entries today).
- `src/lib/api/adobe/localBridge.ts` — passes job arguments base64-encoded through InDesign's script-args and runs the JSX via `osascript`.
- `src/scripts/processJob.jsx` — the ExtendScript that opens the master, injects campaign text and exports the PDF. `src/scripts/experiments/` holds two in-progress attempts at automatic page resizing — the unsolved step.

### The InDesign pipeline is local-only

`/api/orchestrate` shells out to `unzip` and `osascript` and requires Adobe InDesign 2026 installed. It can never run on a serverless host. The researched path to cloud rendering is Adobe Firefly Services / InDesign APIs (see git history for the mocked client that documents the payload shapes); that is the known next milestone for Finali AI.

## What is intentionally not built yet

- No database, auth or persistence — Briefd shows demo data and shares a static URL. The zero-login live link requires a store (add via `specific.hcl` — Postgres and object storage are one block each).
- The calendar renders a hardcoded September 2026 grid matching the demo campaign.
- Overset-text detection exists only as the `anomaly` field on `FormatData`.

## Quality gates

`npm run build`, `npm test`, `npm run lint` (zero warnings) and `npm run typecheck` must all pass. Design rules are enforced by convention through tokens and atoms — see [design-system.md](design-system.md).
