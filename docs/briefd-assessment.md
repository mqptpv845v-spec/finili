# Briefd — product assessment and execution plan

> **Implementation status, 2026-08-20:** the historical audit facts below describe `3e81757`. Phases 1–6 are now materially implemented. Specific-backed persistence, owner reload, live shared revisions, view-only authorization, and revocation passed repository integration and two isolated browser sessions. Validation still uses synthetic plans, so neither real-plan coverage nor external sharing is claimed.

*Evidence-backed discovery, 2026-08-20. Code facts and observed runtime behavior from the original read-only audit are cited throughout; product inferences and recommendations are labelled as such. This document remains the execution contract, with the status above taking precedence over historical present-tense findings.*

**Backend constraint agreed with the product owner:** all backend work (database, persistence, share links) targets **local development via `specific dev` only** for now. No `specific deploy` step is in scope. The implementation should avoid unnecessary coupling to the local environment, but deployment readiness is not claimed or verified in this release.

---

## Executive assessment

Briefd is a polished demo shell around one narrow but genuine capability.

The real part: an `.xlsx` upload reaches a genuine parser (`src/app/api/parse/route.ts` → `src/lib/jobOrchestrator.ts:51-160`) that matches rows against a spec database and renders honest format cards, reporting unmatched rows instead of faking them (`src/lib/briefd/mapJobs.ts:48-101`).

Most of the surrounding workflow is presentation rather than connected product behavior. The default workspace is a hand-written 22-format sample campaign, "Bevero Black Friday 2026" (`src/app/briefd/page.tsx:23-387`). The spec database holds 6 entries covering 2 of the 4 product categories (`src/lib/data/brain.json`). The share link, the "Live sync active" badge, the calendar navigation, the parse-progress loader, the early-access form, and the artboard guide overlays all look functional but are static, disconnected, or inaccurate. There is no persistence of any kind — `specific.hcl:10-30` defines one web service, no database, no storage.

**The central product gap:** the demo world and the real world never intersect. The 22 demo formats share zero rows with the 6-entry Brain, so no real upload can reproduce the demonstrated campaign. The product's stated moat — "continuously verified" publisher specs (`docs/product.md:32`) — has only minimal coverage and has no provenance, verification mechanism, or maintenance tooling.

Code quality is genuinely good: TypeScript strict, zero lint warnings, 21 passing tests, four runtime dependencies, zero npm vulnerabilities, and a mechanically enforced design-rule suite (`tests/design-rules.test.ts`). The gap is data and connectedness, not craft.

---

## Intended product

Derived from `docs/product.md`, `docs/strategy/*`, and the marketing pages.

- **Users.** Designers ("originalare") who receive Excel media plans, and media planners who hand them off. The eventual buying customer for the paid product is mid-size Stockholm agencies running 15–30 formats per campaign (`docs/product.md:38`).
- **Problem.** The manual translation step between a media plan and production-ready files. "This is not a technology problem. It is a translation problem." (`docs/product.md:9`).
- **Briefd value proposition.** Drop an `.xlsx`; each row becomes a true-proportion format card with dimensions, deadline, safe zones, and a link to the publisher's spec page; share one zero-login live link with the whole team. Free forever, acting as a lead engine for the paid product (`docs/product.md:13-19`).
- **Finali AI (Phase 2, paid).** InDesign master plus plan produces validated PDF/X files with human sign-off (`docs/product.md:21-28`). Out of scope for Briefd's first credible local release.

---

## Current reality

