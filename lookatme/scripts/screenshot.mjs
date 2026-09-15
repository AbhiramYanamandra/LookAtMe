/**
 * Visual-review helper: captures the implementation at the same viewports,
 * scroll offsets, and paused carousel phases as the approved reference
 * screenshots (design/approved-landing-page/screenshots/README.md).
 *
 * Usage: node scripts/screenshot.mjs [baseUrl] [outDir]
 * Requires a running dev server (default http://localhost:3000) and Playwright.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "screenshots";
fs.mkdirSync(out, { recursive: true });

const shots = [
  { name: "desktop-1280-hero", url: "/?still=1&phase=0.27", width: 1280, height: 900, scroll: 0 },
  { name: "desktop-1280-content", url: "/?still=1&phase=0.27", width: 1280, height: 1200, scroll: 790 },
  { name: "desktop-1280-phase-047", url: "/?still=1&phase=0.47", width: 1280, height: 900, scroll: 0 },
  { name: "desktop-1280-phase-067", url: "/?still=1&phase=0.67", width: 1280, height: 900, scroll: 0 },
  { name: "tablet-768-projects", url: "/?still=1&phase=0.27", width: 768, height: 1100, scroll: 1056 },
  { name: "mobile-390-hero", url: "/?still=1&phase=0.27", width: 390, height: 844, scroll: 0 },
  { name: "mobile-390-introduction", url: "/?still=1&phase=0.27", width: 390, height: 844, scroll: 590 },
  { name: "mobile-390-projects", url: "/?still=1&phase=0.27", width: 390, height: 1200, scroll: 1144 },
  { name: "mobile-390-footer", url: "/?still=1&phase=0.27", width: 390, height: 844, scroll: 1727 },
  { name: "library-1280", url: "/projects", width: 1280, height: 1100, scroll: 0 },
  { name: "library-390", url: "/projects", width: 390, height: 1200, scroll: 0 },
  { name: "library-768-hardware", url: "/projects?field=hardware", width: 768, height: 1000, scroll: 0 },
  { name: "case-study-1280", url: "/projects/macropad", width: 1280, height: 1400, scroll: 0 },
  { name: "case-study-390", url: "/projects/pipeline-processor", width: 390, height: 1600, scroll: 0 },
];

const only = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const shot of shots) {
  if (only && !only.has(shot.name)) continue;
  const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height }, deviceScaleFactor: 1 });
  // Compare settled layouts: skip the once-per-session droplet entrance and show reveals at once.
  await page.addInitScript(() => {
    try { sessionStorage.setItem("lookatme:hero-entrance", "done"); } catch {}
  });
  await page.goto(base + shot.url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((el) => { el.style.transition = "none"; el.classList.add("is-revealed"); }));
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(shot.width - 5, shot.height - 5);
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), shot.scroll);
  // Wait for every image that has started loading (lazy images off-screen never will).
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images)
        .filter((img) => img.loading !== "lazy" || img.currentSrc)
        .map((img) => (img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r; }))),
    );
  });
  await page.waitForTimeout(600);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({ path: path.join(out, `${shot.name}.png`) });
  console.log(`${shot.name}: document ${height}px tall, horizontal overflow ${overflow}px`);
  await page.close();
}
await browser.close();
