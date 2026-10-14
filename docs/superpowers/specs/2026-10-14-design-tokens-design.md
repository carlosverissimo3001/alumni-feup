# Design Tokens (CAR-169)

## Context

Alumni FEUP's frontend (`app/`) has had no visual refresh since it was first built in early 2025. It ships on an unmodified shadcn/ui boilerplate theme: `tailwind.config.js` only extends `borderRadius`, `colors` (all mapped to the stock shadcn grayscale CSS variables), and accordion keyframes. `globals.css` defines the stock shadcn light/dark HSL variable sets, but no theme provider or toggle (`next-themes`, `useTheme`, etc.) exists anywhere in the codebase — the `.dark` block is dead code.

There is no brand color token. The FEUP accent red is hardcoded as a literal hex string throughout the codebase, and has drifted into four distinct values:

| Value | Occurrences |
|---|---|
| `#8C2D19` | 282 (across 33 files) |
| `#A13A23` | 73 |
| `#A02D20` | 6 |
| `#A13A28` | 5 |

None of these match U.Porto's official specification for the Faculty of Engineering ("Engenharia"): Pantone 484 C / CMYK 8,94,99,34 / RGB 159,45,32 → **`#9F2D20`**. The existing codebase values were evidently eyeballed rather than taken from spec.

There is also no spacing scale beyond Tailwind's untouched default, and no elevation/surface system — cards are styled ad hoc per component (see `StatsCard.tsx`) with a hardcoded gradient wash, hardcoded shadow, and hardcoded tinted border, all keyed off `#8C2D19`.

This is the first of three sub-projects in the broader analytics-section frontend revamp (CAR-169 → CAR-170 → CAR-171), scoped deliberately narrow: establish the token layer everything else will build on, without touching layout or chart implementation.

## Scope

