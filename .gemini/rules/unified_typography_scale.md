# Rule: Typography scale

Two systems, no exceptions (full spec: docs/design-system.md):

1. **Marketing pages (`/`)**: the fluid clamp() system from `globals.css` — `h1`–`h4` element styles plus `.text-lead`, `.text-body`, `.text-ui`. No arbitrary `text-[...]` sizes.
2. **Briefd (`/briefd` + `src/components/briefd/`)**: ONLY the golden-ratio utilities `text-hero` (78px), `text-section` (48px), `text-title` (30px), `text-value` (18px), `text-label` (11px). Never `text-sm`, `text-xs`, or pixel literals.

Never introduce micro-differentiated pixel sizes outside these systems.
