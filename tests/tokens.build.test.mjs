import { test, describe } from "node:test";
import { strictEqual, ok, deepStrictEqual } from "node:assert/strict";
import { readFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

describe("token build", () => {
  test("emits all four theme selectors", () => {
    const css = readFileSync(join(root, "platforms/css/tokens.css"), "utf-8");
    ok(css.includes(":root {"), "default :root selector");
    ok(css.includes(":root.dark"), ".dark selector");
    ok(css.includes(":root.standard-legibility"), ".standard-legibility selector");
    ok(
      css.includes(":root.dark.standard-legibility"),
      "compound .dark.standard-legibility selector"
    );
  });

  test("emits prefers-reduced-motion media query", () => {
    const css = readFileSync(join(root, "platforms/css/tokens.css"), "utf-8");
    ok(css.includes("@media (prefers-reduced-motion: reduce)"));
    ok(css.includes("--md-sys-motion-duration-medium2: 0ms"));
  });

  test("default :root contains warm KC light bg #f5f1e8", () => {
    const css = readFileSync(join(root, "platforms/css/tokens.css"), "utf-8");
    const rootBlock = css.split(":root {")[1].split("}")[0];
    ok(rootBlock.includes("#f5f1e8"), "warm cream bg in default block");
  });

  test("light-standard restores the cool #f8fafc bg", () => {
    const css = readFileSync(join(root, "platforms/css/tokens.css"), "utf-8");
    const idx = css.indexOf(":root.standard-legibility");
    const block = css.slice(idx, css.indexOf("}", idx));
    ok(block.includes("#f8fafc"), "cool bg in standard-legibility block");
  });

  test("backward-compat alias --primary points at md-sys var", () => {
    const css = readFileSync(join(root, "platforms/css/tokens.css"), "utf-8");
    ok(css.includes("--primary: var(--md-sys-color-primary)"));
    ok(css.includes("--background: var(--md-sys-color-background)"));
    ok(css.includes("--border: var(--md-sys-color-outline)"));
  });

  test("Atkinson Hyperlegible is first in the brand font stack", () => {
    const css = readFileSync(join(root, "platforms/css/tokens.css"), "utf-8");
    ok(
      /--md-ref-typeface-brand:\s*Atkinson Hyperlegible/.test(css),
      "brand typeface starts with Atkinson Hyperlegible"
    );
  });

  test("JSON output exposes all four named themes", () => {
    const json = JSON.parse(
      readFileSync(join(root, "platforms/json/tokens.json"), "utf-8")
    );
    deepStrictEqual(
      Object.keys(json.themes).sort(),
      ["dark-kc", "dark-standard", "light-kc", "light-standard"]
    );
  });

  test("legibility tokens include high and standard variants", () => {
    const json = JSON.parse(
      readFileSync(join(root, "platforms/json/tokens.json"), "utf-8")
    );
    strictEqual(json.legibility.high["md-sys-legibility-min-touch-target"], "44px");
    strictEqual(json.legibility.standard["md-sys-legibility-min-touch-target"], "40px");
  });

  test("rebuild is deterministic (same input → same output)", () => {
    const before = readFileSync(join(root, "platforms/css/tokens.css"), "utf-8");
    execSync("node scripts/build-tokens.js", { cwd: root, stdio: "pipe" });
    const after = readFileSync(join(root, "platforms/css/tokens.css"), "utf-8");
    strictEqual(after, before, "regenerated CSS must match prior output byte-for-byte");
  });
});
