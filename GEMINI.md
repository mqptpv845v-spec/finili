# GEMINI.md — agent instructions for the Finali repo

You are working in the Finali repo. The canonical instructions live in [CLAUDE.md](CLAUDE.md) — **read that file first and follow it completely.** It applies to every coding agent, including you.

## Non-negotiable workflow

1. Before you write any UI code, read [docs/design-system.md](docs/design-system.md) and the rules in [.gemini/rules/](.gemini/rules/).
2. Before you create a component, search `src/components/atoms/`, `molecules/` and `briefd/` for an existing one. Reuse or extend it. Do not create a duplicate.
3. Never write a raw hex color, `shadow-*`, `hover:scale-*`, `uppercase`, `font-mono`, `animate-pulse`, or an arbitrary `text-[..px]` size in Briefd files. The test suite fails if you do (`tests/design-rules.test.ts`).
4. After every change, run **`npm run check`** (typecheck + lint + tests). Then run `npm run build`. All four must pass before you tell the user you are done. Fix failures yourself.
5. Never commit files in `.tmp/`, `public/output/`, `.specific/`, or any file over 5 MB. The test suite blocks these too.
6. Do not invent facts in UI copy: no fake version numbers, fake telemetry, fake company IDs.
7. Infrastructure changes go in `specific.hcl`; run `specific check` after editing it.

If a design-rules test fails, the fix is to change **your code** to follow the rule — never to change or delete the test.
