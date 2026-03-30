import { redirect } from "next/navigation";
import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";
import { SettlementShareActions } from "@/components/settlements/settlement-share-actions";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButtonLink } from "@/components/ui/app-button";
import { AppMetricSurface, AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import {
  fetchWorkspaceDashboard,
  formatCurrency,
  formatMonthLabel,
  getNextMonth,
  getPreviousMonth,
} from "@/lib/dashboard";
import {
  fetchAllWorkspaceTransactions,
  formatDateLabel,
  getMonthRange,
  type WorkspaceTransaction,
} from "@/lib/transactions";

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

function getSplitLabel(transaction: WorkspaceTransaction) {
  const [firstParticipant] = transaction.participants;

  if (!firstParticipant) {
    return "Equal split";
  }

  if (firstParticipant.shareType === "FIXED") {
    return "Fixed split";
  }

  if (firstParticipant.shareType === "PERCENTAGE") {
    return "Percentage split";
  }

  return "Equal split";
}

function getBalanceTone(value: string) {
  const amount = Number(value);

  if (amount > 0) {
    return "text-emerald-700";
  }

  if (amount < 0) {
    return "text-rose-600";
  }

  return "text-slate-500";
}

export default async function SettlementsPage({
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
  const monthRange = getMonthRange(
    requestedPeriod.year,
    requestedPeriod.month,
  );
  const [dashboard, sharedTransactions] = await Promise.all([
    fetchWorkspaceDashboard({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
      year: requestedPeriod.year,
      month: requestedPeriod.month,
    }),
    fetchAllWorkspaceTransactions({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
      from: monthRange.from,
      to: monthRange.to,
      type: "EXPENSE",
      visibility: "SHARED",
    }),
  ]);

  const prev = getPreviousMonth(dashboard.period.year, dashboard.period.month);
  const next = getNextMonth(dashboard.period.year, dashboard.period.month);
  const currency = session.currentWorkspace.baseCurrency;
  const locale = session.user.locale === "ko-KR" ? "ko-KR" : "en-CA";
  const monthLabel = formatMonthLabel(
    dashboard.period.year,
    dashboard.period.month,
  );
  const isPersonalWorkspace = session.currentWorkspace.type === "PERSONAL";
  const hasSharedSettlement =
    dashboard.settlement.balances.length > 1 ||
    Number(dashboard.settlement.totalSharedExpense) > 0;

  if (isPersonalWorkspace) {
    return (
      <Reveal delay={0.04}>
        <AppSurface padding="lg">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Settlements
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            Shared settlement starts in a shared space
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Your personal workspace does not need balances or transfers.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <AppButtonLink href="/app/onboarding" tone="success" size="sm">
              Create shared space
            </AppButtonLink>
            <AppButtonLink href="/app/dashboard" tone="secondary" size="sm">
              Back to dashboard
            </AppButtonLink>
          </div>
        </AppSurface>
      </Reveal>
    );
  }

  return (
    <div className="space-y-8">
      <Reveal delay={0.02}>
        <AppSurface padding="lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Settlements
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {session.currentWorkspace.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{monthLabel}</p>
            </div>
            <SettlementShareActions
              balances={dashboard.settlement.balances}
              currency={currency}
              locale={locale}
              monthLabel={monthLabel}
              totalSharedExpense={dashboard.settlement.totalSharedExpense}
              transfers={dashboard.settlement.suggestedTransfers}
              workspaceName={session.currentWorkspace.name}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <AppButtonLink
              href={`/app/settlements?year=${prev.year}&month=${prev.month}`}
              size="sm"
              tone="secondary"
            >
              Prev
            </AppButtonLink>
            <AppBadge tone="default" className="px-4 py-2 text-sm font-medium">
              {monthLabel}
            </AppBadge>
            <AppButtonLink
              href={`/app/settlements?year=${next.year}&month=${next.month}`}
              size="sm"
              tone="secondary"
            >
              Next
            </AppButtonLink>
            <AppButtonLink href="/app/dashboard" size="sm" tone="secondary">
              Dashboard
            </AppButtonLink>
          </div>
        </AppSurface>
      </Reveal>

      <StaggerReveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <AppMetricSurface>
            <p className="text-sm text-slate-500">Shared expense</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {formatCurrency(
                dashboard.settlement.totalSharedExpense,
                currency,
                locale,
              )}
            </p>
          </AppMetricSurface>
        </StaggerItem>
        <StaggerItem>
          <AppMetricSurface>
            <p className="text-sm text-slate-500">People involved</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {dashboard.settlement.balances.length}
            </p>
          </AppMetricSurface>
        </StaggerItem>
        <StaggerItem>
          <AppMetricSurface>
            <p className="text-sm text-slate-500">Suggested transfers</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {dashboard.settlement.suggestedTransfers.length}
            </p>
          </AppMetricSurface>
        </StaggerItem>
        <StaggerItem>
          <AppMetricSurface>
            <p className="text-sm text-slate-500">Shared entries</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {sharedTransactions.length}
            </p>
          </AppMetricSurface>
        </StaggerItem>
      </StaggerReveal>

      {!hasSharedSettlement ? (
        <Reveal delay={0.08}>
          <AppSurface padding="lg">
            <h2 className="text-lg font-semibold text-slate-950">
              No shared settlement yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Add a shared expense to generate balances and transfers.
            </p>
            <div className="mt-5">
              <AppButtonLink href="/app/transactions" tone="success" size="sm">
                Add shared expense
              </AppButtonLink>
            </div>
          </AppSurface>
        </Reveal>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Reveal delay={0.1}>
            <AppSurface padding="lg">
              <div className="flex items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
                <h2 className="text-lg font-semibold text-slate-950">
                  Balances
                </h2>
                <AppBadge tone="success">
                  {formatCurrency(
                    dashboard.settlement.totalSharedExpense,
                    currency,
                    locale,
                  )}
                </AppBadge>
              </div>

              <div className="mt-5 space-y-3">
                {dashboard.settlement.balances.map((balance) => {
                  const amount = Number(balance.netAmount);
                  return (
                    <div
                      key={balance.userId}
                      className="flex items-center justify-between rounded-[1.5rem] bg-slate-50 px-4 py-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {balance.name}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                          {amount > 0
                            ? "Gets back"
                            : amount < 0
                              ? "Owes"
                              : "Settled"}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-semibold ${getBalanceTone(balance.netAmount)}`}
                      >
                        {amount > 0 ? "+" : ""}
                        {formatCurrency(balance.netAmount, currency, locale)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </AppSurface>
          </Reveal>

          <Reveal delay={0.14}>
            <AppSurface padding="lg">
              <div className="border-b border-slate-900/8 pb-4">
                <h2 className="text-lg font-semibold text-slate-950">
                  Suggested transfers
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                {dashboard.settlement.suggestedTransfers.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Everyone is settled for this month.
                  </div>
                ) : (
                  dashboard.settlement.suggestedTransfers.map((transfer) => (
                    <div
                      key={`${transfer.fromUserId}-${transfer.toUserId}`}
                      className="rounded-[1.5rem] bg-slate-50 px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {transfer.fromName} → {transfer.toName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatCurrency(transfer.amount, currency, locale)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </AppSurface>
          </Reveal>
        </div>
      )}

      <Reveal delay={0.18}>
        <AppSurface padding="lg">
          <div className="flex items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">
              Shared expense ledger
            </h2>
            <AppBadge tone="default">
              {sharedTransactions.length} items
            </AppBadge>
          </div>

          <div className="mt-5 space-y-3">
            {sharedTransactions.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No shared expenses recorded in this month.
              </div>
            ) : (
              sharedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-[1.5rem] border border-slate-900/8 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {transaction.memo?.trim() ||
                          transaction.categoryName ||
                          "Shared expense"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateLabel(transaction.transactionDate, locale)} ·{" "}
                        {transaction.paidByUserName ?? "Unknown payer"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-950">
                      {formatCurrency(transaction.amount, currency, locale)}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <AppBadge tone="subtle">{getSplitLabel(transaction)}</AppBadge>
                    <AppBadge tone="subtle">
                      {transaction.participants.length > 0
                        ? `${transaction.participants.length} people`
                        : "All active members"}
                    </AppBadge>
                  </div>
                </div>
              ))
            )}
          </div>
        </AppSurface>
      </Reveal>
    </div>
  );
}
