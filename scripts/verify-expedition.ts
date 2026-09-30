import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import {
  createExpedition,
  RUN_KEY,
  serializeRun,
} from "../src/lib/pets/expedition/engine";
const base = process.env.PETS_BASE_URL || "http://localhost:3038",
  out = process.env.PETS_SCREENSHOTS || "/tmp/wildwood-qa";
mkdirSync(out, { recursive: true });
async function main() {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
  });
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: width === 390 ? 844 : 1000 },
        reducedMotion: width === 390 ? "reduce" : "no-preference",
      });
      const page = await context.newPage(),
        errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}/pets`, { waitUntil: "networkidle" });
      await page.locator("#pet-chapter-arena").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/${width}-title.png` });
      await page
        .getByRole("button", { name: "Begin expedition", exact: false })
        .click();
      const canvas = page.locator(".wild-viewport canvas");
      await page.getByRole("button", { name: "Expand game" }).click();
      await canvas.focus();
      assert.ok(
        await canvas.evaluate((n) => {
          const r = n.getBoundingClientRect();
          return (
            r.y >= 0 &&
            r.bottom <= innerHeight &&
            document
              .elementFromPoint(innerWidth / 2, innerHeight / 2)
              ?.closest(".wildwood") !== null
          );
        }),
        "Expanded game must actually be visible above page transforms",
      );
      const initial = Number(await canvas.getAttribute("data-y"));
      await page.keyboard.down("w");
      await page.waitForTimeout(1100);
      await page.keyboard.down("Shift");
      await page.waitForTimeout(230);
      await page.keyboard.up("Shift");
      await page.keyboard.up("w");
      await page.waitForTimeout(150);
      assert.ok(
        Number(await canvas.getAttribute("data-y")) < initial - 100,
        "Movement and dash should cross the world",
      );
      await page.screenshot({ path: `${out}/${width}-forest.png` });
      await page.keyboard.press("Escape");
      await page
        .getByRole("button", { name: "Continue expedition", exact: false })
        .waitFor();
      const savedY = Number(await canvas.getAttribute("data-y"));
      await page.reload({ waitUntil: "networkidle" });
      await page.locator("#pet-chapter-arena").scrollIntoViewIfNeeded();
      await page
        .getByRole("button", { name: "Continue expedition", exact: false })
        .waitFor();
      assert.ok(
        Math.abs(Number(await canvas.getAttribute("data-y")) - savedY) < 3,
      );
      // Real enemy encounter from a valid QA checkpoint, with normal health and combat stats.
      const encounter = {
        ...createExpedition("gracie", 0, `browser-${width}`),
        status: "running" as const,
      };
      encounter.player.x = 800;
      encounter.player.y = 650;
      await page.addInitScript(
        ({ key, raw }) => localStorage.setItem(key, raw),
        { key: `${RUN_KEY}:gracie-1`, raw: serializeRun(encounter) },
      );
      await page.reload({ waitUntil: "networkidle" });
      await page.locator("#pet-chapter-arena").scrollIntoViewIfNeeded();
      await page
        .getByRole("button", { name: "Continue expedition", exact: false })
        .click();
      await page.getByRole("button", { name: "Expand game" }).click();
      await canvas.focus();
      await page.keyboard.down(" ");
      await page.keyboard.down("e");
      await page.waitForTimeout(2400);
      await page.keyboard.up(" ");
      await page.keyboard.up("e");
      await page.screenshot({ path: `${out}/${width}-combat-debug.png` });
      assert.ok(
        Number(await canvas.getAttribute("data-kills")) > 0,
        "Combat must defeat real guardians",
      );
      await page.screenshot({ path: `${out}/${width}-combat.png` });
      await page.getByRole("button", { name: "Exit expanded view" }).click();
      assert.equal(await page.evaluate(() => document.body.style.overflow), "");
      const beforePreference = Number(await canvas.getAttribute("data-y"));
      await page.evaluate(() => {
        const read = Storage.prototype.getItem,
          write = Storage.prototype.setItem;
        Storage.prototype.getItem = function (key) {
          if (key.startsWith("duy:wildwood"))
            throw new DOMException("Blocked", "SecurityError");
          return read.call(this, key);
        };
        Storage.prototype.setItem = function (key, value) {
          if (key.startsWith("duy:wildwood"))
            throw new DOMException("Blocked", "SecurityError");
          return write.call(this, key, value);
        };
      });
      await page.emulateMedia({
        reducedMotion: width === 390 ? "no-preference" : "reduce",
      });
      await page.waitForTimeout(350);
      assert.ok(
        Math.abs(
          Number(await canvas.getAttribute("data-y")) - beforePreference,
        ) < 3,
        "Memory-only run survives preference changes",
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      assert.deepEqual(errors, []);
      console.log(
        JSON.stringify({
          width,
          movement: "passed",
          dash: "passed",
          resume: "passed",
          combat: "passed",
          expand: "passed",
          errors,
        }),
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