| Area | Intended behavior | Current reality | Evidence | Gap severity |
|---|---|---|---|---|
| Excel upload and parse | Any agency plan; "zero template restrictions" | Real, but reads sheet 1 only, requires the header on row 1, uses a fixed column synonym list, validates by file extension only, and surfaces raw library errors to the user (verified live: "Corrupted zip ?" returned with HTTP 500) | `jobOrchestrator.ts:51-99`, `briefd/page.tsx:430`, `api/parse/route.ts:23-24` | High |
| Date handling | Deadlines drive the calendar and sorting | Excel date cells become strings such as "Thu Sep 24 2026 02:00:00 GMT+0200 (Central European Summer Time)" (confirmed empirically). This breaks card display, calendar keying, and sorting simultaneously | `jobOrchestrator.ts:73`, `mapJobs.ts:85`, `types.ts:19` | Critical |
| Spec matching | Messy real-world names still match | Exact publisher equality plus exact-or-substring format match with an arbitrary four-character guard. No aliases, no diacritic folding, no confidence scoring, no "did you mean" | `jobOrchestrator.ts:105-117` | High |
| The Brain (spec database) | The moat: a verified Nordic spec database | 6 specs across 6 publishers. Zero social, zero display — two of the four product categories are empty. No spec URL, no verification date, no aliases, no deadline rules. Maintained by hand-editing JSON, which has already shipped one label bug (commit `cd0a0c0`). No schema test | `src/lib/data/brain.json`, git history | Critical |
| Format cards | Cards carry a publisher spec link | Real for matched rows, but `specsUrl` is always empty on uploads, so the spec link exists only in demo data. "1st / 2nd deliverable" badges are hardcoded to the literals "10 Sep" and "11 Sep" | `mapJobs.ts:88-91`, `FormatCardItem.tsx:16-17` | High |
| Format detail artboard | An accurate visual specification | Guide overlays are hardcoded fiction (fixed Meta percentages, "5 mm margin", "+3 mm bleed") and can contradict the safe-zone field displayed beside them. The "Official spec" button is dead on every upload. "Snap to standard" changes local state only and is silently discarded on navigation | `FormatDetailView.tsx:171-313`, `:100-108`, `:126-135` | High |
| Calendar | The campaign delivery schedule | A hardcoded September 2026 grid. Month navigation buttons have no click handler. "22 deliveries in September" is a literal. A real upload renders an empty grid with no empty state | `BriefdCalendarView.tsx:21-116`, `:229` | High |
| Spreadsheet and CSV export | A structured table with export | Works, but the CSV filename is hardcoded to the Bevero demo, export and copy ignore the active filters, quotes are not escaped, and the deadline sort ignores the month ("1 Oct" sorts before "28 Sep") | `BriefdSpreadsheetView.tsx:42-43`, `:72-93` | Medium |
| Share live brief | Zero-login live link; the core growth feature | Fake. A fixed URL with `?campaign=bevero-bf2026`; that parameter is never read anywhere, so the recipient lands on the empty dropzone (verified live). The modal claims real-time shared data and automatic data-cleaning; both are false | `ShareLiveBriefModal.tsx:22-24, 82, 89-91`, `briefd/page.tsx:468` | Critical |
| Lead capture | "Every click is a warm lead" | The submitted email is discarded while the UI states "We've saved your request" | `FinaliAIModal.tsx:17-21, 67` | High |
| Persistence | Live links, surviving reload | None. React state only. Reload loses everything, and `?format=` deep links render the dropzone (verified live) | `briefd/page.tsx:407-419`, `specific.hcl` | Critical |
| Finali AI pipeline | Cloud engine producing validated PDF/X | Local-only `.indd` and AppleScript route with zero UI callers. Exports using whichever PDF preset happens to be first in the user's InDesign install; the spec's ICC profile and PDF preset are read and never applied. Excel-derived filenames flow into an output path, creating a traversal risk | `orchestrate/route.ts`, `processJob.jsx:186` | Separate product; not blocking Briefd |
| Accessibility | Usable by keyboard and assistive tech | Keyboard users cannot upload at all: the file input is `display:none` and the dropzone is a bare div with a click handler. No explicit focus treatment is defined for the Briefd controls, several interactive elements lack keyboard semantics, and the primary data grid uses 11 px text | `briefd/page.tsx:555-582`, `globals.css:24` | High |

**Severity rubric.** Critical blocks the promised end-to-end outcome or can undermine trust in production data. High prevents an important user task or excludes a class of users. Medium degrades efficiency or correctness but has a practical workaround. Severity describes user impact, not implementation effort.

### Verification note

Live browser inspection through the Chrome extension was unavailable during this audit (the extension reported no connected browser). The findings labelled "verified live" were confirmed over HTTP against a running `next dev` server: the parse error path, the share-link destination, and the `?format=` deep-link behavior. Other implementation claims were verified by reading the code. Statements about typical agency files, expected user behavior, procurement, and market coverage are product inferences that still need validation with users and real plans.

---

## User journey today

