# Rule: Tone-on-Tone Color System

Only the 8 brand tokens, used as Tailwind utilities (defined in `src/app/globals.css` `@theme`):

1. **Petroleum & Cyan**: `petrol` `#173537` + `cyan` `#84CCEF`
2. **Plum & Magenta**: `plum` `#520037` + `magenta` `#FFADEB`
3. **Taupe & Yellow**: `taupe` `#7C705A` + `yellow` `#FFFFA8`
4. **Graphite & Light/White**: `graphite` `#191A1C` + `light` `#F5F5F5` / `#FFFFFF`

Use `bg-plum`, `text-magenta`, `border-cyan/40`, etc. **Raw hex values in components are forbidden.** Black, white and opacity variants of the tokens are allowed. The old alternate values `#95886D` and `#FFFE7D` are retired (superseded by `taupe`/`yellow` above). Do not introduce arbitrary colors or mix unrelated pairs. Full spec: docs/design-system.md.
