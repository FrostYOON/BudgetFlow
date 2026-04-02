import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const OUTPUT_DIR = path.resolve(process.cwd(), "tmp/layout-review");
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";
const STORAGE_STATE_PATH = path.join(OUTPUT_DIR, "layout-review-auth.json");

async function ensureDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function signUp(page) {
  const unique = Date.now();
  const email = `layout-review-${unique}@example.com`;
  const password = `BudgetFlow!${unique}`;

  await page.goto(`${BASE_URL}/sign-up`);
  await page.getByLabel("Name").fill("Layout Review");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL(/\/app\/dashboard/);

  return { email, password };
}

async function setTheme(page, theme) {
  await page.evaluate((nextTheme) => {
    window.localStorage.setItem("budgetflow-theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.dataset.colorMode = nextTheme;
  }, theme);
}

async function capture(page, route, filename, theme) {
  await page.goto(`${BASE_URL}${route}`);
  if (theme) {
    await setTheme(page, theme);
    await page.reload();
    await page.waitForLoadState("networkidle");
  }
  await page.screenshot({
    fullPage: true,
    path: path.join(OUTPUT_DIR, filename),
  });
}

async function main() {
  await ensureDir();

  const browser = await chromium.launch({ headless: true });

  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
  });
  const desktopPage = await desktop.newPage();
  const credentials = await signUp(desktopPage);
  await desktopPage.evaluate(({ email, password }) => {
    window.localStorage.setItem("__layout_review_email__", email);
    window.localStorage.setItem("__layout_review_password__", password);
  }, credentials);
  await desktop.storageState({ path: STORAGE_STATE_PATH });
  await capture(desktopPage, "/app/dashboard", "desktop-dashboard-light.png", "light");
  await capture(desktopPage, "/app/settings", "desktop-settings-light.png", "light");
  await capture(desktopPage, "/app/settings", "desktop-settings-dark.png", "dark");

  const mobile = await browser.newContext({
    ...devices["iPhone 13"],
    storageState: STORAGE_STATE_PATH,
  });
  const mobilePage = await mobile.newPage();
  await capture(mobilePage, "/app/dashboard", "mobile-dashboard-light.png", "light");
  await capture(mobilePage, "/app/more", "mobile-more-light.png", "light");
  await capture(mobilePage, "/app/settings", "mobile-settings-dark.png", "dark");

  await desktop.close();
  await mobile.close();
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