1. **Landing on `/briefd`.** Hero and dropzone. Nothing tells the user what columns the spreadsheet must contain. The footer band already claims "22 production-ready files" before anything is uploaded.
2. **Upload.** Feedback is a text swap inside the dropzone. The dropzone stays clickable during parsing, so a second click starts a concurrent parse. A malformed file surfaces the raw library exception.
3. **Zero matches — the common case.** An honest error names the six covered publishers. It appears directly beneath the claim "Supports all agency formats" on the same screen.
4. **Partial match.** A 5.3-second loader titled "Parsing media plan: Bevero Black Friday 2026" plays *after* parsing has already finished, then the workspace opens.
5. **Review.** Unmatched rows appear in a dismissible banner. Dismissing it discards them permanently with no way to fix a row. The sidebar may display the "Bevero / Black Friday 2026" defaults plus a fabricated "Live sync active" badge.
6. **Resolving problems.** Not possible. There is no way to correct a mis-parsed row, map a column, or add a missing format. "Upload new spreadsheet" is a one-way door: cancel the file dialog and the workspace is unreachable without a reload, which destroys the session.
7. **Handoff.** Copy dimensions, copy the table, or export a CSV named after the Bevero demo. The share link sends the recipient to an empty upload page. Reload loses everything.

The complete promised job — a planner uploads a plan and the creative team receives a durable, shareable, trustworthy brief — cannot be completed today. A narrowly shaped real plan can produce cards when its publisher and format names match the six Brain entries, but the correction and handoff workflow remains incomplete.

---

## Gap analysis

### Product definition

The documentation promises two incompatible things at once: a free universal utility ("all agency formats") and a product whose value depends on a curated, verified spec database that currently has only six entries. **Likely user impact:** most representative plans will have substantial unmatched coverage, directly underneath copy promising they would not. The exact failure rate cannot be known until real plans are sampled.

### UX and interaction

There is no correction loop for messy data, so the core premise — killing Excel chaos — has no user interface behind it. Dead controls (calendar arrows, spec buttons, the "Verify Bonnier" chip, "View details" rendered as a non-focusable span) teach users that no control can be trusted. **User impact:** the tool is single-shot; the most common outcome (partial match) is also a dead end.

### Parsing and data quality

Date cells produce garbage strings. Header-row and single-sheet assumptions break on typical agency files, which routinely carry a title or logo row above the table. Deadlines are stored as display text rather than data. **User impact:** even a successfully matched plan shows wrong deadlines, an empty calendar, and broken sorting — the tool corrupts exactly the data it exists to clarify.

### Specification database

Six rows, no source URLs, no provenance or verification dates, no social or display coverage, no validation, and no ingestion path. **User impact:** this is simultaneously the moat and the bottleneck. No amount of application code makes Briefd useful without it, and a single wrong ICC profile or bleed value causes a rejected advertisement — precisely the failure the product claims to eliminate.

### Sharing and persistence

No store, no campaign entity, and no stable format identifiers (ids are derived from array position, `mapJobs.ts:74`, so they change on every re-parse). **User impact:** the headline growth feature is a false promise currently shipped in two header buttons and a modal.

### Accessibility and responsive behavior

Keyboard users cannot start the flow. Briefd defines no explicit focus treatment. Table sorting is mouse-only with no `aria-sort`. The modal has no focus trap or focus restore. The calendar has no horizontal scroll on phones, and the primary data grid renders at 11 px. **User impact:** keyboard and assistive-technology users encounter preventable barriers. Procurement impact has not been validated.

### Reliability and testing

Both parser tests build workbooks from string cells only, so the date bug is untested exactly where it breaks. There are no UI tests, no API route tests, and no schema test for `brain.json` (one would have caught the shipped label bug). `/api/parse` has no upload size limit and no rate limit.

### Documentation accuracy

`docs/product.md:42-48` and `docs/architecture.md:58-62` are commendably honest about what is unbuilt. However, the README, the marketing page, and the in-app copy state unbuilt features in the present tense, and `docs/architecture.md` is stale in two specific places. Details in the corrections section below.

---

## Product decisions

### Settled with the product owner, 2026-08-20

