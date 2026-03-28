import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";
import {
  fetchRecurringOpsSummary,
  formatDateLabel,
  formatDateTimeLabel,
  formatPercent,
  type RecurringExecutionRun,
} from "@/lib/recurring";

function getLocale(locale: string) {
  return locale === "ko-KR" ? "ko-KR" : "en-CA";
}

function getRunStatusTone(status: RecurringExecutionRun["status"]) {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-100 text-emerald-800";
    case "FAILED":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

function getSchedulerTone(enabled: boolean) {
  return enabled
    ? "bg-emerald-100 text-emerald-800"
    : "bg-slate-200 text-slate-700";
}

function getSuccessRate(successRuns: number, totalRuns: number) {
  if (totalRuns === 0) {
    return 0;
  }

  return (successRuns / totalRuns) * 100;
}

function RunSnapshot({
  locale,
  run,
  timeZone,
  title,
}: {
  locale: string;
  run: RecurringExecutionRun | null;
  timeZone: string;
  title: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-slate-900/8 bg-slate-50 px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-base font-semibold text-slate-950">
            {run ? formatDateLabel(run.targetDate, locale) : "No run recorded"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            run ? getRunStatusTone(run.status) : "bg-slate-200 text-slate-700"
          }`}
        >
          {run?.status ?? "EMPTY"}
        </span>
      </div>

      <dl className="mt-5 space-y-3 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-4">
          <dt>Trigger</dt>
          <dd className="font-medium text-slate-950">
            {run?.triggerType ?? "Not available"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>Created</dt>
          <dd className="font-medium text-slate-950">
            {run?.createdCount ?? 0}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>Finished</dt>
          <dd className="font-medium text-slate-950">
            {run
              ? formatDateTimeLabel(run.finishedAt ?? run.startedAt, locale, timeZone)
              : "Not available"}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export default async function RecurringPage() {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!session.currentWorkspace) {
    redirect("/app/onboarding");
  }

  const locale = getLocale(session.user.locale);
  const ops = await fetchRecurringOpsSummary({
    accessToken: session.accessToken,
    workspaceId: session.currentWorkspace.id,
  });

  const successRate = getSuccessRate(
    ops.last7Days.successRuns,
    ops.last7Days.totalRuns,
  );

  return (
    <div className="space-y-10">
      <section className="border-b border-slate-900/8 pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Recurring
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Automation ops for {session.currentWorkspace.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Workspace-level scheduler health, execution outcomes, and recent
              recurring failures. This page is backed by the recurring ops
              summary API and current authenticated workspace context.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span
              className={`rounded-full px-4 py-2 font-semibold ${getSchedulerTone(
                ops.scheduler.enabled,
              )}`}
            >
              Scheduler {ops.scheduler.enabled ? "enabled" : "disabled"}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        <article className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Next target date</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {formatDateLabel(ops.scheduler.nextTargetDate, locale)}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Local day {formatDateLabel(ops.scheduler.currentLocalDate, locale)}
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Active automations</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {ops.recurringTransactions.activeCount}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Inactive {ops.recurringTransactions.inactiveCount}
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">7-day success rate</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {formatPercent(successRate)}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            {ops.last7Days.successRuns} success / {ops.last7Days.totalRuns} runs
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Failure count</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {ops.last7Days.failedRuns}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Recent failure events in the last 7 days
          </p>
        </article>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-8">
          <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Scheduler state
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Runtime configuration for this workspace scheduler.
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <dt className="text-sm text-slate-500">Cron</dt>
                <dd className="mt-2 font-semibold text-slate-950">
                  {ops.scheduler.cron}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <dt className="text-sm text-slate-500">Workspace timezone</dt>
                <dd className="mt-2 font-semibold text-slate-950">
                  {ops.scheduler.workspaceTimezone}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <dt className="text-sm text-slate-500">Created transactions</dt>
                <dd className="mt-2 font-semibold text-slate-950">
                  {ops.last7Days.createdTransactions}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <dt className="text-sm text-slate-500">Skipped transactions</dt>
                <dd className="mt-2 font-semibold text-slate-950">
                  {ops.last7Days.skippedTransactions}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Execution snapshots
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest run outcomes for operator review.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <RunSnapshot
                locale={locale}
                run={ops.lastRun}
                timeZone={ops.scheduler.workspaceTimezone}
                title="Last run"
              />
              <RunSnapshot
                locale={locale}
                run={ops.lastSuccessfulRun}
                timeZone={ops.scheduler.workspaceTimezone}
                title="Last success"
              />
              <RunSnapshot
                locale={locale}
                run={ops.lastFailedRun}
                timeZone={ops.scheduler.workspaceTimezone}
                title="Last failure"
              />
            </div>
          </section>
        </div>

        <aside className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-900/8 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">
              Recent failures
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Most recent failed runs captured by the recurring execution
              monitor.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {ops.recentFailures.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                <p className="text-sm font-medium text-slate-950">
                  No recent failures
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  The scheduler has not recorded any failed recurring runs in
                  the recent window.
                </p>
              </div>
            ) : (
              ops.recentFailures.map((failure) => (
                <article
                  key={failure.id}
                  className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-rose-900">
                        {formatDateLabel(failure.targetDate, locale)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-rose-700">
                        {failure.triggerType}
                      </p>
                    </div>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                      {failure.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-rose-950">
                    {failure.errorMessage ?? "No error summary was recorded."}
                  </p>

                  <dl className="mt-4 space-y-2 text-sm text-rose-900/80">
                    <div className="flex items-center justify-between gap-4">
                      <dt>Started</dt>
                      <dd>
                        {formatDateTimeLabel(
                          failure.startedAt,
                          locale,
                          ops.scheduler.workspaceTimezone,
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt>Operator</dt>
                      <dd>{failure.initiatedByUserName ?? "Scheduler"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt>Created / skipped</dt>
                      <dd>
                        {failure.createdCount ?? 0} / {failure.skippedCount ?? 0}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
