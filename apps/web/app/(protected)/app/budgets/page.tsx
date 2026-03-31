import { redirect } from "next/navigation";
import {
  Reveal,
  StaggerItem,
  StaggerReveal,
} from "@/components/motion/reveal";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";
import { AppMetricSurface, AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import {
  fetchBudgetTemplate,
  fetchExpenseCategories,
  fetchMonthlyBudget,
} from "@/lib/budgets";
import {
  formatCurrency,
  formatMonthLabel,
  getNextMonth,
  getPreviousMonth,
} from "@/lib/dashboard";

function clampMonth(value: number) {
  return Math.min(Math.max(value, 1), 12);
}

function getPeriod(params?: { year?: string; month?: string }) {
  const now = new Date();
  const year = Number(params?.year ?? now.getFullYear());
  const month = clampMonth(Number(params?.month ?? now.getMonth() + 1));

  return {
    year: Number.isFinite(year) ? year : now.getFullYear(),
    month: Number.isFinite(month) ? month : now.getMonth() + 1,
  };
}

function formatInputAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(0) : "";
}

function parseAmount(value?: string | null) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!session.currentWorkspace) {
    redirect("/app/onboarding");
  }

  const requestedPeriod = getPeriod(await searchParams);
  const [budget, categories, budgetTemplate] = await Promise.all([
    fetchMonthlyBudget({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
      year: requestedPeriod.year,
      month: requestedPeriod.month,
    }),
    fetchExpenseCategories({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
    }),
    fetchBudgetTemplate({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
    }),
  ]);

  const prev = getPreviousMonth(requestedPeriod.year, requestedPeriod.month);
  const next = getNextMonth(requestedPeriod.year, requestedPeriod.month);
  const locale = session.user.locale === "ko-KR" ? "ko-KR" : "en-CA";
  const currency = session.currentWorkspace.baseCurrency;
  const categoryBudgetMap = new Map(
    (budget?.categories ?? []).map((item) => [item.categoryId, item]),
  );
  const monthLabel = formatMonthLabel(requestedPeriod.year, requestedPeriod.month);
  const totalBudgetAmount = parseAmount(budget?.totalBudgetAmount);
  const allocatedAmount = parseAmount(budget?.allocatedAmount);
  const actualAmount = parseAmount(budget?.actualAmount);
  const categoryEntries = categories.map((category) => {
    const existingBudget = categoryBudgetMap.get(category.id);
    const plannedAmount = parseAmount(existingBudget?.plannedAmount);

    return {
      category,
      existingBudget,
      hasAllocation: plannedAmount > 0,
    };
  });
  const plannedCategoryEntries = categoryEntries.filter((entry) => entry.hasAllocation);
  const openCategoryEntries = categoryEntries.filter((entry) => !entry.hasAllocation);
  const mobilePlannedPreviewEntries = plannedCategoryEntries.slice(0, 3);
  const mobilePlannedOverflowEntries = plannedCategoryEntries.slice(3);
  const plannedCategoryCount = plannedCategoryEntries.length;
  const openCategoryCount = Math.max(categories.length - plannedCategoryCount, 0);
  const allocationProgress =
    totalBudgetAmount > 0
      ? Math.min(Math.round((allocatedAmount / totalBudgetAmount) * 100), 100)
      : 0;
  const spendProgress =
    totalBudgetAmount > 0
      ? Math.min(Math.round((actualAmount / totalBudgetAmount) * 100), 100)
      : 0;

  return (
    <div className="space-y-6">
      <Reveal delay={0.02}>
        <AppSurface
          padding="lg"
          className="overflow-hidden border-emerald-100 bg-[linear-gradient(145deg,rgba(236,253,245,0.96),rgba(255,255,255,1)_58%,rgba(241,245,249,0.92))]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Budgets
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                {monthLabel}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {session.currentWorkspace.name}
              </p>
            </div>
            <AppBadge tone="default" className="px-4 py-2 text-sm font-semibold">
              {categories.length} categories
            </AppBadge>
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm">
            <AppButtonLink
              href={`/app/budgets?year=${prev.year}&month=${prev.month}`}
              size="sm"
              tone="secondary"
            >
              Prev
            </AppButtonLink>
            <AppButtonLink
              href={`/app/budgets?year=${next.year}&month=${next.month}`}
              size="sm"
              tone="secondary"
            >
              Next
            </AppButtonLink>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-4 rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Monthly total</p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    {formatCurrency(budget?.totalBudgetAmount ?? "0.00", currency, locale)}
                  </p>
                </div>
                <AppBadge
                  tone={openCategoryCount === 0 ? "success" : "warning"}
                  className="px-3 py-2"
                >
                  {openCategoryCount === 0
                    ? "Fully allocated"
                    : `${openCategoryCount} open`}
                </AppBadge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-slate-950 px-4 py-4 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/65">
                    Remaining
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {formatCurrency(budget?.unallocatedAmount ?? "0.00", currency, locale)}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-emerald-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Planned categories
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {plannedCategoryCount}
                  </p>
                </div>
              </div>

              <div className="hidden flex-wrap gap-3 sm:flex">
                <AppButtonLink href="#budget-total" size="sm" tone="success">
                  Edit total
                </AppButtonLink>
                <AppButtonLink href="#budget-categories" size="sm" tone="secondary">
                  Plan categories
                </AppButtonLink>
              </div>
            </div>

            <div className="hidden gap-3 lg:grid">
              <article className="rounded-[1.5rem] border border-slate-200 bg-white/85 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">Allocated</p>
                  <p className="text-sm font-semibold text-slate-950">
                    {allocationProgress}%
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-950 transition-all"
                    style={{ width: `${allocationProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                  {formatCurrency(budget?.allocatedAmount ?? "0.00", currency, locale)}
                </p>
              </article>

              <article className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/80 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-emerald-800">Spent</p>
                  <p className="text-sm font-semibold text-emerald-900">
                    {spendProgress}%
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${spendProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                  {formatCurrency(budget?.actualAmount ?? "0.00", currency, locale)}
                </p>
              </article>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
            <article className="rounded-[1.25rem] border border-slate-200 bg-white/85 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Allocated
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                {allocationProgress}%
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatCurrency(budget?.allocatedAmount ?? "0.00", currency, locale)}
              </p>
            </article>

            <article className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50/80 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">
                Spent
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                {spendProgress}%
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatCurrency(budget?.actualAmount ?? "0.00", currency, locale)}
              </p>
            </article>
          </div>

          <div className="mt-5 space-y-3 sm:hidden">
            <details className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Edit monthly total</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatCurrency(budget?.totalBudgetAmount ?? "0.00", currency, locale)}
                    </p>
                  </div>
                  <AppBadge tone="success">Quick edit</AppBadge>
                </div>
              </summary>

              <form action="/app/budgets/monthly" method="post" className="mt-4 space-y-4">
                <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
                <input type="hidden" name="year" value={requestedPeriod.year} />
                <input type="hidden" name="month" value={requestedPeriod.month} />

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Amount</span>
                  <input
                    name="totalBudgetAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={formatInputAmount(budget?.totalBudgetAmount ?? "0")}
                    placeholder="0"
                    className="mt-2 w-full rounded-[1.2rem] border border-emerald-200 bg-white px-4 py-4 text-lg font-semibold text-slate-950 outline-none transition focus:border-emerald-400"
                  />
                </label>

                <AppButton type="submit" tone="success" size="sm" className="w-full">
                  Save total
                </AppButton>
              </form>
            </details>

            <details className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Plan categories</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {plannedCategoryCount} planned, {openCategoryCount} open
                    </p>
                  </div>
                  <AppBadge tone="subtle">{categories.length} items</AppBadge>
                </div>
              </summary>

              <form action="/app/budgets/categories" method="post" className="mt-4 space-y-3">
                <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
                <input type="hidden" name="year" value={requestedPeriod.year} />
                <input type="hidden" name="month" value={requestedPeriod.month} />

                {plannedCategoryEntries.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">Planned now</p>
                      <AppBadge tone="success">{plannedCategoryEntries.length}</AppBadge>
                    </div>

                    {mobilePlannedPreviewEntries.map(({ category, existingBudget }) => (
                      <article
                        key={category.id}
                        className="rounded-[1.35rem] border border-slate-900/8 bg-slate-50/85 px-4 py-4"
                      >
                        <input type="hidden" name="categoryId" value={category.id} />
                        <input
                          type="hidden"
                          name={`alertThresholdPct:${category.id}`}
                          value={existingBudget?.alertThresholdPct ?? ""}
                        />

                        <div className="space-y-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-950">{category.name}</p>
                              <AppBadge tone="success">Planned</AppBadge>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                              {existingBudget
                                ? `Spent ${formatCurrency(existingBudget.actualAmount, currency, locale)}`
                                : "No allocation yet"}
                            </p>
                          </div>

                          <label className="block">
                            <span className="sr-only">{category.name}</span>
                            <input
                              id={`planned-mobile-${category.id}`}
                              name={`plannedAmount:${category.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              defaultValue={
                                existingBudget
                                  ? formatInputAmount(existingBudget.plannedAmount)
                                  : ""
                              }
                              className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-right text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-400"
                            />
                          </label>
                        </div>
                      </article>
                    ))}

                    {mobilePlannedOverflowEntries.length > 0 ? (
                      <details className="rounded-[1.35rem] border border-slate-200 bg-slate-50/70 px-4 py-4">
                        <summary className="cursor-pointer list-none">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                More planned categories
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {mobilePlannedOverflowEntries.length} more already budgeted
                              </p>
                            </div>
                            <AppBadge tone="success">{mobilePlannedOverflowEntries.length}</AppBadge>
                          </div>
                        </summary>

                        <div className="mt-4 space-y-3">
                          {mobilePlannedOverflowEntries.map(({ category, existingBudget }) => (
                            <article
                              key={category.id}
                              className="rounded-[1.35rem] border border-slate-900/8 bg-white px-4 py-4"
                            >
                              <input type="hidden" name="categoryId" value={category.id} />
                              <input
                                type="hidden"
                                name={`alertThresholdPct:${category.id}`}
                                value={existingBudget?.alertThresholdPct ?? ""}
                              />

                              <div className="space-y-3">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-slate-950">{category.name}</p>
                                    <AppBadge tone="success">Planned</AppBadge>
                                  </div>
                                  <p className="mt-1 text-sm text-slate-500">
                                    {existingBudget
                                      ? `Spent ${formatCurrency(existingBudget.actualAmount, currency, locale)}`
                                      : "No allocation yet"}
                                  </p>
                                </div>

                                <label className="block">
                                  <span className="sr-only">{category.name}</span>
                                  <input
                                    id={`planned-mobile-more-${category.id}`}
                                    name={`plannedAmount:${category.id}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    defaultValue={
                                      existingBudget
                                        ? formatInputAmount(existingBudget.plannedAmount)
                                        : ""
                                    }
                                    className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-right text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-400"
                                  />
                                </label>
                              </div>
                            </article>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-950">Nothing planned yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Open the categories below and start with the ones you use most.
                    </p>
                  </div>
                )}

                <details className="rounded-[1.35rem] border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Open categories</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {openCategoryEntries.length} categories still blank
                        </p>
                      </div>
                      <AppBadge tone="subtle">{openCategoryEntries.length}</AppBadge>
                    </div>
                  </summary>

                  <div className="mt-4 space-y-3">
                    {openCategoryEntries.map(({ category, existingBudget }) => (
                      <article
                        key={category.id}
                        className="rounded-[1.35rem] border border-slate-900/8 bg-white px-4 py-4"
                      >
                        <input type="hidden" name="categoryId" value={category.id} />
                        <input
                          type="hidden"
                          name={`alertThresholdPct:${category.id}`}
                          value={existingBudget?.alertThresholdPct ?? ""}
                        />

                        <div className="space-y-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-950">{category.name}</p>
                              <AppBadge tone="subtle">Open</AppBadge>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">No allocation yet</p>
                          </div>

                          <label className="block">
                            <span className="sr-only">{category.name}</span>
                            <input
                              id={`planned-mobile-open-${category.id}`}
                              name={`plannedAmount:${category.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              defaultValue=""
                              className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-right text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-400"
                            />
                          </label>
                        </div>
                      </article>
                    ))}
                  </div>
                </details>

                <AppButton type="submit" tone="primary" size="sm" className="w-full">
                  Save plan
                </AppButton>
              </form>
            </details>
          </div>

          <details className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 sm:hidden">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
              Template and copy tools
            </summary>
            <div className="mt-4 grid gap-3">
              <form action="/app/budgets/copy-previous" method="post">
                <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
                <input type="hidden" name="year" value={requestedPeriod.year} />
                <input type="hidden" name="month" value={requestedPeriod.month} />
                <AppButton type="submit" tone="secondary" size="sm" className="w-full">
                  Copy previous month
                </AppButton>
              </form>
              <form action="/app/budgets/save-template" method="post">
                <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
                <input type="hidden" name="year" value={requestedPeriod.year} />
                <input type="hidden" name="month" value={requestedPeriod.month} />
                <AppButton type="submit" tone="secondary" size="sm" className="w-full">
                  Save as template
                </AppButton>
              </form>
              <form action="/app/budgets/apply-template" method="post">
                <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
                <input type="hidden" name="year" value={requestedPeriod.year} />
                <input type="hidden" name="month" value={requestedPeriod.month} />
                <AppButton type="submit" tone="secondary" size="sm" className="w-full">
                  Apply template
                </AppButton>
              </form>
            </div>
            {budgetTemplate?.id ? (
              <p className="mt-3 text-xs text-slate-500">
                Template ready: {budgetTemplate.categories.length} categories
              </p>
            ) : null}
          </details>

          <div className="mt-5 hidden flex-wrap gap-3 sm:flex">
            <form action="/app/budgets/copy-previous" method="post">
              <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
              <input type="hidden" name="year" value={requestedPeriod.year} />
              <input type="hidden" name="month" value={requestedPeriod.month} />
              <AppButton type="submit" tone="secondary" size="sm">
                Copy previous month
              </AppButton>
            </form>
            <form action="/app/budgets/save-template" method="post">
              <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
              <input type="hidden" name="year" value={requestedPeriod.year} />
              <input type="hidden" name="month" value={requestedPeriod.month} />
              <AppButton type="submit" tone="secondary" size="sm">
                Save as template
              </AppButton>
            </form>
            <form action="/app/budgets/apply-template" method="post">
              <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
              <input type="hidden" name="year" value={requestedPeriod.year} />
              <input type="hidden" name="month" value={requestedPeriod.month} />
              <AppButton type="submit" tone="secondary" size="sm">
                Apply template
              </AppButton>
            </form>
            {budgetTemplate?.id ? (
              <p className="self-center text-xs text-slate-500">
                Template ready: {budgetTemplate.categories.length} categories
              </p>
            ) : null}
          </div>
        </AppSurface>
      </Reveal>

      <StaggerReveal className="hidden gap-3 sm:grid sm:grid-cols-2">
        <StaggerItem>
          <AppMetricSurface>
          <p className="text-sm text-slate-500">Monthly total</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              budget?.totalBudgetAmount ?? "0.00",
              currency,
              locale,
            )}
          </p>
          </AppMetricSurface>
        </StaggerItem>
        <StaggerItem>
          <AppMetricSurface>
          <p className="text-sm text-slate-500">Allocated</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(budget?.allocatedAmount ?? "0.00", currency, locale)}
          </p>
          </AppMetricSurface>
        </StaggerItem>
        <StaggerItem>
          <AppMetricSurface>
          <p className="text-sm text-slate-500">Unallocated</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              budget?.unallocatedAmount ?? "0.00",
              currency,
              locale,
            )}
          </p>
          </AppMetricSurface>
        </StaggerItem>
        <StaggerItem>
          <AppMetricSurface>
          <p className="text-sm text-slate-500">Spent</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(budget?.actualAmount ?? "0.00", currency, locale)}
          </p>
          </AppMetricSurface>
        </StaggerItem>
      </StaggerReveal>

      <Reveal delay={0.08} className="hidden sm:block">
        <form action="/app/budgets/monthly" method="post">
          <AppSurface as="div" padding="md" tone="success" className="scroll-mt-28" id="budget-total">
            <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
            <input type="hidden" name="year" value={requestedPeriod.year} />
            <input type="hidden" name="month" value={requestedPeriod.month} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Quick edit
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Monthly budget
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Update the total first, then distribute it across categories.
                </p>
              </div>
              <AppButton type="submit" tone="success" size="sm" className="w-full sm:w-auto">
                Save total
              </AppButton>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Amount</span>
                <input
                  name="totalBudgetAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={formatInputAmount(budget?.totalBudgetAmount ?? "0")}
                  placeholder="0"
                  className="mt-2 w-full rounded-[1.35rem] border border-emerald-200 bg-white px-4 py-4 text-lg font-semibold text-slate-950 outline-none transition focus:border-emerald-400"
                />
              </label>

              <div className="rounded-[1.35rem] border border-emerald-200/80 bg-white/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">
                  Unallocated now
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {formatCurrency(budget?.unallocatedAmount ?? "0.00", currency, locale)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Leave room here before final category planning.
                </p>
              </div>
            </div>
          </AppSurface>
        </form>
      </Reveal>

      <Reveal delay={0.12} className="hidden sm:block">
        <form action="/app/budgets/categories" method="post">
          <AppSurface as="div" padding="md" className="scroll-mt-28" id="budget-categories">
            <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
            <input type="hidden" name="year" value={requestedPeriod.year} />
            <input type="hidden" name="month" value={requestedPeriod.month} />

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Step 2
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Category plan
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill the categories that matter this month and leave the rest open.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AppBadge tone="success">{plannedCategoryCount} planned</AppBadge>
                <AppBadge tone="subtle">{openCategoryCount} open</AppBadge>
              </div>
            </div>

            <div className="mt-4">
              <AppButton type="submit" tone="primary" size="sm" className="w-full sm:w-auto">
                Save plan
              </AppButton>
            </div>

            <div className="mt-5 space-y-3">
              {categories.map((category) => {
                const existingBudget = categoryBudgetMap.get(category.id);
                const plannedAmount = parseAmount(existingBudget?.plannedAmount);
                const hasAllocation = plannedAmount > 0;

                return (
                  <article
                    key={category.id}
                    className="rounded-[1.6rem] border border-slate-900/8 bg-slate-50/85 px-4 py-4"
                  >
                    <input type="hidden" name="categoryId" value={category.id} />
                    <input
                      type="hidden"
                      name={`alertThresholdPct:${category.id}`}
                      value={existingBudget?.alertThresholdPct ?? ""}
                    />

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-950">{category.name}</p>
                          <AppBadge tone={hasAllocation ? "success" : "subtle"}>
                            {hasAllocation ? "Planned" : "Open"}
                          </AppBadge>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {existingBudget
                            ? `Spent ${formatCurrency(existingBudget.actualAmount, currency, locale)} this month`
                            : "No allocation yet for this month"}
                        </p>
                      </div>

                      <div className="sm:w-40">
                        <label className="sr-only" htmlFor={`planned-${category.id}`}>
                          {category.name}
                        </label>
                        <input
                          id={`planned-${category.id}`}
                          name={`plannedAmount:${category.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          defaultValue={
                            existingBudget
                              ? formatInputAmount(existingBudget.plannedAmount)
                              : ""
                          }
                          className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-right text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </AppSurface>
        </form>
      </Reveal>
    </div>
  );
}
