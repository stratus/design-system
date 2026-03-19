# Design System

Cross-project design system inspired by Material Design 3's architecture with a Linear/Glean aesthetic (dark, muted, technical).

## Quick Start

```bash
npm install
npm run build          # Generate platform outputs from tokens
```

## Structure

- `tokens/` — Source of truth (JSON). Edit these to change the design system.
- `platforms/` — Generated output (CSS, Tailwind preset, JSON). Don't edit directly.
- `react/` — React component library (`@gf/react`).
- `scripts/` — Build and verification tooling.

## Usage

### React + Tailwind v4 projects

In your project's CSS entry point:

```css
@import "tailwindcss";
@import "design-system/tailwind";
```

Then use components:

```tsx
import { Button, Card } from "@gf/react";
```

### Vanilla HTML / CSS-only projects

```html
<link rel="stylesheet" href="path/to/design-system/platforms/css/tokens.css">
```

All tokens are available as CSS custom properties: `var(--primary)`, `var(--background)`, etc.

### Tailwind v4 theme mapping

The preset maps design tokens to Tailwind's namespace, so you can use classes like:
- `bg-background`, `text-foreground`, `border-border`
- `bg-primary`, `text-primary-foreground`
- `bg-surface-container`, `bg-surface-container-high`
- `rounded-sm` (6px), `rounded-md` (8px), `rounded-lg` (12px)
- `shadow-sm` through `shadow-2xl` (elevation levels)

### Light mode

Dark mode is the default. Opt in to light mode:

```html
<html class="light">
<!-- or -->
<html data-theme="light">
```

## Project Registry

Copy `project-registry.example.json` to `project-registry.json` and update paths for your machine. This file is gitignored (contains machine-specific paths).

## Tokens

| Token File | What It Controls |
|-----------|-----------------|
| `color.json` | Tonal palettes, semantic color roles (dark + light) |
| `typography.json` | Type scale (5 roles × 3 sizes), font families |
| `elevation.json` | Shadow levels (0-5) |
| `shape.json` | Border-radius scale |
| `spacing.json` | 4px grid spacing scale |
| `motion.json` | Duration + easing curves |

## Development

Edit tokens in `tokens/*.json`, then run `npm run build` to regenerate platform outputs. The CSS includes backward-compatible aliases (`--primary`, `--background`, `--border`, etc.) so existing projects can adopt incrementally.
