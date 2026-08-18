# Design system — the canonical spec

This file supersedes the earlier `TYPOGRAPHY_RULES.md` (root) and reconciles it with `.gemini/rules/`. Where the two disagreed, this document wins. Tokens live in `src/app/globals.css` (`@theme`); the atoms in `src/components/atoms/` implement the rules by construction.

## 1. Color — tone-on-tone pairs only

| Token | Hex | Paired with | Hex |
|---|---|---|---|
| `petrol` | `#173537` | `cyan` | `#84CCEF` |
| `plum` | `#520037` | `magenta` | `#FFADEB` |
| `taupe` | `#7C705A` | `yellow` | `#FFFFA8` (WCAG AA 4.64:1) |
| `graphite` | `#191A1C` | `light` / white | `#F5F5F5` / `#FFFFFF` |

- Use the Tailwind token utilities (`bg-plum`, `text-magenta`, `border-cyan/40`). **Raw hex values are forbidden in components.**
- Black/white and opacity variants of the tokens are allowed.
- The earlier alternate values (`#FFFE7D` yellow, `#95886D` taupe) are retired.

## 2. Typography

**One typeface: Instrument Sans**, self-hosted via `next/font` in `layout.tsx`. No monospace, ever — measurements and specs are set in Instrument Sans like everything else.

**Marketing pages** (`/`) use the fluid clamp system defined in `globals.css`: `h1`–`h4` element styles plus `.text-lead`, `.text-body`, `.text-ui`.

**Briefd** (`/briefd` and its components) uses only the golden-ratio scale (Φ = 1.618), exposed as utilities:

| Utility | Size | Use |
|---|---|---|
| `text-hero` | 78px | Hero display |
| `text-section` | 48px | Section headers |
| `text-title` | 30px | Card titles, client & brand names |
| `text-value` | 18px | Measurements, field values, links, menus, buttons |
| `text-label` | 11px | Field labels, counters, metadata |

No other font sizes on Briefd. No `text-sm`/`text-xs`/arbitrary `text-[Npx]`.

## 3. Hard prohibitions

- **Never ALL CAPS / `uppercase`.** Sentence case or Title case everywhere.
- **No badges** — no pill badges, no pulsing dots above headings.
- **No shadows** — no `shadow-*`, no `drop-shadow-*`. Everything is flat and sharp.
- **No scaling hovers** — no `hover:scale-*`. The sanctioned hover effect is the `.btn-morph` border-radius morph (sharp box → 40px pill).

## 4. Crop marks (`CropFrame` atom)

The signature DTP detail. Hairline `0.5px`, length `12px`, corner gap `4px` (lines never meet), color `#000000`. On marketing pages, frame important sections. In app views (Briefd): only around the header and the footer — keep the workspace clean.

## 5. Layout

- **4px grid** — all spacing, margins, paddings, gaps and component sizes divisible by 4.
- **Edge-to-edge** full-width canvas, margins `px-5 sm:px-[30px]`.

## 6. Components before classes

Reuse order: existing atom → extend with a variant prop → compose atoms → new component at the smallest level. The `Button` atom is the only way to render a button/CTA; the `Modal` molecule is the only dialog shell.

## 7. Language

UI copy is English. Domain terms carried in data (Helsida, Rulltrappstavla, publisher names) stay Swedish.
