import { expect, test } from "@playwright/test";

test("owner can manage invite, notifications, report export, and recurring runs", async ({
  browser,
  page,
}) => {
  const unique = Date.now();
  const ownerEmail = `budgetflow-owner-${unique}@example.com`;
  const ownerPassword = `BudgetFlow!${unique}`;
  const inviteeEmail = `budgetflow-invitee-${unique}@example.com`;
  const inviteePassword = `BudgetFlow!invitee-${unique}`;
  const workspaceName = "Playwright Shared Home";
  const overBudgetMemo = "Over budget groceries";
  const recurringMemo = `Recurring audit ${unique}`;
  const today = new Date();
  const todayDate = today.toISOString().slice(0, 10);

  await page.goto("/sign-up");

  await page.getByLabel("Name").fill("Playwright Owner");
  await page.getByLabel("Email").fill(ownerEmail);
  await page.getByLabel("Password").fill(ownerPassword);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/app\/dashboard/);

  await page.goto("/app/onboarding");
  const createHouseholdForm = page.locator('form[action="/app/onboarding/create-workspace"]');
  await createHouseholdForm.locator('input[name="name"]').fill(workspaceName);
  await createHouseholdForm.evaluate((form: HTMLFormElement) =>
    form.requestSubmit(),
  );

  await expect(page).toHaveURL(/\/app\/dashboard/);
  await expect(
    page.getByRole("main").getByRole("heading", { name: workspaceName, level: 1 }),
  ).toBeVisible();

  await page.goto("/app/budgets");
  const monthlyBudgetForm = page.locator('form[action="/app/budgets/monthly"]').first();
  const workspaceId = await monthlyBudgetForm
    .locator('input[name="workspaceId"]')
    .inputValue();
  const budgetYear = await monthlyBudgetForm.locator('input[name="year"]').inputValue();
  const budgetMonth = await monthlyBudgetForm.locator('input[name="month"]').inputValue();
  const budgetSaveResponse = await page.request.post("/app/budgets/monthly", {
    form: {
      workspaceId,
      year: budgetYear,
      month: budgetMonth,
      totalBudgetAmount: "10",
    },
  });

  expect(budgetSaveResponse.ok()).toBeTruthy();

  await page.goto(`/app/transactions?year=${budgetYear}&month=${budgetMonth}`);
  const marketCategoryId = await page
    .locator('select[name="categoryId"] option')
    .evaluateAll((options) => {
      const matched = options.find(
        (option) => option.textContent?.trim() === "Market",
      );
      return matched instanceof HTMLOptionElement ? matched.value : "";
    });
  const ownerParticipantId = await page
    .locator('select[name="paidByUserId"] option')
    .evaluateAll((options) => {
      const matched = options.find(
        (option) => option.textContent?.trim() === "Playwright Owner",
      );
      return matched instanceof HTMLOptionElement ? matched.value : "";
    });

  expect(marketCategoryId).toBeTruthy();
  expect(ownerParticipantId).toBeTruthy();

  await Promise.all([
    page.waitForURL(/\/app\/transactions\?.*toast=transaction_created/),
    page
      .locator('form[action="/app/transactions/create"]')
      .evaluate((form, payload) => {
        const setField = (selector: string, value: string) => {
          const field = form.querySelector<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >(selector);

          if (!field) {
            throw new Error(`Missing field: ${selector}`);
          }

          field.value = value;
        };

        setField('input[name="amount"]', payload.amount);
        setField('input[name="transactionDate"]', payload.transactionDate);
        setField('select[name="categoryId"]', payload.categoryId);
        setField('textarea[name="memo"]', payload.memo);
        setField(
          'input[name="splitParticipants"]',
          payload.splitParticipants,
        );

        form.requestSubmit();
      }, {
        amount: "48",
        transactionDate: todayDate,
        categoryId: marketCategoryId,
        memo: overBudgetMemo,
        splitParticipants: JSON.stringify([
          {
            userId: ownerParticipantId,
            shareType: "EQUAL",
          },
        ]),
      }),
  ]);
  await expect(page.getByText(overBudgetMemo).first()).toBeVisible();

  await page.goto("/app/settings");
  await page.locator('input[name="email"]').fill(inviteeEmail);
  await page.getByRole("button", { name: "Send invite" }).click();
  await expect(page).toHaveURL(/\/app\/settings\?toast=invite_created/);
  await expect(page.getByText(inviteeEmail)).toBeVisible();
  const inviteHref = await page
    .getByRole("link", { name: "Open invite link" })
    .getAttribute("href");

  expect(inviteHref).toBeTruthy();
  const inviteUrl = new URL(inviteHref!, page.url()).toString();

  await page.goto("/app/notifications");
  await expect(page.getByText("Pending invites")).toBeVisible();
  await expect(page.getByText("Budget exceeded")).toBeVisible();
  await page.getByRole("button", { name: "Mark all read" }).click();
  await expect(page).toHaveURL(/\/app\/notifications\?toast=notifications_read/);
  await expect(page.getByText("0 unread")).toBeVisible();

  await page.goto("/app/recurring");
  const recurringStartDate = await page.locator('input[name="startDate"]').first().inputValue();
  const recurringDayOfMonth = String(Number(recurringStartDate.slice(-2)));

  await Promise.all([
    page.waitForURL(/\/app\/recurring\?toast=recurring_saved/),
    page
      .locator('form[action="/app/recurring/create"]')
      .evaluate((form, payload) => {
        const setField = (selector: string, value: string) => {
          const field = form.querySelector<
            HTMLInputElement | HTMLSelectElement
          >(selector);

          if (!field) {
            throw new Error(`Missing field: ${selector}`);
          }

          field.value = value;
        };

        setField('select[name="type"]', "EXPENSE");
        setField('select[name="categoryId"]', payload.categoryId);
        setField('select[name="visibility"]', "SHARED");
        setField('input[name="amount"]', payload.amount);
        setField('input[name="startDate"]', payload.startDate);
        setField('input[name="memo"]', payload.memo);
        setField('select[name="repeatUnit"]', "MONTHLY");
        setField('input[name="repeatInterval"]', "1");
        setField('input[name="dayOfMonth"]', payload.dayOfMonth);

        form.requestSubmit();
      }, {
        amount: "19",
        categoryId: marketCategoryId,
        dayOfMonth: recurringDayOfMonth,
        memo: recurringMemo,
        startDate: recurringStartDate,
      }),
  ]);
  await expect(page).toHaveURL(/\/app\/recurring\?toast=recurring_saved/);
  await expect(page.getByText(recurringMemo).first()).toBeVisible();

  const manualRunForm = page.locator('form[action="/app/recurring/rerun"]').first();
  const executionDate = await manualRunForm
    .locator('input[name="executionDate"]')
    .inputValue();

  await Promise.all([
    page.waitForURL(/\/app\/recurring\?toast=recurring_rerun_complete/),
    manualRunForm.evaluate((form, payload) => {
        const setField = (selector: string, value: string) => {
          const field = form.querySelector<
            HTMLInputElement | HTMLSelectElement
          >(selector);

          if (!field) {
            throw new Error(`Missing field: ${selector}`);
          }

          field.value = value;
        };

        setField('input[name="executionDate"]', payload.executionDate);
        setField('select[name="dryRun"]', "false");

        form.requestSubmit();
      }, {
        executionDate,
      }),
  ]);
  await expect(page).toHaveURL(/\/app\/recurring\?toast=recurring_rerun_complete/);

  await page.goto(`/app/transactions?year=${budgetYear}&month=${budgetMonth}`);
  await expect(page.getByText(recurringMemo).first()).toBeVisible();

  const exportResponse = await page.request.get(
    `/app/reports/export?year=${budgetYear}&month=${budgetMonth}`,
  );
  expect(exportResponse.ok()).toBeTruthy();
  expect(exportResponse.headers()["content-type"]).toContain("text/csv");
  const exportCsv = await exportResponse.text();
  expect(exportCsv).toContain("BudgetFlow Monthly Report");
  expect(exportCsv).toContain(workspaceName);
  expect(exportCsv).toContain("Market");

  const inviteeContext = await browser.newContext();
  const inviteePage = await inviteeContext.newPage();

  try {
    await inviteePage.goto(inviteUrl);
    await inviteePage.getByRole("link", { name: "Create account" }).click();
    await inviteePage.getByLabel("Name").fill("Playwright Invitee");
    await inviteePage.getByLabel("Email").fill(inviteeEmail);
    await inviteePage.getByLabel("Password").fill(inviteePassword);
    await inviteePage.getByRole("button", { name: "Create account" }).click();

    await expect(inviteePage).toHaveURL(/\/app\/dashboard\?toast=invite_accepted/);
    await expect(
      inviteePage.getByRole("main").getByRole("heading", { name: workspaceName, level: 1 }),
    ).toBeVisible();
  } finally {
    await inviteeContext.close();
  }

  await page.goto("/app/settings");
  await expect(page.getByText("Playwright Invitee").first()).toBeVisible();
  await page
    .locator('form[action="/app/settings/members/remove"]')
    .filter({ has: page.locator('input[name="memberUserId"]') })
    .first()
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page).toHaveURL(/\/app\/settings\?toast=member_removed/);
  await expect(page.getByText("Playwright Invitee")).toHaveCount(0);
});
