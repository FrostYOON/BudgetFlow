import { expect, test } from "@playwright/test";

test("sign up and create first household", async ({ page }) => {
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

  await expect(
    page.getByRole("heading", { name: "Create your first shared budget space" }),
  ).toBeVisible();

  await page.locator('input[name="name"]').fill(householdName);
  await page.getByRole("button", { name: "Create household" }).click();

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

  await page.goto("/app/budgets");
  await expect(page.getByRole("heading", { name: /March 2026|Mar 2026/i })).toBeVisible();
  await page.locator('input[name="totalBudgetAmount"]').fill("1500");
  await page.getByRole("button", { name: "Save total" }).click();

  await expect(page).toHaveURL(/\/app\/budgets/);
  await expect(page.locator('input[name="totalBudgetAmount"]')).toHaveValue("1500");

  await page.goto("/app/settings");
  await page.getByRole("button", { name: "Sign out" }).click();

  await expect(page).toHaveURL(/\/sign-in/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app\/dashboard/);
  await expect(
    page.getByRole("main").getByRole("heading", { name: householdName, level: 1 }),
  ).toBeVisible();
});
