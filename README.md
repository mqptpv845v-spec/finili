# Finali

**The missing layer between media planning and creative production.**

Finali is two products in one ecosystem:

1. **Briefd** (free) — drop an Excel media plan in the browser and every row becomes a visual *format card* with true proportions, exact dimensions, deadlines and a link to the publisher's spec page. Share one live link with the whole team. No logins, no file versions, no email chains.
2. **Finali AI** (paid, in development) — upload an InDesign master together with the media plan and generate every campaign format as print-ready PDF/X, reviewed and approved by a human before export.

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
| `npm test`          | Vitest unit tests                     |
| `npm run lint`      | ESLint                                |
| `npm run typecheck` | TypeScript, no emit                   |
| `specific dev`      | Local dev environment via Specific    |
| `specific deploy`   | Deploy to Specific Cloud              |

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

The visual language is strict and documented in [docs/design-system.md](docs/design-system.md): Instrument Sans only, tone-on-tone color pairs, crop marks, a 4px grid, and a golden-ratio type scale on Briefd. The rules are enforced through design tokens in `src/app/globals.css` and the shared atoms — never use raw hex colors or ad-hoc font sizes in components.
