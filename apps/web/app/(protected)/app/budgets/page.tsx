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
  const [budget, categories] = await Promise.all([
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
  ]);

  const prev = getPreviousMonth(requestedPeriod.year, requestedPeriod.month);
  const next = getNextMonth(requestedPeriod.year, requestedPeriod.month);
  const locale = session.user.locale === "ko-KR" ? "ko-KR" : "en-CA";
  const currency = session.currentWorkspace.baseCurrency;
  const categoryBudgetMap = new Map(
    (budget?.categories ?? []).map((item) => [item.categoryId, item]),
  );

  return (
    <div className="space-y-6">
      <Reveal delay={0.02}>
        <AppSurface padding="md">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Budgets
        </p>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {formatMonthLabel(requestedPeriod.year, requestedPeriod.month)}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {session.currentWorkspace.name}
            </p>
          </div>
          <AppBadge tone="default" className="px-4 py-2 text-sm font-semibold">
            {categories.length} categories
          </AppBadge>
        </div>

        <div className="mt-5 flex items-center gap-3 text-sm">
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
        </AppSurface>
      </Reveal>

      <StaggerReveal className="grid gap-3 sm:grid-cols-2">
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

      <Reveal delay={0.08}>
        <form
          action="/app/budgets/monthly"
          method="post"
          className=""
        >
        <AppSurface as="div" padding="md">
        <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
        <input type="hidden" name="year" value={requestedPeriod.year} />
        <input type="hidden" name="month" value={requestedPeriod.month} />

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Monthly budget
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Set the workspace limit first.
            </p>
          </div>
          <AppButton type="submit" tone="success" size="sm">
            Save total
          </AppButton>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-slate-700">Amount</span>
          <input
            name="totalBudgetAmount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={formatInputAmount(budget?.totalBudgetAmount ?? "0")}
            placeholder="0"
            className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          />
        </label>
        </AppSurface>
        </form>
      </Reveal>

      <Reveal delay={0.12}>
        <form
          action="/app/budgets/categories"
          method="post"
          className=""
        >
        <AppSurface as="div" padding="md">
        <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
        <input type="hidden" name="year" value={requestedPeriod.year} />
        <input type="hidden" name="month" value={requestedPeriod.month} />

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Category plan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Leave a field blank to keep it unallocated.
            </p>
          </div>
          <AppButton type="submit" tone="primary" size="sm">
            Save plan
          </AppButton>
        </div>

        <div className="mt-5 space-y-3">
          {categories.map((category) => {
            const existingBudget = categoryBudgetMap.get(category.id);

            return (
              <article
                key={category.id}
                className="rounded-[1.5rem] border border-slate-900/8 bg-slate-50 px-4 py-4"
              >
                <input type="hidden" name="categoryId" value={category.id} />
                <input
                  type="hidden"
                  name={`alertThresholdPct:${category.id}`}
                  value={existingBudget?.alertThresholdPct ?? ""}
                />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{category.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {existingBudget
                        ? `Spent ${formatCurrency(existingBudget.actualAmount, currency, locale)}`
                        : "Not allocated"}
                    </p>
                  </div>
                  <div className="w-32">
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
                      className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-right text-sm font-medium text-slate-950 outline-none transition focus:border-emerald-400"
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
