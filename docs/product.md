# Product — what Finali is and why

*(English summary of the Swedish strategy briefs in [docs/strategy/](strategy/). Those originals remain the source for business detail.)*

## The problem

Between a media plan (an Excel sheet from the media agency) and finished ad files (made by designers) sits a manual, error-prone translation step. Formats are described in inconsistent spreadsheet rows; specs live on scattered publisher web pages; deadlines and file requirements get lost in email chains. Producing a campaign's 15–30 formats is boring, expensive, senior-level work.

> "This is not a technology problem. It is a translation problem."

## The two products

### Briefd — Phase 1, free forever

A lightweight visual web tool that kills the Excel chaos in the creative handoff:

- Drag in an `.xlsx` media plan → each row becomes a **format card** with true proportions, exact dimensions, deadline, safe zones and a link to the publisher's spec page.
- Share one **zero-login live link** with the whole team. No downloads, no version conflicts.
- Free on purpose: brand awareness, data on which formats/publishers dominate the Nordics, direct contact with the designers who feel the pain, and every "Automate with Finali AI" click is a warm lead.

### Finali AI — Phase 2, the paid engine

A deterministic production engine:

- Upload an InDesign master (`.idml`) + the Excel media plan.
- Map columns to variables once; the system generates every campaign format as print-ready PDF/X.
- Review in a visual preview grid (text overflow flagged), approve, download a ZIP of correctly named files.
- Nothing exports without human sign-off (**the ALG 20 legal shield**: the active approval creates an audit trail and places proofing liability with the buyer).

## The three pillars

1. **The spec database ("The Brain")** — machine-readable, continuously verified specs from Nordic media houses and OOH operators (Bonnier News, Schibsted, Clear Channel, JCDecaux, Bauer Media, SDR): dimensions, bleed, safe zones, ICC profiles, PDF/X standard, deadlines, filename conventions. This is the moat. In code: `src/lib/data/brain.json`.
2. **Automated file generation** — `.idml` is open XML in a ZIP, so parsing and text injection are cheap server-side. Generative expand only for extreme ratio changes. PDF/X render at export.
3. **Human-in-the-loop approval** — the legal and quality shield described above.

## Customers and pricing

- **Primary:** mid-sized ad/production agencies in Stockholm — 15–30 formats per campaign, no offshore DTP volume. A senior originalare costs ~700 SEK/h; saving 20 h/month pays the licence.
- **Secondary:** in-house teams at fast-moving B2B/B2C brands.
- **Pricing:** Briefd free forever. Finali AI: Growth 4 900 SEK/month (≤5 active campaigns), Enterprise 14 900 SEK/month (unlimited). Campaign-volume based, not per-seat.

## Roadmap ideas from the briefs (not yet built)

- **Creative Build Sheet** — cluster booked formats by aspect ratio and compute the minimum number of master layouts ("24 booked formats need only 3 originals"). The most distinctive idea in the briefs.
- **Zero-login live links** with real-time updates (needs a backend store).
- **Blank template download** — one-click empty InDesign templates with exact measurements, margins and bleed per publisher.
- **Overset-text detection** in the preview grid (the `anomaly` field in the data model is the stub).

## Positioning language worth keeping

- "This is not a tool where you design. It is the tool you use to execute and spit out the files once the design is done."
- "Boring AI" — an extremely dull, expensive, admin-heavy problem in a niche with proven willingness to pay.
