import Link from "next/link";
import { redirect } from "next/navigation";
import { TypeDrivenCategoryFields } from "@/components/categories/type-driven-category-fields";
import { getAppSession } from "@/lib/auth/session";
import { fetchWorkspaceMembers, type WorkspaceMemberSummary } from "@/lib/settings";
import {
  fetchWorkspaceCategories,
  type TransactionCategory,
} from "@/lib/transactions";
import {
  fetchRecurringExecutionRuns,
  fetchRecurringOpsSummary,
  fetchRecurringTransactions,
  formatDateLabel,
  formatDateTimeLabel,
  formatPercent,
  formatRecurringRule,
  type RecurringExecutionRun,
  type RecurringRepeatUnit,
  type RecurringTransaction,
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

function formatInputAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(0) : "";
}

function normalizeEditValue(value?: string) {
  return value && value.length > 0 ? value : null;
}

function MemberSelect({
  defaultValue,
  members,
  name,
}: {
  defaultValue?: string | null;
  members: WorkspaceMemberSummary[];
  name: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
    >
      <option value="">Use current member</option>
      {members.map((member) => (
        <option key={member.userId} value={member.userId}>
          {member.nickname ?? member.name}
        </option>
      ))}
    </select>
  );
}

function RepeatRuleFields({
  defaultDayOfMonth,
  defaultDayOfWeek,
  defaultRepeatInterval,
  defaultRepeatUnit,
  prefix = "",
}: {
  defaultDayOfMonth?: number | null;
  defaultDayOfWeek?: number | null;
  defaultRepeatInterval?: number;
  defaultRepeatUnit?: RecurringRepeatUnit;
  prefix?: string;
}) {
  const repeatUnit = defaultRepeatUnit ?? "MONTHLY";

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Repeat</span>
        <select
          name={`${prefix}repeatUnit`}
          defaultValue={repeatUnit}
          className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
        >
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Interval</span>
        <input
          name={`${prefix}repeatInterval`}
          type="number"
          min="1"
          step="1"
          defaultValue={defaultRepeatInterval ?? 1}
          className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Day of month</span>
        <input
          name={`${prefix}dayOfMonth`}
          type="number"
          min="1"
          max="31"
          defaultValue={defaultDayOfMonth ?? ""}
          className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
        />
      </label>

      <label className="block sm:col-span-3">
        <span className="text-sm font-medium text-slate-700">Day of week</span>
        <select
          name={`${prefix}dayOfWeek`}
          defaultValue={
            defaultDayOfWeek === null || defaultDayOfWeek === undefined
              ? ""
              : String(defaultDayOfWeek)
          }
          className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
        >
          <option value="">No weekly day</option>
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
        </select>
      </label>
    </div>
  );
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

function ManualExecutionCard({ workspaceId }: { workspaceId: string }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action="/app/recurring/rerun"
      method="post"
      className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6"
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />

      <div className="border-b border-slate-900/8 pb-4">
        <h2 className="text-lg font-semibold text-slate-950">Manual run</h2>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Execution date
          </span>
          <input
            name="executionDate"
            type="date"
            defaultValue={today}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Mode</span>
          <select
            name="dryRun"
            defaultValue="false"
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          >
            <option value="false">Create transactions</option>
            <option value="true">Dry run only</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Run now
      </button>
    </form>
  );
}

