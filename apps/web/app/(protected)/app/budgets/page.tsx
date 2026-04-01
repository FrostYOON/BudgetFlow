import { redirect } from "next/navigation";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Copy,
  FolderClock,
  PencilLine,
  PiggyBank,
  Receipt,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

type QuickStatTone = "slate" | "emerald" | "white";

function getQuickStatClassName(tone: QuickStatTone) {
  switch (tone) {
    case "emerald":
      return "border-emerald-100 bg-emerald-50/90 text-emerald-950";
    case "white":
      return "border-white/70 bg-white/90 text-slate-950";
    default:
      return "border-slate-200 bg-slate-950 text-white";
  }
}

function BudgetQuickStat({
  icon: Icon,
  label,
  value,
  hint,
  tone = "white",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: QuickStatTone;
}) {
  return (
    <article
      className={`rounded-[1.25rem] border px-4 py-4 ${getQuickStatClassName(tone)}`}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/8">
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
          {label}
        </p>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-sm opacity-75">{hint}</p> : null}
    </article>
  );
}

function BudgetMobileSectionSummary({
  icon: Icon,
  title,
  meta,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
  badge: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{meta}</p>
        </div>
      </div>
      <AppBadge tone="subtle">{badge}</AppBadge>
    </div>
  );
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
          className="overflow-hidden border-[color:var(--success-border)] bg-[image:var(--hero-surface)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]">
                <PiggyBank className="h-5 w-5" strokeWidth={2.2} />
              </span>
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
              <ChevronLeft className="mr-1 h-4 w-4" strokeWidth={2.2} />
              Prev
            </AppButtonLink>
            <AppButtonLink
              href={`/app/budgets?year=${next.year}&month=${next.month}`}
              size="sm"
              tone="secondary"
            >
              <ChevronRight className="mr-1 h-4 w-4" strokeWidth={2.2} />
              Next
            </AppButtonLink>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-4 rounded-[1.75rem] border border-[color:var(--surface-border)] bg-[color:var(--hero-panel)] p-5 shadow-[var(--surface-shadow)] backdrop-blur">
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
                <div
                  className="rounded-[1.25rem] px-4 py-4"
                  style={{
                    backgroundColor: "var(--hero-card)",
                    color: "var(--hero-card-fg)",
                  }}
                >
                  <p className="text-xs uppercase tracking-[0.2em]" style={{ opacity: 0.7 }}>
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
                  <PencilLine className="mr-2 h-4 w-4" strokeWidth={2.2} />
                  Edit total
                </AppButtonLink>
                <AppButtonLink href="#budget-categories" size="sm" tone="secondary">
                  <Target className="mr-2 h-4 w-4" strokeWidth={2.2} />
                  Plan categories
                </AppButtonLink>
              </div>
            </div>

            <div className="hidden gap-3 lg:grid">
              <article className="rounded-[1.5rem] border border-[color:var(--surface-border)] bg-[color:var(--hero-panel)] px-4 py-4">
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

              <article className="rounded-[1.5rem] border border-[color:var(--success-border)] bg-[color:var(--success-surface)] px-4 py-4">
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

          <div className="mt-4 space-y-3 lg:hidden">
            <div className="grid gap-3 sm:grid-cols-3">
              <BudgetQuickStat
                icon={Wallet}
                label="Remaining"
                value={formatCurrency(budget?.unallocatedAmount ?? "0.00", currency, locale)}
                hint={`${allocationProgress}% allocated`}
                tone="slate"
              />
              <BudgetQuickStat
                icon={Target}
                label="Planned"
                value={plannedCategoryCount}
                hint={`${openCategoryCount} still open`}
                tone="white"
              />
              <BudgetQuickStat
                icon={Receipt}
                label="Spent"
                value={formatCurrency(budget?.actualAmount ?? "0.00", currency, locale)}
                hint={`${spendProgress}% of total`}
                tone="emerald"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <AppButtonLink
                href="#budget-total-mobile"
                size="sm"
                tone="success"
                className="gap-2 px-3"
              >
                <PencilLine className="h-4 w-4" strokeWidth={2.2} />
                Total
              </AppButtonLink>
              <AppButtonLink
                href="#budget-categories-mobile"
                size="sm"
                tone="secondary"
                className="gap-2 px-3"
              >
                <Target className="h-4 w-4" strokeWidth={2.2} />
                Plan
              </AppButtonLink>
              <AppButtonLink
                href="#budget-tools"
                size="sm"
                tone="secondary"
                className="gap-2 px-3"
              >
                <Sparkles className="h-4 w-4" strokeWidth={2.2} />
                Tools
              </AppButtonLink>
            </div>
          </div>

          <div className="mt-5 space-y-3 sm:hidden">
            <details
              id="budget-total-mobile"
              className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4"
            >
              <summary className="cursor-pointer list-none">
                <BudgetMobileSectionSummary
                  icon={CircleDollarSign}
                  title="Edit monthly total"
                  meta={formatCurrency(budget?.totalBudgetAmount ?? "0.00", currency, locale)}
                  badge="Quick edit"
                />
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
                  <PencilLine className="mr-2 h-4 w-4" strokeWidth={2.2} />
                  Save total
                </AppButton>
              </form>
            </details>

            <details
              id="budget-categories-mobile"
              className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4"
            >
              <summary className="cursor-pointer list-none">
                <BudgetMobileSectionSummary
                  icon={Target}
                  title="Plan categories"
                  meta={`${plannedCategoryCount} planned, ${openCategoryCount} open`}
                  badge={`${categories.length} items`}
                />
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
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                                <Target className="h-4 w-4" strokeWidth={2.2} />
                              </span>
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
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                                      <Target className="h-4 w-4" strokeWidth={2.2} />
                                    </span>
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
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                                <FolderClock className="h-4 w-4" strokeWidth={2.2} />
                              </span>
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
                  <ArrowDownUp className="mr-2 h-4 w-4" strokeWidth={2.2} />
                  Save plan
                </AppButton>
              </form>
            </details>
          </div>

          <details
            id="budget-tools"
            className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 sm:hidden"
          >
            <summary className="cursor-pointer list-none">
              <BudgetMobileSectionSummary
                icon={Sparkles}
                title="Template and copy tools"
                meta="Keep setup work behind lighter controls"
                badge={budgetTemplate?.id ? "Template ready" : "3 actions"}
              />
            </summary>
            <div className="mt-4 grid gap-3">
              <form action="/app/budgets/copy-previous" method="post">
                <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
                <input type="hidden" name="year" value={requestedPeriod.year} />
                <input type="hidden" name="month" value={requestedPeriod.month} />
                <AppButton type="submit" tone="secondary" size="sm" className="w-full">
                  <Copy className="mr-2 h-4 w-4" strokeWidth={2.2} />
                  Copy previous month
                </AppButton>
              </form>
              <form action="/app/budgets/save-template" method="post">
                <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
                <input type="hidden" name="year" value={requestedPeriod.year} />
                <input type="hidden" name="month" value={requestedPeriod.month} />
                <AppButton type="submit" tone="secondary" size="sm" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" strokeWidth={2.2} />
                  Save as template
                </AppButton>
              </form>
              <form action="/app/budgets/apply-template" method="post">
                <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
                <input type="hidden" name="year" value={requestedPeriod.year} />
                <input type="hidden" name="month" value={requestedPeriod.month} />
                <AppButton type="submit" tone="secondary" size="sm" className="w-full">
                  <FolderClock className="mr-2 h-4 w-4" strokeWidth={2.2} />
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
                <Copy className="mr-2 h-4 w-4" strokeWidth={2.2} />
                Copy previous month
              </AppButton>
            </form>
            <form action="/app/budgets/save-template" method="post">
              <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
              <input type="hidden" name="year" value={requestedPeriod.year} />
              <input type="hidden" name="month" value={requestedPeriod.month} />
              <AppButton type="submit" tone="secondary" size="sm">
                <Sparkles className="mr-2 h-4 w-4" strokeWidth={2.2} />
                Save as template
              </AppButton>
            </form>
            <form action="/app/budgets/apply-template" method="post">
              <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
              <input type="hidden" name="year" value={requestedPeriod.year} />
              <input type="hidden" name="month" value={requestedPeriod.month} />
              <AppButton type="submit" tone="secondary" size="sm">
                <FolderClock className="mr-2 h-4 w-4" strokeWidth={2.2} />
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
                <PencilLine className="mr-2 h-4 w-4" strokeWidth={2.2} />
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
                <ArrowDownUp className="mr-2 h-4 w-4" strokeWidth={2.2} />
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
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200">
                            {hasAllocation ? (
                              <Target className="h-4 w-4" strokeWidth={2.2} />
                            ) : (
                              <FolderClock className="h-4 w-4" strokeWidth={2.2} />
                            )}
                          </span>
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
