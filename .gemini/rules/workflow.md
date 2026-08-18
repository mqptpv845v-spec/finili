# Rule: Workflow gates

Every change must pass all gates before it is "done":

1. `npm run check` — typecheck + lint + tests. The tests include `tests/design-rules.test.ts`, which mechanically enforces the design system (no raw hex, no shadows, no uppercase, no monospace, no off-scale sizes, no big files, no junk paths).
2. `npm run build` — the production build must stay green.
3. One logical change per commit, with a message that says what and why.

If a gate fails, fix the code — never weaken, skip, or delete a gate. GitHub CI (`.github/workflows/ci.yml`) runs the same gates on every push, so a skipped gate will fail there anyway.

Before creating any UI component: search `src/components/` (atoms → molecules → briefd) and reuse or extend before creating. New shared logic gets a `*.test.ts` next to it.
