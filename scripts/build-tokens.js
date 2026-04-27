#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function readTokens(file) {
  return JSON.parse(readFileSync(join(root, "tokens", file), "utf-8"));
}

const color = readTokens("color.json");
const typography = readTokens("typography.json");
const elevation = readTokens("elevation.json");
const shape = readTokens("shape.json");
const spacing = readTokens("spacing.json");
const motion = readTokens("motion.json");

function flatten(obj, prefix = "") {
  const result = [];
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}-${key}` : key;
    if (val && typeof val === "object" && "value" in val) {
      result.push([path, val.value]);
    } else if (val && typeof val === "object") {
      result.push(...flatten(val, path));
    }
  }
  return result;
}

const lightKc       = flatten(color.md.sys.color["light-kc"]).map(([k, v]) => [`md-sys-color-${k}`, v]);
const lightStandard = flatten(color.md.sys.color["light-standard"]).map(([k, v]) => [`md-sys-color-${k}`, v]);
const darkKc        = flatten(color.md.sys.color["dark-kc"]).map(([k, v]) => [`md-sys-color-${k}`, v]);
const darkStandard  = flatten(color.md.sys.color["dark-standard"]).map(([k, v]) => [`md-sys-color-${k}`, v]);
const refPalette    = flatten(color.md.ref.palette).map(([k, v]) => [`md-ref-palette-${k}`, v]);

const typeTokens   = flatten(typography.md.sys.typescale).map(([k, v]) => [`md-sys-typescale-${k}`, v]);
const typeRef      = flatten(typography.md.ref.typeface).map(([k, v]) => [`md-ref-typeface-${k}`, v]);
const legHigh      = flatten(typography.md.sys.legibility.high).map(([k, v]) => [`md-sys-legibility-${k}`, v]);
const legStandard  = flatten(typography.md.sys.legibility.standard).map(([k, v]) => [`md-sys-legibility-${k}`, v]);

const elevLight    = flatten(elevation.md.sys.elevation.light).map(([k, v]) => [`md-sys-elevation-${k}`, v]);
const elevDark     = flatten(elevation.md.sys.elevation.dark).map(([k, v]) => [`md-sys-elevation-${k}`, v]);

const shapeTokens   = flatten(shape.md.sys.shape).map(([k, v]) => [`md-sys-shape-${k}`, v]);
const spacingTokens = flatten(spacing.md.sys.spacing).map(([k, v]) => [`md-sys-spacing-${k}`, v]);
const motionTokens  = [
  ...flatten(motion.md.sys.motion.duration).map(([k, v]) => [`md-sys-motion-duration-${k}`, v]),
  ...flatten(motion.md.sys.motion.easing).map(([k, v]) => [`md-sys-motion-easing-${k}`, v]),
];
const motionLegibility = flatten(motion.md.sys.motion.legibility).map(([k, v]) => [`md-sys-motion-legibility-${k}`, v]);

const aliases = [
  ["primary", "var(--md-sys-color-primary)"],
  ["primary-foreground", "var(--md-sys-color-on-primary)"],
  ["primary-hover", "color-mix(in srgb, var(--md-sys-color-primary) 90%, black)"],
  ["background", "var(--md-sys-color-background)"],
  ["bg", "var(--md-sys-color-background)"],
  ["foreground", "var(--md-sys-color-on-background)"],
  ["text", "var(--md-sys-color-on-background)"],
  ["surface", "var(--md-sys-color-surface)"],
  ["surface-container", "var(--md-sys-color-surface-container)"],
  ["surface-container-high", "var(--md-sys-color-surface-container-high)"],
  ["bg-card", "var(--md-sys-color-surface-container)"],
  ["card", "var(--md-sys-color-surface-container)"],
  ["card-foreground", "var(--md-sys-color-on-background)"],
  ["border", "var(--md-sys-color-outline)"],
  ["ring", "var(--md-sys-color-primary)"],
  ["accent", "var(--md-sys-color-primary)"],
  ["accent-foreground", "var(--md-sys-color-on-primary)"],
  ["muted", "var(--md-sys-color-surface-container)"],
  ["muted-foreground", "var(--md-sys-color-on-surface-variant)"],
  ["error", "var(--md-sys-color-error)"],
  ["red", "var(--md-sys-color-error)"],
  ["destructive", "var(--md-sys-color-error)"],
  ["success", "var(--md-sys-color-success)"],
  ["green", "var(--md-sys-color-success)"],
  ["warning", "#b45309"],
  ["foreground-muted", "var(--md-sys-color-on-surface-variant)"],
];

function toCSS(pairs, indent = "  ") {
  return pairs.map(([k, v]) => `${indent}--${k}: ${v};`).join("\n");
}

const css = `/* Design System Tokens — Auto-generated, do not edit */
/* Defaults: light mode + high-legibility (designed for keratoconus and other low-vision needs) */
/* Opt-out classes (compose freely):
   .dark or [data-theme="dark"]              → dark color theme
   .standard-legibility or [data-a11y="standard"]  → drop high-legibility lifts
*/