1. **Brain v1 category scope: broad across all four categories.** Print, OOH, social, and display must all be represented. The earlier estimate of 12–15 Nordic publishers is a starting hypothesis, not an acceptance criterion. Coverage must be defined as a named set of publisher-format combinations, chosen from real-plan frequency and backed by an authoritative source. *Reasoning:* publisher count alone says nothing about match coverage; one uncommon format from many publishers can still leave most of a plan unresolved.
2. **Unmatched data: an in-app correction interface.** The workflow must distinguish three different problems: import-level column mapping, row-level field correction, and assignment to an existing Brain spec. Manually entered dimensions or requirements remain campaign-local and are visibly labelled **user-provided**, never silently promoted to **Brain-verified** data. *Reasoning:* correction is essential, but it must not collapse the trust boundary between sourced specifications and user input.
3. **Share link: build it for real, local-first.** Postgres added to `specific.hcl`, running under `specific dev` only. *Reasoning:* it is the core promise and the interface already sells it in two places. Phase 1 removes the false claims in the meantime.
4. **Parser fixtures: synthetic.** No real agency media plans are available. Fixtures will be built from the Bauer Media material in `docs/source-material/` plus modelled spreadsheet shapes (title rows above the header, Swedish column names, real date cells, merged cells, multiple sheets). **This is the plan's main accepted risk — see below.**

### Still open

5. **Demo mode.** Keep the Bevero sample campaign? *Recommended:* yes, but explicitly labelled as a demo and structurally prevented from leaking its name, CSV filename, or share link into a real session. The sample is useful for evaluation; the leakage is the actual defect.
6. **Finali AI surface inside Briefd.** *Recommended:* keep an honest "coming soon" explanation, but do not claim to save an email until the team operates a real lead destination. Do not touch the InDesign engine in this release.
7. **Calendar in release one.** *Recommended:* build it against real data. The typed date model is required anyway, and the calendar is the most visible payoff from that work.
8. **`.idml` versus `.indd` for Finali AI.** Not required for Briefd's first release, but it must be settled before any engine work. The strategy documents' margin thesis (IDML as open XML, needing no Adobe licence) and the current implementation (`.indd` driven by a local InDesign install) are mutually exclusive.
9. **Share-link permissions and lifecycle.** Must be settled before persistence work: view-only or editable, token shape, revocation, expiration, and what deletion means. *Recommended:* opaque, unguessable, revocable view-only links; editing stays in the originating session for the local release.
10. **Uploaded-file retention.** Must be settled before adding object storage. *Recommended:* store only normalized campaign data unless a concrete workflow requires the original workbook. Avoid adding object storage by default.

### Accepted risk: synthetic parser fixtures

Without real media plans, the parser can pass a full test suite and still fail on the first genuine file, because many important failure modes come from human spreadsheet habits rather than from the file format. Synthetic fixtures reduce implementation risk but do not validate product coverage. Mitigations built into the plan:

- Fixtures deliberately model the known-hostile shapes rather than clean tables: a title or logo row above the header, Swedish column names, genuine date cells rather than date-shaped strings, merged cells, trailing blank rows, and a second worksheet.
- The correction interface (Phase 4) is the structural mitigation. It means an unanticipated parse failure degrades into a fixable worklist instead of a dead end, which is precisely why decisions 2 and 4 belong together.
- Acquire several anonymized real plans before fixing the Brain v1 acceptance list. When a real plan becomes available, the parser, matching, and correction workflow must be re-verified against it. Budget this as expected refinement rather than treating the synthetic suite as final.

---

## Recommended first credible local release

### Complete user outcome

A media planner uploads a representative Nordic media plan. Briefd parses it, matches rows against a verified spec set, and shows exactly which rows matched and which did not. The planner fixes import-level and row-level problems inside the application without confusing user-provided values with verified specs. The result is a campaign workspace with correct cards, real deadlines on a working calendar, and functioning spec links. The creative team can export the table and open every publisher's specification page. The workspace survives a reload.

The local release also proves the mechanics of a zero-login, view-only share link in two browser sessions connected to the same local environment. It does **not** claim that an external colleague can open the link until the service is deployed and the deployment, security, and retention behavior have been verified.

### Scope boundaries

Single-user editing (no authentication, no concurrent editing). Shared access is view-only. Backend runs locally through `specific dev`; external availability is not part of this release. No PDF generation. No Finali AI engine work. No Creative Build Sheet.

### Acceptance criteria

