import { expect, test } from "@playwright/test";

const pin = process.env.SHOTS_PIN || "KEPPA";

async function signIn(page) {
  await page.goto("/#shots");
  await expect(page.locator("#shots-pin")).toBeVisible({ timeout: 15000 });
  await page.fill("#shots-pin", pin);
  await page.click('button:has-text("Open tracker")');
  await expect(page.locator(".shots-admin h1, .tracker-page, .shots-gate h1").first()).toBeVisible({
    timeout: 20000,
  });
}

test.describe("Shot tracker smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.clear();
      } catch (_) {
        /* ignore */
      }
    });
  });

  test("PIN gate opens Games", async ({ page }) => {
    await signIn(page);
    await page.goto("/#shots-games");
    await expect(page.locator(".shots-admin h1")).toHaveText("Games", { timeout: 15000 });
    await expect(page.locator("#new-game-form")).toBeVisible();
  });

  test("add game, record shot, edit shot, lineup swap", async ({ page }) => {
    test.setTimeout(120000);
    await signIn(page);
    await page.goto("/#shots-games");
    await expect(page.locator("#new-game-form")).toBeVisible({ timeout: 15000 });

    const away = page.locator("#new-game-away");
    await expect(away).toBeVisible();
    const values = await away.locator("option").evaluateAll((opts) =>
      opts.map((o) => ({ value: o.value, text: (o.textContent || "").trim() }))
    );
    const existing = values.find(
      (o) => o.value && o.value !== "__new__" && !/brighton/i.test(o.text) && o.text !== "Select…"
    );
    if (existing) {
      await away.selectOption(existing.value);
    } else {
      await away.selectOption("__new__");
      await expect(page.locator("#new-away-name")).toBeVisible();
      await page.locator("#new-away-name").fill(`E2E Opp ${Date.now()}`);
    }

    await page.locator("#new-game-type").selectOption("friendly");
    await page.locator("#new-game-form button[type=submit]").click();

    await expect(page.locator(".tracker-page")).toBeVisible({ timeout: 20000 });
    await expect(page.locator("#tracker-pitch-us .pitch-svg")).toBeVisible();

    // Lineup swap control
    const swapBtn = page.locator('[data-swap-slot][data-swap-team="us"]').first();
    await expect(swapBtn).toBeVisible();
    await swapBtn.click();
    await expect(page.locator(".lineup-swap.is-on, [data-lineup-gesture-cancel]").first()).toBeVisible();
    const cancel = page.locator("[data-lineup-gesture-cancel]");
    if (await cancel.count()) await cancel.first().click();

    // Double-tap pitch to open record modal
    const svg = page.locator("#tracker-pitch-us .pitch-svg");
    const box = await svg.boundingBox();
    expect(box).toBeTruthy();
    const x = box.x + box.width * 0.55;
    const y = box.y + box.height * 0.4;
    await page.mouse.click(x, y);
    await page.waitForTimeout(80);
    await page.mouse.click(x, y);

    const shotModal = page.locator("#shot-event-modal");
    await expect(shotModal).toBeVisible({ timeout: 10000 });
    await page.locator('[data-action-id="goal"]').click();

    // Position phase: tapping a formation card completes the shot (player optional)
    await expect(page.locator("[data-pick-position]").first()).toBeVisible({ timeout: 10000 });
    await page.locator("[data-pick-position]").first().click();

    await expect(page.locator("#tracker-log")).toContainText(/Goal/i, { timeout: 20000 });

    // Edit existing shot
    await page.locator("[data-edit-shot]").first().click();
    const editModal = page.locator("#shot-edit-modal");
    await expect(editModal).toBeVisible();
    await expect(editModal).not.toHaveAttribute("hidden", "");
    await page.locator("#shot-edit-result").selectOption("blocked");
    await page.locator("#shot-edit-save").click();
    await expect(page.locator("#tracker-log")).toContainText(/Blocked/i, { timeout: 15000 });
  });
});