/* ── Default: light + high-legibility ── */
:root {
${toCSS(lightKc)}

  /* Backward-compatible aliases (resolve via --md-sys-* — pick up theme automatically) */
${toCSS(aliases)}

  /* Reference palette */
${toCSS(refPalette)}

  /* Typography ref + scale */
${toCSS(typeRef)}
${toCSS(typeTokens)}

  /* Legibility tokens (high-legibility values active) */
${toCSS(legHigh)}

  /* Elevation (light shadows for warm bg) */
${toCSS(elevLight)}

  /* Shape */
${toCSS(shapeTokens)}

  /* Spacing */
${toCSS(spacingTokens)}

  /* Motion */
${toCSS(motionTokens)}
${toCSS(motionLegibility)}
}

/* ── Dark color theme (high-legibility stays on) ── */
:root.dark, [data-theme="dark"] {
${toCSS(darkKc)}

  --primary-hover: color-mix(in srgb, var(--md-sys-color-primary) 90%, white);

  /* Elevation (heavier shadows for dark bg) */
${toCSS(elevDark)}
}

/* ── Standard legibility (no KC lifts) — light variant ── */
:root.standard-legibility, [data-a11y="standard"] {
${toCSS(lightStandard)}

  /* Revert legibility tokens to standard */
${toCSS(legStandard)}
}

/* ── Standard legibility + dark color (restores pre-refresh look) ── */
:root.dark.standard-legibility,
[data-theme="dark"][data-a11y="standard"] {
${toCSS(darkStandard)}

  --primary-hover: color-mix(in srgb, var(--md-sys-color-primary) 90%, white);

${toCSS(elevDark)}
}

/* ── Reduced motion (defense in depth, independent of legibility class) ── */
@media (prefers-reduced-motion: reduce) {
  :root {
    --md-sys-motion-duration-short1: 0ms;
    --md-sys-motion-duration-short2: 0ms;
    --md-sys-motion-duration-short3: 0ms;
    --md-sys-motion-duration-short4: 0ms;
    --md-sys-motion-duration-medium1: 0ms;
    --md-sys-motion-duration-medium2: 0ms;
    --md-sys-motion-duration-medium3: 0ms;
    --md-sys-motion-duration-medium4: 0ms;
    --md-sys-motion-duration-long1: 0ms;
    --md-sys-motion-duration-long2: 0ms;
    --md-sys-motion-duration-long3: 0ms;
    --md-sys-motion-duration-long4: 0ms;
    --md-sys-motion-legibility-duration-cap: 0ms;
  }
}
`;

const tailwind = `/* Design System — Tailwind v4 Preset */
/* Auto-generated, do not edit */

@import "../css/tokens.css";