- A realistic `.xlsx` containing a title row above the header, Swedish column names, and genuine date cells parses correctly, with dates handled as typed values rather than stringified objects.
- Every source row is traceable through import. Import-level column mapping is separate from row-level correction.
- Every row either matches a Brain spec or appears in a fix-it list. A listed row can be assigned to a verified spec or completed with visibly labelled campaign-local, user-provided values.
- Every Brain-verified card carries a working publisher specification link and verification metadata. User-provided cards never imply publisher verification.
- The calendar and sort order derive from parsed dates and work for any month. Arbitrary deliverable-wave badges are removed unless the source input explicitly defines the wave label and date.
- A view-only share link opens the same campaign in a second browser session connected to the local environment, and reloading preserves the workspace. External sharing remains unclaimed.
- No user-facing string states a capability that does not exist, and no demo name appears in a real session. Zero dead controls remain.
- Upload is completable using only the keyboard, and parse errors are human-readable and returned with a 4xx status.
- `npm run check` and `npm run build` both pass, with new tests covering parsing, matching, and date handling.

---

## Execution plan

The ordering below deliberately prioritises one complete vertical workflow over scattered interface improvements.

### Phase 0 — Evidence and release contract

**Objective.** Replace coverage assumptions with evidence before committing to the Brain backlog.
**User-visible outcome.** None directly; this phase prevents the product from being built around synthetic plans that do not resemble agency work.
**Work.** Obtain several anonymized media plans from the intended users; inventory publisher-format frequency, category mix, header patterns, date representations, and handoff needs; define the named Brain v1 publisher-format list and its authoritative source for each entry. Record a small set of outcome metrics, such as row import rate, verified match rate, correction rate, time to a shareable brief, and unresolved-row rate.
**Dependencies.** Access to representative plans or guided sessions with intended users.
**Acceptance.** Brain v1 is a named, sourced format list rather than a publisher-count target; parser fixtures reflect observed workbook structures; every remaining product assumption is explicitly labelled.
**Verification.** Trace each proposed Brain entry and fixture shape back to at least one source plan, user observation, or authoritative publisher source.
**Risks.** External coordination. If plans cannot be obtained, the rest of the work may proceed as a technical prototype, but match-coverage claims remain unvalidated.

### Phase 1 — Truth pass

**Objective.** Remove every fabricated claim and every dead control.
**User-visible outcome.** The application stops making false statements.
**Code areas.** `ShareLiveBriefModal` (remove or gate until Phase 6), `FinaliAIModal` copy, `BriefdSidebar.tsx:166-168`, `PreflightLoader`, the calendar's dead navigation buttons, the dead spec links in `FormatDetailView` and `BriefdSpreadsheetView`, the "Supports all agency formats" copy, the hardcoded Bevero strings, plus error mapping and a 4xx status in `/api/parse` and an upload size limit.
**Dependencies.** None.
**Acceptance.** No user-facing string asserts an unimplemented capability; every visible control does something.
**Verification.** Manual walk-through of both the sample and upload flows in a browser; `npm run check`.
**Risks.** Low. This phase only removes and corrects.

### Phase 2 — Real data model

**Objective.** Convert display strings into typed data.
**User-visible outcome.** Correct deadlines everywhere they appear.
**Code areas.** `types.ts` (structured dimensions, typed dates, stable source-row identifiers, verification state), `jobOrchestrator.ts` (date-cell handling, header-row detection, and an explicit sheet-selection rule rather than blindly combining sheets), `mapJobs.ts`, plus tests using real date cells and deliberately messy sheets.
**Dependencies.** None.
**Acceptance.** A date cell round-trips to a correctly formatted deadline; identifiers remain stable across equivalent re-parses; every output or unmatched row is traceable to its source sheet and row.
**Verification.** Unit tests against synthetic fixture workbooks that deliberately model hostile shapes: a title row above the header, Swedish column names, genuine date cells, merged cells, trailing blank rows, and a second worksheet.
**Risks.** Touches every view, though strict typing turns that into compile errors rather than silent breakage. The larger risk is fixture realism — see the accepted-risk note in the decisions section.

### Phase 3 — Brain v1

**Objective.** Populate the evidence-backed Brain v1 format list across all four categories with source URLs, verification dates, provenance, and aliases; add schema validation; make matching alias-tolerant and diacritic-tolerant with a confidence guard.
**User-visible outcome.** Representative plans match the agreed verified formats across print, OOH, social, and display, and verified cards carry working source links.
**Code areas.** `src/lib/data/brain.json` (likely split per publisher at this size), `jobOrchestrator.ts:105-117`, plus a new validator test.
**Dependencies.** Phase 0 and settled decision 1. Print and OOH accuracy depends on open question 2.
**Acceptance.** Every spec has an authoritative source and verification date; representative fixture rows for every included format match; the schema test fails on malformed or unsourced entries; uncertain matches are not silently accepted.
**Verification.** Per-format fixture rows, matching tests, and a source review of every Brain entry.
**Risks.** **The highest-stakes work in the plan.** Every specification needs a checked source, because a wrong value silently produces a rejected advertisement.

