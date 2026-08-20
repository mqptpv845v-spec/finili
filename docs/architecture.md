# Architecture

## Status boundary

Briefd is a correctable media-plan utility deployed at `https://plump-vulture.spcf.app/briefd`. Its parser, sourced provisional Brain, correction workflow, three workspace views, PostgreSQL persistence, and revocable view-only links are implemented. The Specific-backed flow has passed repository integration plus production create, reload, revision update, isolated view-only access, revocation, and cleanup checks.

Finali AI is separate. `/api/orchestrate` is a macOS-only prototype that drives a locally installed Adobe InDesign; it is not a hosted or validated production engine.

## Stack

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS v4, ExcelJS, Vitest, ESLint, and Specific. `specific.hcl` defines the web service and PostgreSQL database with Reshape migrations for local development and production.

## Routes

| Route | Status | Purpose |
|---|---|---|
| `/` | Implemented | Marketing and honest product-status page |
| `/briefd` | Implemented | Upload, import review, correction, and workspace |
| `POST /api/parse` | Implemented | Bounded `.xlsx` parsing and Brain matching |
| `POST /api/orchestrate` | Local prototype | InDesign PDF export for PDF-compatible Brain jobs only |
| `POST /api/campaigns` | Implemented | Create a normalized campaign and set its per-campaign owner capability cookie |
| `GET, PUT, DELETE /api/campaigns/[id]` | Implemented | Owner-only load, optimistic update, and deletion |
| `POST /api/campaigns/[id]/shares` | Implemented | Create an opaque view-only capability |
| `DELETE /api/campaigns/[id]/shares/[shareId]` | Implemented | Owner-only immediate revocation |
| `GET /api/shares/[token]` | Implemented | Load the redacted view-only campaign DTO |

## Briefd data flow

```text
.xlsx
  → bounded multipart reader
  → sheet/header detection or explicit mapping
  → typed source rows with stable ids and ISO deadlines
  → canonical/curated-alias Brain matching
  → import review
      ↳ assign cited Brain spec (verified)
      ↳ enter campaign-local values (user-provided)
  → one normalized FormatData model
  → cards / detail / calendar / table / copy / CSV
```

Key modules:

- `src/lib/jobOrchestrator.ts` — workbook parsing, source traceability, date normalization, and matching.
- `src/lib/data/brain.json` plus `src/lib/briefd/brain.ts` — 12 validated, sourced provisional specifications across all four categories.
- `src/lib/briefd/corrections.ts` — explicit verified versus user-provided resolution.
- `src/lib/briefd/format.ts`, `calendar.ts`, and `table.ts` — shared presentation and export logic over structured data.
- `src/lib/briefd/persistence/*` — capability security, write contracts, server-side Brain reconstruction, ownership, revisions, sharing lifecycle, and repository boundary.
- `migrations/001_create_briefd_campaigns.toml` — normalized local campaign/share schema. The original workbook is deliberately not retained.

## Persistence security model

- Campaign ids identify records but do not authorize editing.
- The editor receives a random 256-bit capability; only its SHA-256 hash may be stored.
- Verified write inputs contain only a row id and Brain spec id. The server reconstructs dimensions, requirements, publisher, and evidence from the Brain.
- Updates use optimistic revisions.
- Share capabilities are separate random 256-bit tokens, stored only as hashes, view-only, expirable, and revocable.
- Shared DTOs omit workbook rows, raw values, source filename, mapping, owner material, and share hashes.
- Sharing is blocked while any imported row remains unresolved.

These invariants are enforced by the runtime and repository. The database suite covers exact round-trips, optimistic replacement, hash-only capabilities, active-share/update serialization, expiry, revocation, and cascade deletion.

## InDesign prototype

```text
.xlsx → parser/Brain → PDF-compatible jobs only
.zip containing .indd → unzip → local AppleScript bridge → InDesign ExtendScript → public/output
```

Non-PDF Brain jobs are rejected before InDesign runs. The prototype still depends on a local application installation and does not prove cloud rendering, PDF/X validation, ICC enforcement, approval, or external delivery.

## Evidence and quality gates

- `npm run check` — typecheck, lint, and focused tests.
- `npm run build` — production build through Next.js' webpack builder, avoiding the execution sandbox's Turbopack worker-port restriction.
- `specific check` — validates infrastructure and Reshape migrations.
- Browser acceptance covers the upload/correction/view flow plus two isolated sessions for owner reload, shared revision updates, view-only controls, and revocation.
- Autoreview must return no actionable findings after the final runtime and UI changes.

See `docs/briefd-release-contract.md` for the precise evidence boundary and `docs/briefd-assessment.md` for the execution plan.
