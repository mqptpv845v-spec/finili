# How we work in this repo

*A practical guide. Written for humans, including humans who build through an AI agent. Five minutes to read.*

## The one rule that matters

**Nothing is "done" until `npm run check` and `npm run build` both pass.**

```bash
npm run check   # types + lint + all tests (including the design-rule tests)
npm run build   # the production build
```

If you work through an AI agent, end every task prompt with:

> Run `npm run check` and `npm run build` and fix any failures before you finish.

GitHub runs the same checks on every push (the "CI" badge on the repo). If CI is red, the change is not done — no exceptions.

## The design system is enforced by tests

The visual rules (docs/design-system.md) are not suggestions. A test suite scans the code and **fails the build** if anyone writes:

- a raw hex color (`#520037`) instead of a token (`bg-plum`)
- any shadow, scaling hover, ALL-CAPS text, or monospace font
- a made-up font size in the Briefd app instead of the 5 scale tokens
- a file over 5 MB, or runtime output (`.tmp/`, `public/output/`) into git

When that test fails, the error message names the file, the line, and the rule. The fix is always: change the code to follow the rule. Never delete or edit the test to make it pass — that defeats the whole system.

## Adding things — where they go

| You want to add… | Where it goes |
|---|---|
| A new publisher spec | One new entry in `src/lib/data/brain.json` — nothing else |
| A new Briefd category | One new entry in `src/lib/briefd/categories.ts` — nothing else |
| A button, dialog, or any UI piece | **First look in** `src/components/atoms/` and `molecules/`. Reuse or add a variant prop. Only create a new file if nothing fits, and put it at the smallest level (atoms → molecules → briefd) |
| Parsing / matching / calculation logic | `src/lib/`, with a `*.test.ts` file next to it |
| A server, database, storage, or deploy change | `specific.hcl`, then run `specific check` |

## Commits

- One change per commit. "Fix matching + redesign sidebar + update docs" is three commits.
- The message says what changed and why. Future-you reads these.
- Never `git add .` blindly — look at `git status` first. If you see hundreds of files, stop; something (like build output) is leaking in.

## For agent-driven work, prompt like this

Good prompts for your agent in this repo:

> "Add a Bonnier News full-page spec to The Brain. Follow CLAUDE.md. Run npm run check and npm run build before you finish."

> "Build a settings modal. Reuse the existing Modal molecule and Button atom. Follow docs/design-system.md. Run the checks."

Bad prompt: "make it look nicer" — the agent will drift outside the design system, and the tests will fail. Point it at `docs/design-system.md` instead.

## Running locally

```bash
npm install
specific dev     # full environment (Specific admin on :3000, app on the printed port)
# or
npm run dev      # plain Next.js on :3000
```

The Finali AI PDF pipeline (`/api/orchestrate`) only works on a Mac with Adobe InDesign 2026 installed.
