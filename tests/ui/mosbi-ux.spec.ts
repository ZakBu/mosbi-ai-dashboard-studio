import { expect, test } from "@playwright/test";

async function expectNoRuntimeErrors(page: import("@playwright/test").Page, errors: string[]) {
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toContain("Internal Server Error");
  expect(bodyText).not.toContain("Unhandled Runtime Error");
  expect(bodyText).not.toContain("Build Error");
  expect(errors.filter((message) => !message.includes("Download the React DevTools"))).toEqual([]);
}

test.describe("mos.bi editor UX smoke", () => {
  test("landing routes to widget library and editor", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Дашборд из/ })).toBeVisible();
    await page.getByRole("link", { name: /Открыть библиотеку/ }).first().click();
    await expect(page).toHaveURL(/\/dashboard-kit/);
    await expect(page.getByRole("heading", { name: "Tremor base chart library." })).toBeVisible();
    await expectNoRuntimeErrors(page, errors);
  });

  test("AI settings page renders and demo provider can be tested", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/settings/ai", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Выбор ИИ для генерации дашбордов." })).toBeVisible();
    await expect(page.getByRole("button", { name: /Demo deterministic fallback/ })).toBeVisible();
    await page.getByRole("button", { name: "Test connection" }).click();
    await expect(page.getByText("Demo planner is always available.")).toBeVisible();
    await expectNoRuntimeErrors(page, errors);
  });

  test("dashboard kit opens clean Tremor draft and AI build uses registry widgets", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop editor drag and resize are tested on desktop viewport.");
    test.setTimeout(120_000);

    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/dashboard-kit", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".tremor-example-card")).toHaveCount(15);
    await Promise.all([
      page.waitForURL(/\/dashboards\/editor/),
      page.getByRole("link", { name: "Add" }).first().click(),
    ]);

    await expect(page.locator(".editor-chat")).toBeVisible();
    await expect(page.locator(".editor-stage")).toBeVisible();
    await expect(page.locator(".editor-inspector")).toBeVisible();
    await expect(page.locator(".editor-bottom-toolbar")).toBeVisible();
    await expect(page.locator("[data-widget-id='seed_widget']")).toBeVisible();
    await expect(page.locator("[data-widget-id='trend_availability']")).toHaveCount(0);

    const widget = page.locator("[data-widget-id='seed_widget']");
    const before = await widget.boundingBox();
    expect(before).not.toBeNull();
    await page.mouse.move(before!.x + 24, before!.y + 24);
    await page.mouse.down();
    await page.mouse.move(before!.x + 96, before!.y + 64, { steps: 8 });
    await page.mouse.up();
    const after = await widget.boundingBox();
    expect(after).not.toBeNull();
    expect(Math.abs(after!.x - before!.x) + Math.abs(after!.y - before!.y)).toBeGreaterThan(20);

    await page.getByRole("button", { name: "Build with AI" }).click();
    await expect(page.locator("[data-widget-id='trend_availability']")).toBeVisible();
    await expect(page.locator("[data-widget-id='ai_summary']")).toContainText("Управленческий вывод");

    await page.getByRole("button", { name: "Select trend_availability" }).click();
    await page.getByRole("button", { name: "Send patch only to selected" }).click();
    await expect(page.getByText("Patch applied")).toBeVisible();
    await expect(page.getByText("Affected: trend_availability")).toBeVisible();

    const iframeLink = page.getByRole("link", { name: /Iframe/ });
    await expect(iframeLink).toBeVisible();
    const href = await iframeLink.getAttribute("href");
    expect(href).toContain("/embed/");
    await page.goto(href!, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("mos.bi / published dashboard")).toBeVisible();
    await expect(page.locator("[data-widget-id='trend_availability']")).toBeVisible();
    await expectNoRuntimeErrors(page, errors);
  });

  test("product shell pages render without legacy routes", async ({ page }) => {
    const routes = ["/", "/dashboard-kit", "/dashboards", "/dashboards/editor", "/settings/ai"];
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).not.toBeEmpty();
      await expect(page.locator("body")).not.toContainText("Internal Server Error");
    }

    await page.goto("/mvp", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText("404");
    await page.goto("/studio", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText("404");
  });
});
