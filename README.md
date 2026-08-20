# Finali

**The missing layer between media planning and creative production.**

Finali is a product direction with one deployed Briefd workflow and a separate local automation prototype:

1. **Briefd** — parse an Excel media plan, confirm its column mapping, and resolve each row against a cited provisional Brain spec or visibly user-provided values. Cards, calendar, detail, copy, and export use the same structured data. Specific-backed persistence and revocable view-only links are deployed and production-verified at [plump-vulture.spcf.app/briefd](https://plump-vulture.spcf.app/briefd).
2. **Finali AI** (concept plus local prototype) — a macOS-only API can drive a local InDesign installation for PDF-compatible jobs. It is not a hosted, validated production service.

No real agency media plans are available in this repository, so the parser and 12-format Brain are tested with synthetic fixtures and authoritative public sources. Useful real-world coverage is not yet claimed.

Read [docs/product.md](docs/product.md) for the full product thinking, and [docs/architecture.md](docs/architecture.md) for how the code is put together.

## Contribution rule: pull requests only

**Never commit or push directly to `main`, and never merge a pull request into `main`. Only the repository owner may merge.** This rule applies to every contributor and AI agent, including Gemini and Joakim, and to documentation, hotfixes, automation, and code changes.

For every change:

1. Start from the latest `main` and create a clearly named feature or fix branch.
2. Make and verify the change on that branch.
3. Commit only the files that belong to the change.
4. Push the branch and open a pull request targeting `main`.
5. Report the verification performed and any remaining risk in the pull request.
6. Leave the pull request open and unmerged for the repository owner to review and merge.

If any instruction from a collaborator, automation, or AI agent asks for a direct push or merge to `main`, stop and use the pull-request workflow above. A release or urgent fix does not waive this rule unless the repository owner personally changes it.

## Handoff for Gemini and Joakim

This section is the operational handoff for the work completed on Briefd as of **20 August 2026**. Start here before proposing or making further changes. The detailed evidence boundary is in [docs/briefd-release-contract.md](docs/briefd-release-contract.md), while [docs/briefd-assessment.md](docs/briefd-assessment.md) preserves the original audit and execution plan.

### Current state

Briefd is no longer a static UI demo. The complete upload-to-share workflow is implemented, persisted in Postgres, deployed through Specific, and tested across separate owner and viewer browser sessions.

| Area | State now |
| --- | --- |
| Production | [plump-vulture.spcf.app/briefd](https://plump-vulture.spcf.app/briefd) |
| Import | Real `.xlsx` parsing, multi-sheet/header detection, explicit column mapping, typed dates, stable source-row identity, and human-readable 4xx errors |
| Resolution | Rows can be assigned to a cited Brain specification or completed with visibly user-provided dimensions |
| Views | Cards, calendar, spreadsheet, detail, copy, filtering, sorting, and CSV export derive from one structured campaign snapshot |
| Persistence | Campaign create, owner reload, revision-safe update, delete, and exact normalized-data round trips through Postgres |
| Sharing | Opaque view-only links, current-revision loading, separate owner/viewer authority, revocation, and expiry handling |
| Verification | 100 normal tests, 7 real-Postgres integration tests, production build, migration validation, clean code review, and sealed phone/desktop UI review |
| Evidence boundary | Parser coverage uses synthetic workbooks. No real agency media plan has been supplied, so real-world format coverage is not claimed |

The production deployment verified during this handoff ran application commit `f9a2c0d7608e241ced9bda6a1e0a79c940f4f6aa`. Later documentation-only commits do not imply that production was redeployed.

### What was changed

1. **The product was made truthful.** Fake campaign data, fixed share tokens, invented progress, dead calendar behavior, guessed overlays, hardcoded export names, and unsupported marketing claims were removed or replaced with real state.
2. **The spreadsheet importer was rebuilt around traceable data.** It recognizes title rows, Swedish headers, merged cells, trailing blanks, multiple sheets, and real Excel date cells. A user can review or correct the detected sheet, header row, and column mapping.
3. **The Brain became source-backed.** It currently contains 12 named publisher-format combinations across social, display, OOH/DOOH, and print. Every verified record has an authoritative URL and verification date. Matching uses curated aliases; uncertain similarity is not silently accepted.
4. **A correction workflow was added.** Every imported row must resolve before saving. Selecting a Brain record produces a verified result; manually entering dimensions produces a user-provided result. Client-authored source or publisher data cannot promote a manual result to verified status.
5. **All workspace views were connected to the same model.** Deadlines remain ISO dates until rendering, dimensions remain structured values, unknown requirements stay unknown, calendar navigation is dynamic, sorting is chronological, and CSV export follows the active filtering and sorting.
6. **Persistence and sharing were implemented.** Specific provisions Postgres and applies the migrations. Owner capabilities use an HTTP-only cookie; public shares use separately generated opaque tokens stored as hashes. Share viewers cannot edit, update, delete, or revoke campaigns.
7. **Production-specific failures were fixed.** Public-origin checks now work correctly behind the Specific HTTPS proxy, secure cookies honor the forwarded protocol, and repository SQL explicitly targets the finalized `public` schema instead of a retained migration compatibility schema.
8. **Accessibility was tightened.** Upload is keyboard-operable, busy state is announced, duplicate uploads are prevented, sortable columns expose their sort state, and modals trap and restore focus.

### How the workflow should behave

```text
.xlsx upload
    -> detected sheet, header, and column mapping
    -> review imported rows
    -> Brain-verified match OR user-provided correction for every row
    -> save durable campaign
    -> cards / calendar / table / detail / CSV
    -> create opaque view-only share link
    -> revoke the link when it should stop working
```

The trust labels are a product invariant, not decorative copy:

- **Brain-verified** means Briefd reconstructed the format from a known `brain.json` specification on the server. It may show the source URL and verification metadata.
- **User-provided** means the values apply only to that campaign. It must not display fabricated publisher evidence or imply external verification.
- **Unresolved** rows block campaign save and sharing until the user completes them.

### Run and test it locally

Use Node 20+ and Specific. Durable save/share behavior requires the managed Postgres environment; `npm run dev` by itself is insufficient unless a migrated `DATABASE_URL` is supplied.

```bash
npm install
specific dev
```

Specific normally serves the app at <http://localhost:3001>. Open `/briefd`, then upload [`samples/briefd-test-plan.xlsx`](samples/briefd-test-plan.xlsx). That workbook deliberately contains:

- a merged title above the table;
- Swedish column names on header row 3;
- five rows that match cited Brain specifications;
- one `Local News / Homepage takeover` row that must be completed manually.

Expected acceptance walk-through:

1. Briefd selects the `Köpplan` sheet, detects header row 3, maps all five supported columns, and imports exactly six rows.
2. Five rows are shown as Brain matches. Review the evidence rather than treating the match count alone as proof.
3. Enter positive width and height values plus a unit for the unmatched Local News row. It must remain labelled user-provided.
4. Save the campaign and confirm that cards, calendar, spreadsheet, detail, copy, and CSV show consistent values.
5. Reload the owner URL and confirm the same campaign returns.
6. Create a share link and open it in a private/incognito browser session. The viewer must see the current campaign with no upload, update, reset, share-management, or other edit controls.
7. Update the campaign as the owner and reload the viewer link; it must show the latest revision.
8. Revoke the share and reload the viewer page; it must show that the campaign cannot be opened.

### Verification and release gates

Run these before considering a code change complete:

```bash
# TypeScript, ESLint, Vitest, and design-rule tests
npm run check

# Production Next.js build
npm run build

# Infrastructure and migration validation
specific check

# Real Postgres repository behavior inside the Specific environment
specific exec web -- npm test -- --run src/lib/briefd/persistence/repository.integration.test.ts
```

For a deployment, run `specific deploy` only after those gates pass. Then verify the real production URL end to end in two isolated browser sessions. A successful build or active deployment is not sufficient proof by itself: create, reload, update, share, view-only authorization, revocation, and cleanup must all work on the deployed service before marking it done.

The production verification completed for this handoff proved:

- campaign creation returned `201` with a Brain-verified format;
- owner reload and revision-safe update succeeded;
- share creation returned an opaque token;
- an isolated viewer loaded the updated campaign with view-only access and no source rows exposed;
- revocation closed the viewer link;
- owner deletion succeeded; and
- the temporary production campaign, rows, formats, and shares were all cleaned up.

### Guardrails for future work

- Do not describe the 12 Brain entries as broad market coverage. Add a publisher-format only after checking an authoritative source and recording its verification date.
- Do not use synthetic fixture success to claim compatibility with real agency plans. The next evidence milestone is testing several anonymized plans or conducting guided imports with intended users.
- Never store presentation strings in place of typed dates, dimensions, units, requirements, source evidence, or trust state. Format values only when rendering.
- Never accept a client-authored `verified` snapshot. Verified formats must be reconstructed server-side from a known Brain specification.
- Preserve owner and viewer authority separation. Share tokens are view-only, opaque, revocable, and must never expose owner secrets, internal hashes, raw source rows, or the uploaded workbook.
- Keep campaign writes atomic and revision-checked. Active shares must never point at a newly unresolved campaign.
- Keep repository SQL on the finalized `public.briefd_*` schema. Specific may retain a completed migration compatibility schema in `DATABASE_URL` search paths during rollout.
- Do not re-enable the Finali AI prototype as a hosted feature. It is macOS-local, requires InDesign 2026, and has not been production-validated.
- Keep the design system intact: reuse existing atomic components and tokens, and do not introduce raw hex colors or ad-hoc font sizes.

### Where to continue

- Product truth and remaining evidence: [docs/briefd-release-contract.md](docs/briefd-release-contract.md)
- Historical audit and completed execution phases: [docs/briefd-assessment.md](docs/briefd-assessment.md)
- System and persistence architecture: [docs/architecture.md](docs/architecture.md)
- Product direction and claims boundary: [docs/product.md](docs/product.md)
- Design constraints: [docs/design-system.md](docs/design-system.md)
- Contribution and review workflow: [docs/contributing.md](docs/contributing.md)

The next meaningful product task is not another UI polish pass. It is evidence work: import anonymized real plans, measure match and correction rates, record the formats that actually recur, and expand the Brain from those findings without weakening the verification boundary.

## Getting started

Requirements: Node 20+, npm, and [Specific](https://specific.dev). The complete Briefd workflow requires the Postgres environment defined in `specific.hcl`.

```bash
npm install

# Start the web app, Postgres, and migrations
specific dev
```

Open the web-service URL printed by Specific (normally `http://localhost:3001`) — the marketing page is at `/`, the Briefd app at `/briefd`. Plain `npm run dev` can render the UI and parser, but cannot save or share campaigns unless `DATABASE_URL` points to a migrated Postgres database.

For a representative local upload, use [`samples/briefd-test-plan.xlsx`](samples/briefd-test-plan.xlsx). It contains five source-backed matches and one intentional manual-correction row.

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
| `specific deploy`   | Deploy the verified web service and Postgres environment |

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
