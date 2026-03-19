#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Read token files
function readTokens(file) {
  return JSON.parse(readFileSync(join(root, "tokens", file), "utf-8"));
}

const color = readTokens("color.json");
const typography = readTokens("typography.json");
const elevation = readTokens("elevation.json");
const shape = readTokens("shape.json");
const spacing = readTokens("spacing.json");
const motion = readTokens("motion.json");

// Flatten nested token objects into [path, value] pairs
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

// Extract color tokens
const darkColors = flatten(color.md.sys.color.dark).map(([k, v]) => [`md-sys-color-${k}`, v]);
const lightColors = flatten(color.md.sys.color.light).map(([k, v]) => [`md-sys-color-${k}`, v]);
const refPalette = flatten(color.md.ref.palette).map(([k, v]) => [`md-ref-palette-${k}`, v]);

// Extract other tokens
const typeTokens = flatten(typography.md.sys.typescale).map(([k, v]) => [`md-sys-typescale-${k}`, v]);
const typeRef = flatten(typography.md.ref.typeface).map(([k, v]) => [`md-ref-typeface-${k}`, v]);
const elevTokens = flatten(elevation.md.sys.elevation).map(([k, v]) => [`md-sys-elevation-${k}`, v]);
const shapeTokens = flatten(shape.md.sys.shape).map(([k, v]) => [`md-sys-shape-${k}`, v]);
const spacingTokens = flatten(spacing.md.sys.spacing).map(([k, v]) => [`md-sys-spacing-${k}`, v]);
const motionTokens = flatten(motion.md.sys.motion).map(([k, v]) => [`md-sys-motion-${k}`, v]);

// Backward-compatible aliases
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
  ["warning", "#f59e0b"],
  ["foreground-muted", "var(--md-sys-color-on-surface-variant)"],
];

function toCSS(pairs) {
  return pairs.map(([k, v]) => `  --${k}: ${v};`).join("\n");
}

// ── Build CSS ──
const css = `/* Design System Tokens — Auto-generated, do not edit */

/* Dark mode (default) */
:root {
${toCSS(darkColors)}

  /* Backward-compatible aliases */
${toCSS(aliases)}

  /* Reference palette */
${toCSS(refPalette)}

  /* Typography */
${toCSS(typeRef)}
${toCSS(typeTokens)}

  /* Elevation */
${toCSS(elevTokens)}

  /* Shape */
${toCSS(shapeTokens)}

  /* Spacing */
${toCSS(spacingTokens)}

  /* Motion */
${toCSS(motionTokens)}
}

/* Light mode (opt-in) */
:root.light, [data-theme="light"] {
${toCSS(lightColors)}

  --primary-hover: color-mix(in srgb, var(--md-sys-color-primary) 90%, white);
}
`;

// ── Build Tailwind v4 preset ──
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
  --color-warning: #f59e0b;
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

// ── Build flat JSON ──
const allTokens = {};
[...darkColors, ...refPalette, ...typeRef, ...typeTokens, ...elevTokens, ...shapeTokens, ...spacingTokens, ...motionTokens].forEach(([k, v]) => {
  allTokens[k] = v;
});
// Also add light as a nested object
const lightObj = {};
lightColors.forEach(([k, v]) => { lightObj[k] = v; });
allTokens["_light"] = lightObj;

// Ensure output directories exist
mkdirSync(join(root, "platforms/css"), { recursive: true });
mkdirSync(join(root, "platforms/tailwind"), { recursive: true });
mkdirSync(join(root, "platforms/json"), { recursive: true });

writeFileSync(join(root, "platforms/css/tokens.css"), css);
writeFileSync(join(root, "platforms/tailwind/preset.css"), tailwind);
writeFileSync(join(root, "platforms/json/tokens.json"), JSON.stringify(allTokens, null, 2));

console.log("✓ platforms/css/tokens.css");
console.log("✓ platforms/tailwind/preset.css");
console.log("✓ platforms/json/tokens.json");