function ExecutionHistory({
  locale,
  runs,
  timeZone,
}: {
  locale: string;
  runs: RecurringExecutionRun[];
  timeZone: string;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
        <h2 className="text-lg font-semibold text-slate-950">
          Execution history
        </h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {runs.length}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {runs.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-slate-950">No runs yet</p>
          </div>
        ) : (
          runs.map((run) => (
            <article
              key={run.id}
              className="rounded-[1.5rem] border border-slate-900/8 bg-slate-50 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {formatDateLabel(run.targetDate, locale)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {run.triggerType} · {run.initiatedByUserName ?? "Scheduler"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getRunStatusTone(
                    run.status,
                  )}`}
                >
                  {run.status}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                <p>Created {run.createdCount ?? 0}</p>
                <p>Skipped {run.skippedCount ?? 0}</p>
                <p>
                  {formatDateTimeLabel(run.finishedAt ?? run.startedAt, locale, timeZone)}
                </p>
              </div>

              {run.errorMessage ? (
                <p className="mt-3 text-sm text-rose-700">{run.errorMessage}</p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function QuickRuleForm({
  categories,
  currency,
  members,
  workspaceId,
}: {
  categories: TransactionCategory[];
  currency: string;
  members: WorkspaceMemberSummary[];
  workspaceId: string;
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action="/app/recurring/create"
      method="post"
      className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6"
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Quick rule</p>
        </div>
        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          {currency}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="currency" value={currency} />

        <TypeDrivenCategoryFields
          categories={categories}
          defaultType="EXPENSE"
          selectClassName="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
        />

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Visibility</span>
          <select
            name="visibility"
            defaultValue="SHARED"
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          >
            <option value="SHARED">Shared</option>
            <option value="PERSONAL">Personal</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Amount</span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Start date</span>
          <input
            name="startDate"
            type="date"
            defaultValue={today}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Paid by</span>
          <MemberSelect members={members} name="paidByUserId" />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Memo</span>
        <input
          name="memo"
          type="text"
          placeholder="Netflix, rent, salary"
          className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
        />
      </label>

      <div className="mt-4">
        <RepeatRuleFields />
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">End date</span>
        <input
          name="endDate"
          type="date"
          className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
        />
      </label>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Save rule
        </button>
      </div>
    </form>
  );
}

function EditRuleForm({
  categories,
  currency,
  item,
  members,
  workspaceId,
}: {
  categories: TransactionCategory[];
  currency: string;
  item: RecurringTransaction;
  members: WorkspaceMemberSummary[];
  workspaceId: string;
}) {
  return (
    <form
      action="/app/recurring/update"
      method="post"
      className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.04)] sm:px-6"
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="recurringTransactionId" value={item.id} />
      <input type="hidden" name="currency" value={currency} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Edit rule</p>
          <p className="mt-1 text-sm text-slate-500">{formatRecurringRule(item)}</p>
        </div>
        <Link
          href="/app/recurring"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
        >
          Cancel
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TypeDrivenCategoryFields
          categories={categories}
          defaultCategoryId={item.categoryId}
          defaultType={item.type}
          selectClassName="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
        />

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Visibility</span>
          <select
            name="visibility"
            defaultValue={item.visibility}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
          >
            <option value="SHARED">Shared</option>
            <option value="PERSONAL">Personal</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Amount</span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={formatInputAmount(item.amount)}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Start date</span>
          <input
            name="startDate"
            type="date"
            defaultValue={item.startDate}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Paid by</span>
          <MemberSelect
            defaultValue={item.paidByUserId}
            members={members}
            name="paidByUserId"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Memo</span>
        <input
          name="memo"
          type="text"
          defaultValue={item.memo ?? ""}
          className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
        />
      </label>

      <div className="mt-4">
        <RepeatRuleFields
          defaultDayOfMonth={item.dayOfMonth}
          defaultDayOfWeek={item.dayOfWeek}
          defaultRepeatInterval={item.repeatInterval}
          defaultRepeatUnit={item.repeatUnit}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">End date</span>
          <input
            name="endDate"
            type="date"
            defaultValue={item.endDate ?? ""}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            name="isActive"
            defaultValue={String(item.isActive)}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
          >
            <option value="true">Active</option>
            <option value="false">Paused</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="submit"
          formAction="/app/recurring/deactivate"
          className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          Pause rule
        </button>
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Update rule
        </button>
      </div>
    </form>
  );
}

export default async function RecurringPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!session.currentWorkspace) {
    redirect("/app/onboarding");
  }

  const locale = getLocale(session.user.locale);
  const params = await searchParams;
  const [ops, executionRuns, recurringItems, members, categories] =
    await Promise.all([
    fetchRecurringOpsSummary({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
    }),
    fetchRecurringExecutionRuns({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
      limit: 8,
    }),
    fetchRecurringTransactions({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
      includeInactive: true,
    }),
    fetchWorkspaceMembers({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
    }),
    fetchWorkspaceCategories({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
    }),
    ]);
  const editableItem =
    recurringItems.find((item) => item.id === normalizeEditValue(params.edit)) ??
    null;
  const successRate = getSuccessRate(
    ops.last7Days.successRuns,
    ops.last7Days.totalRuns,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Recurring
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {session.currentWorkspace.name}
            </h1>
          </div>
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${getSchedulerTone(
              ops.scheduler.enabled,
            )}`}
          >
            {ops.scheduler.enabled ? "Scheduler on" : "Scheduler off"}
          </div>
        </div>
      </section>

      <QuickRuleForm
        categories={categories}
        currency={session.currentWorkspace.baseCurrency}
        members={members}
        workspaceId={session.currentWorkspace.id}
      />

      {editableItem ? (
        <EditRuleForm
          categories={categories}
          currency={session.currentWorkspace.baseCurrency}
          item={editableItem}
          members={members}
          workspaceId={session.currentWorkspace.id}
        />
      ) : null}

      <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
        <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Rules</h2>
            <p className="mt-1 text-sm text-slate-500">
              Active and paused recurring entries.
            </p>
          </div>
          <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
            {recurringItems.length}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {recurringItems.length === 0 ? (
            <section className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
              <p className="text-sm font-medium text-slate-950">
                No recurring rules yet
              </p>
            </section>
          ) : (
            recurringItems.map((item) => (
              <article
                key={item.id}
                className={`rounded-[1.5rem] border px-4 py-4 ${
                  editableItem?.id === item.id
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-900/8 bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {item.memo ?? item.categoryName ?? "Recurring entry"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatRecurringRule(item)}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {item.type} · {item.visibility} ·{" "}
                      {item.isActive ? "Active" : "Paused"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-950">{item.amount}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Starts {formatDateLabel(item.startDate, locale)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/app/recurring?edit=${item.id}`}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                  >
                    Edit
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Next target</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatDateLabel(ops.scheduler.nextTargetDate, locale)}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Active rules</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {ops.recurringTransactions.activeCount}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">7-day success</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatPercent(successRate)}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Failures</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {ops.last7Days.failedRuns}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ExecutionHistory
          locale={locale}
          runs={executionRuns}
          timeZone={ops.scheduler.workspaceTimezone}
        />
        <ManualExecutionCard workspaceId={session.currentWorkspace.id} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">Run snapshots</h2>
            <div className="text-sm text-slate-500">{ops.scheduler.workspaceTimezone}</div>
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

        <aside className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
          <div className="border-b border-slate-900/8 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">Recent failures</h2>
          </div>

          <div className="mt-5 space-y-4">
            {ops.recentFailures.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                <p className="text-sm font-medium text-slate-950">No recent failures</p>
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
