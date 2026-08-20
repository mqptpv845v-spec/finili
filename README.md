# Finali

**The missing layer between media planning and creative production.**

Finali is a product direction with one usable local Briefd workflow and a separate automation prototype:

1. **Briefd** — parse an Excel media plan, confirm its column mapping, and resolve each row against a cited provisional Brain spec or visibly user-provided values. Cards, calendar, detail, copy, and export use the same structured data. Specific-backed persistence and revocable view-only links are implemented and verified locally; external availability is not claimed.
2. **Finali AI** (concept plus local prototype) — a macOS-only API can drive a local InDesign installation for PDF-compatible jobs. It is not a hosted, validated production service.

No real agency media plans are available in this repository, so the parser and 12-format Brain are tested with synthetic fixtures and authoritative public sources. Useful real-world coverage is not yet claimed.

Read [docs/product.md](docs/product.md) for the full product thinking, and [docs/architecture.md](docs/architecture.md) for how the code is put together.

## Getting started

Requirements: Node 20+, npm. Infrastructure is defined with [Specific](https://specific.dev) in `specific.hcl`.

```bash
npm install

# Preferred: full local environment via Specific
specific dev

# Plain Next.js dev server also works
npm run dev
```

Open http://127.0.0.1:3000 — the marketing page is at `/`, the Briefd app at `/briefd`.

### The Finali AI prototype (macOS only)

`POST /api/orchestrate` drives a **locally installed Adobe InDesign 2026** over AppleScript to generate real PDFs from an `.indd` master. It only works in local development on a Mac with InDesign installed. See [docs/architecture.md](docs/architecture.md#the-indesign-pipeline).

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Dev server (Turbopack)                |
| `npm run build`     | Production build                      |
| `npm run check`     | Typecheck + lint + tests (the done-gate) |
| `npm test`          | Vitest unit tests + design-rule enforcement |
| `npm run lint`      | ESLint                                |
| `npm run typecheck` | TypeScript, no emit                   |
| `specific dev`      | Local dev environment via Specific    |
| `specific deploy`   | Infrastructure deploy command; not run or verified for this release |

## Repository map

```
specific.hcl            Infrastructure definition (Specific)
src/app/                Next.js App Router: / (marketing), /briefd (app), /api/*
src/components/         Atomic design: atoms/ → molecules/ → briefd/ (organisms)
src/lib/                Domain logic: Excel parsing, spec matching, brain.json
src/lib/data/brain.json The spec database ("The Brain") — publisher format specs
src/scripts/            ExtendScript run inside Adobe InDesign
docs/                   Product, architecture and design-system documentation
docs/strategy/          Original strategy briefs (Swedish)
docs/source-material/   Raw publisher spec material (orders, spec sheets)
```

## Design system

The visual language is strict and documented in [docs/design-system.md](docs/design-system.md): Instrument Sans only, tone-on-tone color pairs, crop marks, a 4px grid, and a golden-ratio type scale on Briefd. The rules are enforced through design tokens in `src/app/globals.css` and the shared atoms — never use raw hex colors or ad-hoc font sizes in components. These rules are enforced by `tests/design-rules.test.ts` and CI — see [docs/contributing.md](docs/contributing.md) for the workflow.
