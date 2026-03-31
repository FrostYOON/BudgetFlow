import { expect, test } from "@playwright/test";

test("sign up, use personal workspace, then add shared workspace", async ({ page }) => {
  const unique = Date.now();
  const email = `budgetflow-e2e-${unique}@example.com`;
  const password = `BudgetFlow!${unique}`;
  const householdName = "Playwright Home";
  const transactionMemo = "Weekly groceries";

  await page.goto("/sign-up");

  await page.getByLabel("Name").fill("Playwright User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
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
    page.getByRole("main").getByRole("heading", { name: /March 2026|Mar 2026/i }),
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
  await expect(page.getByRole("heading", { name: /March 2026|Mar 2026/i })).toBeVisible();
  const monthlyBudgetForm = page.locator('form[action="/app/budgets/monthly"]');
  await monthlyBudgetForm.locator('input[name="totalBudgetAmount"]').fill("1500");
  await monthlyBudgetForm.evaluate((form: HTMLFormElement) => form.requestSubmit());

  await expect(page).toHaveURL(/\/app\/budgets/);
  await expect(page.locator('input[name="totalBudgetAmount"]')).toHaveValue("1500");

  await page.goto("/app/reports");
  await expect(page.getByRole("heading", { name: /March 2026|Mar 2026/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Export CSV" })).toBeVisible();

  await page.goto("/app/settings");
  await expect(page.getByRole("heading", { name: "Security" })).toBeVisible();
  await page.locator('input[name="currentPassword"]').fill(password);
  await page.locator('input[name="nextPassword"]').fill(`${password}-next`);
  await page.locator('input[name="confirmNextPassword"]').fill(`${password}-wrong`);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page).toHaveURL(/\/app\/settings/);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();

  await expect(page).toHaveURL(/\/sign-in/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app\/dashboard/);
  await expect(
    page.getByRole("main").getByRole("heading", { name: householdName, level: 1 }),
  ).toBeVisible();
});