@theme inline {
  /* Colors */
  --color-background: var(--md-sys-color-background);
  --color-foreground: var(--md-sys-color-on-background);
  --color-surface: var(--md-sys-color-surface);
  --color-surface-container: var(--md-sys-color-surface-container);
  --color-surface-container-high: var(--md-sys-color-surface-container-high);
  --color-primary: var(--md-sys-color-primary);
  --color-primary-foreground: var(--md-sys-color-on-primary);
  --color-primary-container: var(--md-sys-color-primary-container);
  --color-muted: var(--md-sys-color-surface-container);
  --color-muted-foreground: var(--md-sys-color-on-surface-variant);
  --color-border: var(--md-sys-color-outline);
  --color-ring: var(--md-sys-color-primary);
  --color-error: var(--md-sys-color-error);
  --color-error-foreground: var(--md-sys-color-on-error);
  --color-success: var(--md-sys-color-success);
  --color-success-foreground: var(--md-sys-color-on-success);
  --color-warning: #b45309;
  --color-card: var(--md-sys-color-surface-container);
  --color-card-foreground: var(--md-sys-color-on-background);

  /* Border Radius */
  --radius-xs: var(--md-sys-shape-corner-extra-small);
  --radius-sm: var(--md-sys-shape-corner-small);
  --radius-md: var(--md-sys-shape-corner-medium);
  --radius-lg: var(--md-sys-shape-corner-large);
  --radius-xl: var(--md-sys-shape-corner-extra-large);
  --radius-full: var(--md-sys-shape-corner-full);

  /* Shadows (Elevation) */
  --shadow-none: var(--md-sys-elevation-level0);
  --shadow-sm: var(--md-sys-elevation-level1);
  --shadow-md: var(--md-sys-elevation-level2);
  --shadow-lg: var(--md-sys-elevation-level3);
  --shadow-xl: var(--md-sys-elevation-level4);
  --shadow-2xl: var(--md-sys-elevation-level5);

  /* Typography */
  --font-sans: var(--md-ref-typeface-brand);
  --font-mono: var(--md-ref-typeface-code);

  /* Motion */
  --transition-duration-fast: var(--md-sys-motion-duration-short2);
  --transition-duration-normal: var(--md-sys-motion-duration-medium2);
  --transition-duration-slow: var(--md-sys-motion-duration-long2);
  --ease-standard: var(--md-sys-motion-easing-standard);
  --ease-decelerate: var(--md-sys-motion-easing-standard-decelerate);
  --ease-accelerate: var(--md-sys-motion-easing-standard-accelerate);
}
`;

const allTokens = {
  themes: {
    "light-kc":       Object.fromEntries(lightKc),
    "light-standard": Object.fromEntries(lightStandard),
    "dark-kc":        Object.fromEntries(darkKc),
    "dark-standard":  Object.fromEntries(darkStandard),
  },
  legibility: {
    high:     Object.fromEntries(legHigh),
    standard: Object.fromEntries(legStandard),
  },
  elevation: {
    light: Object.fromEntries(elevLight),
    dark:  Object.fromEntries(elevDark),
  },
  ref: {
    palette:  Object.fromEntries(refPalette),
    typeface: Object.fromEntries(typeRef),
  },
  typescale: Object.fromEntries(typeTokens),
  shape:     Object.fromEntries(shapeTokens),
  spacing:   Object.fromEntries(spacingTokens),
  motion:    Object.fromEntries([...motionTokens, ...motionLegibility]),
};

mkdirSync(join(root, "platforms/css"), { recursive: true });
mkdirSync(join(root, "platforms/tailwind"), { recursive: true });
mkdirSync(join(root, "platforms/json"), { recursive: true });

writeFileSync(join(root, "platforms/css/tokens.css"), css);
writeFileSync(join(root, "platforms/tailwind/preset.css"), tailwind);
writeFileSync(join(root, "platforms/json/tokens.json"), JSON.stringify(allTokens, null, 2));

console.log("✓ platforms/css/tokens.css");
console.log("✓ platforms/tailwind/preset.css");
console.log("✓ platforms/json/tokens.json");
