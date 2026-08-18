# CLAUDE.md — agent instructions for the Finali repo

## What this project is

Finali: a tool for Nordic ad production. **Briefd** (`/briefd`) turns Excel media plans into visual format cards. **Finali AI** (`/api/orchestrate`) generates print-ready PDFs from an InDesign master. Product background: `docs/product.md`. Code map: `docs/architecture.md`.

## Commands

```bash
npm run dev        # dev server (or: specific dev)
npm run build      # production build — must stay green
npm test           # Vitest — must stay green
npm run lint       # ESLint — zero errors and zero warnings
npm run typecheck  # tsc --noEmit
```

Run build + test + lint before declaring any change done.

## Infrastructure

Defined in `specific.hcl` (Specific.dev). After editing `specific.hcl`, run `specific check`. Deploy with `specific deploy`. The `/api/orchestrate` route is macOS-local-only (drives Adobe InDesign over AppleScript) — never assume it works in a deployed environment.

## Architecture rules

- **App Router** (`src/app/`). Pages are thin; logic lives in `src/lib/`.
- **Atomic design** in `src/components/`:
  - `atoms/` — smallest reusable pieces (`Button`, `CropFrame`, `GeometricGlyph`)
  - `molecules/` — compositions of atoms (`Modal`)
  - `briefd/` — feature organisms for the Briefd app
  - Before creating any component: search all three levels for an existing one. Reuse > extend with a prop > compose > create new at the smallest viable level. Never fork a component over styling alone.
- **Single sources of truth:** `src/lib/briefd/types.ts` (FormatData), `src/lib/briefd/categories.ts` (category names + colors), `src/lib/data/brain.json` (publisher specs). Adding a category or spec means editing exactly one file.
- Shared hooks live in `src/hooks/`.
- `src/scripts/*.jsx` is ExtendScript executed inside InDesign (ES3, excluded from ESLint) — do not modernize its syntax.

## Design rules (binding — see docs/design-system.md)

1. Only the 8 brand tokens (petrol, cyan, plum, magenta, taupe, yellow, graphite, light) + black/white. **Never raw hex in components** — use the Tailwind token utilities from `globals.css` `@theme`.
2. Briefd typography uses only `text-hero/section/title/value/label` (78/48/30/18/11 px). Marketing pages use the fluid clamp system (`h1–h4`, `.text-lead/.text-body/.text-ui`).
3. Never `uppercase`. Never `font-mono`. Instrument Sans only (via `next/font` in `layout.tsx`).
4. No `shadow-*`, no `hover:scale-*` (hover = the `.btn-morph` border-radius morph), no pill badges, no pulsing dots.
5. 4px grid for spacing. Edge-to-edge layout with `px-5 sm:px-[30px]`.
6. UI copy is English. Domain terms in data (Helsida, Rulltrappstavla) stay Swedish.

## Testing

Logic (parsing, matching, transforms) requires Vitest tests next to the module (`*.test.ts`). Test behavior, not implementation.

## Honesty rules

No fabricated numbers or status in UI copy (no fake telemetry, fake version strings, fake corp IDs). No shipped `console.log` noise in components.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
