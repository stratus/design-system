# Design System — Project Guidelines

Cross-project design system: MD3 architecture + Linear/Glean aesthetic (dark, muted, technical).

---

## Quick Reference

```bash
npm run build          # Generate platform outputs from tokens
npm run verify         # Run tests/builds across consumer projects
```

## Architecture

```
tokens/*.json          → Source of truth (edit here)
scripts/build-tokens.js → Transform tokens into platform outputs
platforms/css/         → CSS custom properties (:root dark default, .light override)
platforms/tailwind/    → Tailwind v4 @theme preset (imports tokens.css)
platforms/json/        → Flat resolved JSON (for programmatic / future mobile use)
react/src/             → React component library (@gf/react)
```

### Data Flow
```
tokens/*.json → build-tokens.js → platforms/{css,tailwind,json}/
                                     ↓
                            Consumer projects import:
                            - React+TW: "design-system/tailwind" + @gf/react
                            - Vanilla:  "design-system/css" (tokens.css)
```

## Token Naming Convention

MD3 system: `--md-sys-{category}-{role}` (e.g., `--md-sys-color-primary`)
MD3 reference: `--md-ref-{category}-{item}` (e.g., `--md-ref-palette-primary-50`)
Aliases: `--primary`, `--background`, `--border`, etc. (backward-compatible)

## Key Design Decisions

- **Dark mode default** — `:root` contains dark values. Light via `.light` class or `data-theme="light"`.
- **No Style Dictionary** — Custom build script (`scripts/build-tokens.js`) is simpler and more maintainable for our token structure.
- **React components are a separate package** — `@gf/react` has peer dependencies on React, CVA, clsx, tailwind-merge. Vanilla projects don't pull React.
- **Backward-compatible aliases** — Old var names (`--primary`, `--bg`, `--border`) map to MD3 names so existing projects migrate incrementally.
- **project-registry.json is gitignored** — Contains machine-specific absolute paths. Use `project-registry.example.json` as template.

## Workflow

### Changing tokens
1. Edit `tokens/*.json`
2. Run `npm run build`
3. Verify generated CSS looks correct
4. Run `npm run verify` to test consumer projects (if migrated)

### Adding React components
1. Add component to `react/src/`
2. Export from `react/src/index.ts`
3. Use design-system Tailwind classes (e.g., `bg-surface-container`, `text-foreground`)
4. Add `"use client"` directive for Next.js compatibility
5. Use forwardRef + displayName pattern

## Testing

- Token build: `npm run build` must succeed
- Consumer projects: `npm run verify` iterates migrated projects
- React components: smoke-test each renders without error