### Phase 4 — Correction experience

**Objective.** Build the fix-it loop without weakening the product's trust model.
**User-visible outcome.** The import flow first resolves workbook-wide column mapping, then presents unresolved rows as an actionable worklist. Users can assign a verified Brain spec or enter campaign-local values that remain visibly user-provided. An on-page column contract removes the guesswork before upload.
**Code areas.** New organisms under `src/components/briefd/`, plus keyboard accessibility for the upload control.
**Dependencies.** Phases 2 and 3.
**Acceptance.** A deliberately messy plan can be brought to a complete workspace without leaving the application, with every field visibly identified as Brain-verified or user-provided.
**Verification.** Browser test using a messy plan.
**Risks.** Scope creep. Constrain edits to the fields the cards actually display.

### Phase 5 — Views over real data

**Objective.** Derive the workspace from actual data before adding distribution infrastructure.
**User-visible outcome.** Any month renders correctly; the CSV is named after the real campaign, respects active filters, and escapes quotes; guide overlays reflect each spec's own safe-zone and bleed values, or are hidden when unknown.
**Code areas.** `BriefdCalendarView`, `BriefdSpreadsheetView`, `FormatDetailView`, and removal of arbitrary badge logic in `FormatCardItem` unless a source-backed wave field is introduced.
**Dependencies.** Phases 2 through 4.
**Acceptance.** An uploaded plan spanning two months renders correctly and consistently in cards, calendar, table, detail, copy, and export views.
**Verification.** Browser checks with a multi-month uploaded plan, plus focused tests for sorting and CSV serialization.
**Risks.** The artboard overlays need a defined fallback for specs with unknown safe zones; showing nothing is correct, showing a guess is not.

### Phase 6 — Persistence and local share-link proof

**Implementation result, 2026-08-20.** Completed locally with normalized Postgres storage, separate hash-only owner/share capabilities, optimistic revisions, redacted shared DTOs, active-link/update serialization, owner reload, and immediate revocation. The browser proof uses `?campaign=<campaign-id>` plus an HttpOnly owner capability cookie for editing and `?share=<opaque-token>` for view-only access.

**Objective.** Make campaigns durable and prove view-only share-link mechanics locally.
**User-visible outcome.** The plan is saved on upload, `/briefd?campaign=<opaque-token>` loads it in a second local browser session, and reloads are safe.
**Code areas.** `specific.hcl` (add Postgres, then run `specific check`), a minimal campaign entity with stable identifiers, save and load API routes, and the share modal re-enabled against real data. Add object storage only if decision 10 establishes a need to retain original workbooks.
**Constraint.** Runs under `specific dev` only. No deploy step and no external-sharing claim in this release.
**Dependencies.** Phases 2 through 5; decisions 9 and 10. The `specific` skill must be loaded before any infrastructure work.
**Acceptance.** Two local browser sessions, one opaque view-only link, identical campaign; reload preserves state; the link can be revoked; edit controls do not appear in the shared view.
**Verification.** Cross-browser link, reload, revocation, and authorization-boundary tests against the local stack.
**Risks.** Schema design and accidental permission leakage. Keep the model minimal: a campaign owns source-row records, resolved formats, unresolved rows, and share tokens.

### Phase 7 — Closeout

**Objective.** Harden accessibility, reliability, and documentation accuracy.
**User-visible outcome.** Visible focus styles, screen-reader announcements, labelled controls, a scrollable mobile calendar, and no UI that claims an unavailable capability.
**Code areas.** Global focus styles, live regions, `Modal` focus trap and restore, the calendar's mobile overflow, capability-based tests for hidden or disabled unfinished actions, and documentation updates. Keep lead capture disabled or explicitly non-submitting until it can store a real lead in an environment the team operates.
**Dependencies.** All prior phases.
**Acceptance.** The full flow is completable by keyboard; unfinished capabilities are absent or explicitly labelled; documentation matches the behavior under test.
**Verification.** Keyboard-only and responsive browser walk-throughs, focused accessibility checks, `npm run check`, `npm run build`, and an autoreview pass on the branch.

---

## Backlog — later, not release one

