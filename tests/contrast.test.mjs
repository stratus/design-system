import { test, describe } from "node:test";
import { strictEqual, ok } from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(
  readFileSync(join(__dirname, "..", "platforms/json/tokens.json"), "utf-8")
);

// WCAG relative-luminance contrast: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
function srgb(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function luminance(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}
function contrast(fg, bg) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

// WCAG thresholds by tier:
//   AA body text:   4.5:1  (1.4.3 Contrast Minimum)
//   AA large text:  3:1    (≥18pt or ≥14pt bold; also UI components per 1.4.11)
//
// KC themes are the accessibility default and must clear the body-text bar (4.5:1) on every pair.
// Standard themes exist to restore the prior aesthetic exactly — their saturated button
// fills predate this refresh and only meet the large-text/UI bar (3:1). This is documented
// as a known limitation of standard mode; KC mode is the accessible recommendation.
const PAIRS = [
  // [foreground key, background key, label, kc-threshold, standard-threshold]
  ["md-sys-color-on-background", "md-sys-color-background", "body text on background", 4.5, 4.5],
  ["md-sys-color-on-surface", "md-sys-color-surface", "text on surface", 4.5, 4.5],
  ["md-sys-color-on-primary", "md-sys-color-primary", "primary button text", 4.5, 3.0],
  ["md-sys-color-on-error", "md-sys-color-error", "error button text", 4.5, 3.0],
  ["md-sys-color-on-success", "md-sys-color-success", "success button text", 4.5, 3.0],
  ["md-sys-color-on-surface-variant", "md-sys-color-background", "muted text on background", 4.5, 4.5],
];

for (const themeName of Object.keys(tokens.themes)) {
  const isKc = themeName.endsWith("-kc");
  const tier = isKc ? "KC (AA body)" : "standard (AA large/UI)";
  describe(`contrast — ${themeName} [${tier}]`, () => {
    const theme = tokens.themes[themeName];
    for (const [fgKey, bgKey, label, kcMin, stdMin] of PAIRS) {
      const min = isKc ? kcMin : stdMin;
      test(`${label} (≥ ${min}:1)`, () => {
        const fg = theme[fgKey];
        const bg = theme[bgKey];
        ok(fg, `missing ${fgKey} in ${themeName}`);
        ok(bg, `missing ${bgKey} in ${themeName}`);
        const ratio = contrast(fg, bg);
        ok(
          ratio >= min,
          `${label}: ${fg} on ${bg} = ${ratio.toFixed(2)}:1, expected ≥ ${min}:1`
        );
      });
    }
  });
}

describe("luminance helper", () => {
  test("white on black is exactly 21:1", () => {
    strictEqual(Math.round(contrast("#ffffff", "#000000")), 21);
  });
  test("equal colors are 1:1", () => {
    strictEqual(contrast("#888888", "#888888"), 1);
  });
});