**In scope**: typography (typeface + scale), spacing (semantic tokens on top of Tailwind's default scale), color (brand red as a true token, light + dark variants), surface/elevation (card treatment, light + dark). The token layer itself is sitewide (it lives in `globals.css`/`tailwind.config.js`, consumed wherever brand color, spacing, or surfaces appear) — but see **Rollout order** below for which pages actually get migrated onto it as part of this ticket, versus later.

**Out of scope**: dashboard layout/structure (CAR-170), chart library migration (CAR-171), any change to the FEUP brand palette itself (non-negotiable per the UI Refresh milestone), mobile-specific layout fixes beyond what naturally falls out of the token system (CAR-396 was explicitly folded into the broader redesign rather than patched here).

### Rollout order

The token system is applied page-by-page rather than everywhere at once, starting with the lowest-risk surfaces:

1. **Navbar** — sitewide chrome, so it exercises the tokens on every page immediately. Its visual design has already gone through significant iteration over the past year, so this pass is **token-substitution only**: hardcoded hex/spacing values are swapped for the equivalent token, with no visual change to the rendered result. Any navbar restyle is explicitly out of scope here and would be its own, separately-approved change.
2. **Profile page** — only reachable by logged-in users, a small fraction of traffic, so mistakes here are cheap.
3. **About / feedback pages** — static, low-traffic, no data-fetching complexity to tangle with the visual change.

The analytics dashboards (the actual thesis-scoped surface, and the highest-traffic, highest-complexity area) are deliberately **not** part of this first pass. They're migrated afterward, once the token set has proven itself on these lower-stakes pages — any gaps in the type scale, spacing tokens, or surface treatment surface and get fixed here first, where a mistake is cheap, rather than on the dashboards.

## Decisions

### Typography

Replace Geist Sans / Geist Mono with:
- **Bricolage Grotesque** — UI text (headings, labels, body). Chosen after reviewing 2026 typography trends: it's named as the most-installed new sans-serif of the last two years, carrying more warmth and character than Inter/Geist while remaining clean enough for dense UI, which suits a visual refresh rather than a lateral move to another neutral grotesk.
- **JetBrains Mono** — tabular/numeric content (stat values, table counts). Needs `font-variant-numeric: tabular-nums` wherever counts appear in a list, so digits align.

Both load via `next/font/google`, following the existing pattern in `app/src/app/layout.tsx` (replacing the `Geist`/`Geist_Mono` imports and their CSS variables `--font-geist-sans` / `--font-geist-mono` with `--font-bricolage-sans` / `--font-jetbrains-mono`).

A type scale (heading/body/label/caption sizes and weights) is not yet fixed to exact values — it should be derived during implementation from the existing sizes already in use across the analytics components (`text-sm`, `text-xl`, etc. in `StatsCard.tsx` and others), consolidated into a small named scale rather than introducing new arbitrary sizes.

### Spacing

Keep Tailwind's default spacing scale (4px increments) as the base — it's already a sound, widely-used scale and nothing in the codebase overrides it today. Add a small set of **semantic** spacing tokens on top, each mapped to a specific step on that scale, for the handful of recurring layout spots:

- `--space-card-padding`
- `--space-section-gap`
- `--space-table-row-y`

These are implemented as Tailwind theme values (e.g. `theme.extend.spacing`) that reference the raw scale, not new raw pixel values — the goal is a single place to change "how dense is a card" without hunting through every component that uses one.

### Color

`#9F2D20` (U.Porto's official spec for Engenharia, Pantone 484 C) becomes the canonical `--primary` token, replacing all 366 hardcoded occurrences of `#8C2D19` / `#A13A23` / `#A02D20` / `#A13A28` across the 33 affected files. This is a deliberate, visible brand-accuracy correction, not a drift fix to the existing (incorrect) value.

`#9F2D20` fails contrast on near-black dark-mode backgrounds, so dark mode uses a lightened derivative of the same hue as `--primary-dark` (prototyped in the visual companion as `#e2583f`; exact value to be finalized against WCAG AA contrast during implementation, not hand-picked by eye).

Both ship as HSL CSS variables following the existing shadcn convention in `globals.css` (`--primary: <h> <s>% <l>%`), with `tailwind.config.js`'s existing `colors.primary.DEFAULT` mapping (currently pointing at the generic shadcn gray) repointed at the new variable. Components currently referencing the literal hex values (e.g. `text-[#8C2D19]`, `bg-[#8C2D19]/20`) are migrated to `text-primary`, `bg-primary/20`, etc.

### Surfaces / elevation

Replace the current hardcoded gradient-wash card treatment (`StatsCard.tsx`'s `bg-gradient-to-br from-white via-[#FCEFEA] to-[#8C2D19]/15`) with:

- Solid surface background (no gradient).
- A soft drop shadow for depth (`box-shadow`, tokenized as `--shadow-card`).
- The brand accent expressed as a left accent bar (`border-left: 3px solid var(--primary)`) rather than a full tinted border.

This was chosen over two alternatives considered and shown side-by-side: a flatter, border-only treatment (calmer but loses the brand presence entirely) and a refined version of the current gradient wash (keeps the branded warmth but gets visually busy once repeated across many cards on one screen, e.g. the stats row). The accent-bar treatment keeps a clear brand presence on every card without the gradient repetition problem.

Dark mode uses the same shadow token at a stronger opacity (since shadows read differently on dark backgrounds) and `--primary-dark` for the accent bar and icon tinting, following the color decision above.

### Dark mode

In scope, despite the current `.dark` CSS block being unused dead code. Implementation must wire an actual theme provider/toggle (e.g. `next-themes`, matching the pattern shadcn projects typically use) — defining dark CSS variables without anything to toggle them would leave this undiscoverable and effectively still out of scope in practice.

## Token implementation shape

All tokens are expressed as CSS variables in `app/src/app/globals.css` (extending the existing `@layer base` block, both `:root` and `.dark`), then surfaced through `tailwind.config.js`'s `theme.extend` so components consume them via Tailwind utility classes (`bg-primary`, `text-primary`, `p-[var(--space-card-padding)]`, etc.) rather than reaching for raw CSS variables directly. This mirrors the existing shadcn pattern already used for `background`/`foreground`/`card`/etc., just extended to cover brand color, spacing, and shadow.

## Migration approach

This is a token-layer change, not a component rewrite: existing components keep their current structure and markup, swapping hardcoded hex/gradient/shadow values for the new token-backed utility classes. Of the 33 files with hardcoded brand-red references, this first pass only touches the subset belonging to the navbar, profile page, and about/feedback pages (per the rollout order above) — the remaining files, including the analytics dashboards and `StatsCard.tsx`'s elevation rewrite, are migrated in a later pass once the token set is proven.

## Testing / verification

- Visual check in both light and dark mode across the navbar, profile page, and about/feedback pages at desktop and mobile widths.
- Navbar specifically: before/after visual diff confirming zero rendered change — this pass is token substitution only, not a restyle.
- Grep confirms zero remaining hardcoded brand-color occurrences within the files touched in this pass.
- `tsc --noEmit` clean.
- Contrast check (WCAG AA) on `--primary-dark` against the dark-mode card background before finalizing its value.

## Out of scope / deferred

- Dashboard layout and six-panel/paginated-table restructure — CAR-170.
- D3 → shadcn/Recharts chart migration, including real touch support — CAR-171.
- Migrating the analytics dashboards (including `StatsCard.tsx`'s elevation rewrite) onto the token system — deferred to a follow-up pass after navbar/profile/about/feedback prove it out (see Rollout order).
- Any further typography scale/weight decisions beyond what's specified above are left to implementation, grounded in the sizes already in use today rather than invented fresh.
