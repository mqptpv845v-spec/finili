# Agent instructions — Finali

Canonical agent instructions live in [CLAUDE.md](CLAUDE.md) (they apply to any coding agent, not only Claude). Read that first. Gemini also loads [GEMINI.md](GEMINI.md).

Hard gate: run `npm run check` and `npm run build` before reporting any change as done. The design system is enforced by `tests/design-rules.test.ts`.

Quick pointers:

- Product: [docs/product.md](docs/product.md)
- Architecture: [docs/architecture.md](docs/architecture.md)
- Design system (binding rules): [docs/design-system.md](docs/design-system.md)
- Machine-readable style rules: [.gemini/rules/](.gemini/rules/)

Stack: Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 (`@theme` tokens) · Vitest · exceljs · Specific.dev (`specific.hcl`). Icons: Lucide.