- **Creative Build Sheet.** Clustering booked formats by aspect ratio to compute the minimum number of master layouts. `docs/product.md:44` calls it the most distinctive idea in the briefs, but no clustering rule, ratio tolerance, or acceptance criteria are defined anywhere. It needs a specification before it can be estimated.
- **Real-time updates on shared links.** Requires a sync channel layered on Phase 6.
- **Blank InDesign template download** per publisher format (`docs/product.md:46`).
- **Overset-text detection.** The `anomaly` field is a stub with one hand-written demo instance and no detector.
- **Finali AI engine.** Settle `.idml` versus `.indd`; build cloud rendering; actually apply each spec's `pdf_preset` and `icc_profile` (both ignored today at `processJob.jsx:186`); fix the traversal risk in generated output filenames; gate `/api/orchestrate` off outside local development.
- **Authentication, multi-user editing, approvals and the audit trail** (the ALG 20 legal shield), analytics, and deployment.

---

## Documentation corrections

| Location | Correction |
|---|---|
| `docs/architecture.md:18, 60` | Briefd no longer renders only demo data; the upload path was wired in commit `331a055`. |
| `docs/architecture.md:52` | Page resizing is implemented in `processJob.jsx:89-147`, not only in `src/scripts/experiments/`. State which implementation is authoritative. |
| `docs/product.md:32` | The Brain does not contain Bonnier News, Schibsted, Bauer Media, or SDR. It contains SvD, DN, Dagens Industri, JCDecaux, Clear Channel, and Wall Street Media. |
| `README.md:7` | Presents the live share link and per-card spec links as shipped. Label as vision, or add a status column. |
| `docs/contributing.md:22-28` | Overstates enforcement: the suite does not catch literal capitals (only the `uppercase` utility), and the arbitrary-size rule is scoped to Briefd files, so the marketing page's arbitrary sizes pass. |
| `docs/strategy/*` | Describe Creative Build Sheet, Production Runway, IDML templates, and live links in the present tense. Add a "vision, not specification" disclaimer at the top of each. |
| In-app and marketing copy | Covered by Phase 1, including the site metadata claim at `layout.tsx:14`, the Swedish internal note rendered at `page.tsx:141-146`, and the "Finali Technologies AB" footer identity, which the repository's own honesty rule bans unless verified. |

---

## Open questions

Only questions that cannot be answered from the repository and that would materially change the plan.

1. **Which representative media plans and users can inform Phase 0?** The repository contains no real plan and therefore cannot establish publisher-format frequency, typical category mix, or a realistic verified-match target.
2. **Which specification sources count as authoritative for print and OOH?** Social and display specs are publicly documented and can be sourced and cited without help. Print and OOH specs — bleed, ICC profile, PDF standard — often live in publisher PDFs or order confirmations rather than on a public page. The repository contains one Bauer Media order confirmation in `docs/source-material/` and nothing else. If similar material exists for Bonnier, Schibsted, JCDecaux, or Clear Channel, it directly raises the accuracy of the highest-risk half of the Brain.
3. **Has the ALG 20 liability-shift claim been legally verified?** No source exists in the repository. It only matters before the paid product ships, but it anchors that product's entire pitch.

*Resolved 2026-08-20: broad four-category Brain direction, unmatched-row strategy, local share-link approach, and fixture strategy. The exact Brain format list remains gated on Phase 0 evidence. See the decisions section above.*

---

## Summary

**The five highest-leverage next actions**

1. Acquire representative anonymized plans and define the named, sourced Brain v1 format list (Phase 0).
2. Run the truth pass so the product stops claiming unavailable behavior (Phase 1).
3. Fix date parsing and adopt the traceable typed data model (Phase 2).
4. Build verified Brain coverage and the correction workflow together (Phases 3–4), preserving the distinction between verified and user-provided data.
5. Make every workspace view correct over real data before proving persistence and share-link mechanics locally (Phases 5–6).

**The single biggest product risk**

The specification database. It is the stated moat, it holds six rows, it has no verification mechanism, and it has already shipped a data error. If a designer ever receives one wrong bleed or ICC value from Briefd, the product's only real asset — trust — is gone.

**The decision to make first**

Identify which representative real plans can be used for Phase 0. Those plans determine Brain v1's named publisher-format coverage, fixture shapes, and credible match-rate target; without them, the plan remains a well-engineered technical hypothesis.
