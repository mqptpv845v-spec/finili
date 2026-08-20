# Briefd — local release contract

*Evidence boundary recorded 2026-08-20. This contract defines the behavior that can be verified from the repository and authoritative public sources. It does not claim validation against real agency media plans; none are available in the repository.*

## Outcome

A planner can upload an `.xlsx` workbook, confirm how its columns were interpreted, resolve every row, and produce a durable campaign workspace. Each resolved placement is visibly identified as either:

- **Brain-verified** — matched to a sourced specification in `src/lib/data/brain.json`.
- **User-provided** — completed for this campaign by the user and not represented as publisher-verified.

Cards, calendar, table, detail, copy, and export views must derive from the same campaign data. The local environment must prove persistence and an opaque, revocable, view-only share link across two browser sessions. External sharing is not claimed until deployment is separately authorized and verified.

## Provisional verified coverage

Coverage is measured in named publisher-format combinations, not publisher count. The initial Brain contains 12 combinations across all four product categories:

| Category | Publisher or platform | Formats |
|---|---|---|
| Social | LinkedIn | Single Image landscape, square, vertical |
| Display | Google Display | 300 × 250, Sweden 980 × 120 panorama, 320 × 100 |
| OOH / DOOH | JCDecaux | Eurosize inclusive print, Digisize portrait |
| OOH / DOOH | Bauer Media Outdoor | Digital Adshel, Digital Billboard HD |
| Print | Dagens Nyheter | News spread full height, news spread half height |

Every record carries its source URL, authority class, and verification date. Unknown requirements are omitted rather than represented as zero. Publisher aliases reflect current branding where supported—for example, Bauer Media Outdoor accepts the former Clear Channel name as an input alias without changing the verified publisher identity shown to the user.

## Authoritative sources

- LinkedIn single image specifications: <https://www.linkedin.com/help/linkedin/answer/a426534/single-image-ads-advertising-specifications?lang=en-us>
- Google uploaded display specifications: <https://support.google.com/google-ads/answer/1722096?hl=en>
- JCDecaux Eurosize inclusive print: <https://jcdecaux.se/wp-content/uploads/2025/08/Eurosize-ink-tryck-Materialspecifikation-Staende-2025-4.pdf>
- JCDecaux Digisize: <https://jcdecaux.se/wp-content/uploads/2025/08/Digisize-Materialspecifikation-Staende-2025-1.pdf>
- Bauer Media Outdoor Digital Adshel: <https://www.bauermediaoutdoor.se/specifikationer/digital-adshel>
- Bauer Media Outdoor Digital Billboard: <https://www.bauermediaoutdoor.se/en/specifications/digital-billboard>
- Dagens Nyheter News formats: <https://dn.ocast.com/sv/products/3336/nyheter>
- Dagens Nyheter daily press requirements: <https://dn.ocast.com/specifications/-284>

The repository also contains a Bauer Media Outdoor Station Domination campaign email and specification link. That specification requires a separately supplied InDesign template and does not publish the installation dimensions, so it is evidence for workbook fixtures and workflow requirements but is deliberately not represented as a dimension-complete Brain format.

## Import contract

Briefd must:

- inspect multiple worksheets and the first 30 rows for a recognizable header;
- preserve the selected sheet, header row, source row number, and raw values;
- normalize genuine Excel date cells to `YYYY-MM-DD` without timezone display text;
- keep incomplete rows available for correction instead of discarding or fabricating them;
- allow an explicit sheet, header row, and column mapping;
- reject files larger than 10 MB and return human-readable 4xx errors;
- keep stable source-row identifiers across equivalent parses.

## Matching contract

- Publisher and format matching is case-, whitespace-, punctuation-, and diacritic-insensitive.
- Only canonical names and curated aliases are accepted automatically.
- Loose substring or edit-distance matches are suggestions at most; they must not silently become verified matches.
- A Brain record is invalid without a unique id, complete dimensions in exactly one unit, a supported category, and at least one HTTPS source with a verification date.

## Local sharing and retention contract

- The originating local session can edit a campaign.
- An opaque share token grants view-only access to one campaign.
- A token can be revoked.
- Shared views never expose edit controls or the original workbook.
- The local database stores normalized campaign data. The original `.xlsx` is not retained unless a later, documented workflow requires it; object storage is therefore not part of the initial persistence design.

## Evidence still required

Before Briefd can claim useful real-world coverage, obtain several anonymized plans or conduct guided import sessions with intended users. Measure:

- source-row import rate;
- verified match rate;
- correction rate;
- unresolved-row rate;
- time from upload to a complete brief;
- publisher-format frequency and category mix.

Those observations determine which publisher-format combinations are added next. Synthetic fixtures protect parser behavior; they do not validate market coverage.
