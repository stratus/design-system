# Design System — Project Guidelines

Cross-project design system: MD3 architecture + high-legibility default tuned for keratoconus and other low-vision needs.

---

## Quick Reference

```bash
npm run build          # Generate platform outputs from tokens
npm test               # Token determinism + WCAG contrast tests
npm run test:browser   # Axe a11y across all 4 theme combos (needs Chromium)
npm run screenshots    # Regenerate docs/images/*.png
npm run verify         # Run tests/builds across consumer projects
```

## Architecture

```
tokens/*.json          → Source of truth (edit here)
scripts/build-tokens.js → Transform tokens into platform outputs
platforms/css/         → CSS custom properties (4 selectors: :root, .dark, .standard-legibility, .dark.standard-legibility)
platforms/tailwind/    → Tailwind v4 @theme preset (imports tokens.css)
platforms/json/        → Themes + legibility + ref data (programmatic / future mobile use)
react/src/             → React component library (@gf/react)
tests/                 → Vitest-style tests via node --test (zero deps)
```

### Data Flow

```
tokens/*.json → build-tokens.js → platforms/{css,tailwind,json}/
                                     ↓
                            Consumer projects import:
                            - React+TW: "design-system/tailwind" + @gf/react
                            - Vanilla:  "design-system/css" (tokens.css)
```

## Theme System (two orthogonal axes)

| `<html>` class                  | Color | Legibility | Notes                                    |
| ------------------------------- | ----- | ---------- | ---------------------------------------- |
| _(none — default)_              | light | high       | The new default — KC + everyone benefits |
| `.dark`                         | dark  | high       | Dark, KC lifts still on                  |
| `.standard-legibility`          | light | standard   | Drops KC lifts                           |
| `.dark.standard-legibility`     | dark  | standard   | Pre-0.2.0 aesthetic, exactly             |

`data-theme="dark"` and `data-a11y="standard"` are the equivalent attributes.

## Token Naming Convention

- MD3 system: `--md-sys-{category}-{role}` (e.g., `--md-sys-color-primary`)
- MD3 reference: `--md-ref-{category}-{item}` (e.g., `--md-ref-palette-primary-50`)
- Legibility tokens: `--md-sys-legibility-{role}` (e.g., `--md-sys-legibility-body-size`, `--md-sys-legibility-min-touch-target`)
- Aliases: `--primary`, `--background`, `--border`, etc. (backward-compatible — resolve to current theme)

## Key Design Decisions

- **Light + high-legibility default** — `:root` carries the new defaults. Opt out with `.dark` and/or `.standard-legibility`.
- **Two orthogonal CSS axes** — color and legibility are independent classes; users compose them. One source of truth in `tokens/color.json` (4 palettes) and `tokens/typography.json` (`legibility.high` and `legibility.standard`).
- **Atkinson Hyperlegible first** — the brand typeface stack starts with the Braille-Institute font designed for low vision; falls back to Inter then system. Loaded via Google Fonts in showcase pages.
- **Light vs dark elevation** — shadows have separate light/dark variants in `tokens/elevation.json`. The build script picks the right set per theme block. Light uses `rgba(26,31,43, 0.06–0.14)`; dark uses heavier `rgba(0,0,0,0.4)`.
- **Touch targets** — 44px minimum on Button, Input, Select (high-legibility); 40px in standard. Driven by `--md-sys-legibility-min-touch-target`.
- **Motion cap + prefers-reduced-motion** — KC mode caps transitions at 100ms linear. The build emits `@media (prefers-reduced-motion: reduce) { ... }` to zero out durations regardless of legibility class.
- **No Style Dictionary** — Custom build script (`scripts/build-tokens.js`) is simpler and more maintainable for our token structure.
- **React components are a separate package** — `@gf/react` has peer dependencies on React, CVA, clsx, tailwind-merge. Vanilla projects don't pull React.
- **Backward-compatible aliases** — Old var names map to MD3 names so existing projects pick up the new theme automatically without code changes.
- **`project-registry.json` is gitignored** — contains machine-specific absolute paths. Use `project-registry.example.json` as a template.

## Workflow

### Changing tokens

1. Edit `tokens/*.json`
2. Run `npm run build`
3. Run `npm test` — must stay green (catches contrast regressions and build determinism breaks)
4. If a visual change: regenerate `npm run screenshots` and review
5. Run `npm run verify` to test consumer projects (if migrated)

### Adding React components

1. Add component to `react/src/`
2. Export from `react/src/index.ts`
3. Use design-system Tailwind classes (e.g., `bg-surface-container`, `text-foreground`)
4. Add `"use client"` directive for Next.js compatibility
5. Use `forwardRef` + `displayName` pattern
6. Default size should clear 44px in any interactive direction (matches high-legibility touch target)

## Testing

- **Token build determinism** — `tests/tokens.build.test.mjs` rebuilds and asserts byte-identical output
- **WCAG contrast per theme** — `tests/contrast.test.mjs` checks 6 fg/bg pairs across all 4 themes. KC themes must clear 4.5:1 (AA body); standard themes need 3:1 (AA large/UI minimum) for buttons since they preserve pre-0.2.0 saturated colors
- **Axe a11y** — `tests/showcase.browser.mjs` injects axe-core via CDN, runs against showcase at 1280px and 375px viewports, all 4 theme combos
- **Cross-project verification** — `npm run verify` iterates migrated projects from `project-registry.json`
