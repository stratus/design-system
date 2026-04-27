// Browser test: load docs/showcase.html across all 4 themes × 2 viewports.
// Runs axe-core (injected via CDN) and asserts no serious/critical a11y violations.
// Also captures screenshots into docs/images/.
//
// Usage: node tests/showcase.browser.mjs        # run tests
//        node tests/showcase.browser.mjs --shoot # also capture screenshots

import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { mkdirSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const showcase = "file://" + join(root, "docs/showcase.html");
const palette = "file://" + join(root, "docs/palette.html");
const imagesDir = join(root, "docs/images");
const SHOOT = process.argv.includes("--shoot");
const AXE_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js";

if (SHOOT && !existsSync(imagesDir)) mkdirSync(imagesDir, { recursive: true });

const themes = [
  { id: "light-kc",       theme: "light", legibility: "high",     label: "light + high-legibility (default)" },
  { id: "dark-kc",        theme: "dark",  legibility: "high",     label: "dark + high-legibility" },
  { id: "light-standard", theme: "light", legibility: "standard", label: "light + standard" },
  { id: "dark-standard",  theme: "dark",  legibility: "standard", label: "dark + standard" },
];

const viewports = [
  { id: "desktop", width: 1280, height: 900 },
  { id: "mobile",  width: 375,  height: 812 },
];

async function applyTheme(page, theme, legibility) {
  await page.evaluate(
    ([t, l]) => {
      const root = document.documentElement;
      root.classList.toggle("dark", t === "dark");
      root.classList.toggle("standard-legibility", l === "standard");
    },
    [theme, legibility]
  );
}

async function runAxe(page) {
  await page.addScriptTag({ url: AXE_CDN });
  return await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run({
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    });
    return r.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length }));
  });
}

let failed = 0;
let passed = 0;
const failures = [];

const browser = await chromium.launch();
try {
  for (const v of viewports) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
    const page = await ctx.newPage();

    for (const t of themes) {
      // ── showcase a11y ──
      await page.goto(showcase, { waitUntil: "load" });
      await applyTheme(page, t.theme, t.legibility);
      await page.waitForTimeout(150);
      const violations = await runAxe(page);

      const tag = `${v.id} · ${t.label}`;
      if (violations.length === 0) {
        passed++;
        console.log(`  ✓ ${tag}`);
      } else {
        failed++;
        failures.push({ tag, violations });
        console.log(`  ✗ ${tag}`);
        for (const vio of violations) {
          console.log(`      [${vio.impact}] ${vio.id} (${vio.nodes} nodes) — ${vio.help}`);
        }
      }

      if (SHOOT) {
        const file = join(imagesDir, `component-showcase-${t.id}-${v.id}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`    → ${file}`);
      }
    }

    if (SHOOT) {
      // Palette screenshot (only desktop, default theme)
      if (v.id === "desktop") {
        await page.goto(palette, { waitUntil: "load" });
        await page.waitForTimeout(150);
        await page.screenshot({
          path: join(imagesDir, "color-palette.png"),
          fullPage: true,
        });
        console.log(`    → ${join(imagesDir, "color-palette.png")}`);
      }
    }

    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("\nA11y violations:");
  for (const f of failures) {
    console.error(`  ${f.tag}:`);
    for (const v of f.violations) {
      console.error(`    [${v.impact}] ${v.id}: ${v.help}`);
    }
  }
  process.exit(1);
}
