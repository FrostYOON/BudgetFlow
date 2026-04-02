import { expect, test } from "@playwright/test";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMonthHeadingRegex(year: number, month: number) {
  const date = new Date(Date.UTC(year, month - 1, 1));
  const longLabel = new Intl.DateTimeFormat("en-CA", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
  const shortLabel = new Intl.DateTimeFormat("en-CA", {
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);

  return new RegExp(`${escapeRegex(longLabel)}|${escapeRegex(shortLabel)}`, "i");
}

test("sign up, use personal workspace, then add shared workspace", async ({ page }) => {
  const unique = Date.now();
  const email = `budgetflow-e2e-${unique}@example.com`;
  const password = `BudgetFlow!${unique}`;
  const userName = `Playwright User ${unique}`;
  const householdName = "Playwright Home";
  const transactionMemo = "Weekly groceries";
  const now = new Date();
  const currentMonthHeading = buildMonthHeadingRegex(
    now.getFullYear(),
    now.getMonth() + 1,
  );

  await page.goto("/sign-up");

  await page.getByLabel("Name").fill(userName);
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="confirmPassword"]').fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/app\/dashboard/);
  await expect(
    page.getByRole("main").getByRole("heading", { level: 1 }),
  ).toBeVisible();
  await expect(page.getByText(/Budget/i).first()).toBeVisible();

  await page.goto("/app/onboarding");
  await expect(
    page.getByRole("heading", { name: "Add a shared workspace" }),
  ).toBeVisible();

  const createHouseholdForm = page.locator('form[action="/app/onboarding/create-workspace"]');
  await createHouseholdForm.locator('input[name="name"]').fill(householdName);
  await createHouseholdForm.evaluate((form: HTMLFormElement) =>
    form.requestSubmit(),
  );

  await expect(page).toHaveURL(/\/app\/dashboard/);
  await expect(
    page.getByRole("main").getByRole("heading", { name: householdName, level: 1 }),
  ).toBeVisible();

  await page.goto("/app/transactions");
  await expect(
    page.getByRole("main").getByRole("heading", { name: currentMonthHeading }),
  ).toBeVisible();

  await page.locator('input[name="amount"]').fill("48");
  await page.locator('textarea[name="memo"]').fill(transactionMemo);
  await page.getByRole("button", { name: "Save transaction" }).click();

  await expect(page).toHaveURL(/\/app\/transactions/);
  await expect(page.getByText(transactionMemo).first()).toBeVisible();

  await page.goto("/app/settlements");
  await expect(
    page.getByRole("heading", { name: householdName, level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Shared expense").first()).toBeVisible();
  await expect(page.getByText(transactionMemo).first()).toBeVisible();

  await page.goto("/app/budgets");
  await expect(page.getByRole("heading", { name: currentMonthHeading })).toBeVisible();
  const monthlyBudgetForm = page.locator('form[action="/app/budgets/monthly"]').first();
  const workspaceId = await monthlyBudgetForm
    .locator('input[name="workspaceId"]')
    .inputValue();
  const budgetYear = await monthlyBudgetForm.locator('input[name="year"]').inputValue();
  const budgetMonth = await monthlyBudgetForm.locator('input[name="month"]').inputValue();
  const budgetHeading = buildMonthHeadingRegex(Number(budgetYear), Number(budgetMonth));
  const budgetSaveResponse = await page.request.post("/app/budgets/monthly", {
    form: {
      workspaceId,
      year: budgetYear,
      month: budgetMonth,
      totalBudgetAmount: "1500",
    },
  });

  expect(budgetSaveResponse.ok()).toBeTruthy();
  await page.goto(`/app/budgets?year=${budgetYear}&month=${budgetMonth}`);
  await expect(page.getByRole("heading", { name: budgetHeading })).toBeVisible();
  await expect(page.locator('input[name="totalBudgetAmount"]').first()).toHaveValue("1500");

  await page.goto("/app/reports");
  await expect(page.getByRole("heading", { name: budgetHeading })).toBeVisible();
  await expect(page.getByRole("link", { name: "Export CSV" })).toBeVisible();

  await page.goto("/app/settings");
  await expect(page.getByRole("heading", { name: "Security" })).toBeVisible();
  await page.locator('input[name="currentPassword"]').fill(password);
  await page.locator('input[name="nextPassword"]').fill(`${password}-next`);
  await page.locator('input[name="confirmNextPassword"]').fill(`${password}-wrong`);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page).toHaveURL(/\/app\/settings/);
  await page
    .locator('form[action="/auth/sign-out"]')
    .first()
    .evaluate((form: HTMLFormElement) => form.requestSubmit());

  await expect(page).toHaveURL(/\/sign-in/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app\/dashboard/);
  await expect(
    page.getByRole("main").getByRole("heading", { name: householdName, level: 1 }),
  ).toBeVisible();
});
