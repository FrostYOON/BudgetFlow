import Link from "next/link";
import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { getAppSession } from "@/lib/auth/session";
import { WORKSPACE_TYPE_OPTIONS } from "@/lib/workspace-options";

const CURRENCY_OPTIONS = ["CAD", "KRW", "USD", "EUR", "JPY"] as const;

export default async function OnboardingPage() {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (session.currentWorkspace) {
    redirect("/app/dashboard");
  }

  return (
    <div className="space-y-6">
      <Reveal delay={0.02}>
        <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Household setup
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Create your first shared budget space
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          One household, one budget base, then transactions and plans can start.
        </p>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <form
          action="/app/onboarding/create-workspace"
          method="post"
          className="space-y-6 rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6"
        >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Household name
          </label>
          <input
            name="name"
            type="text"
            defaultValue={`${session.user.name}'s home`}
            className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-700">
            Household type
          </legend>
          <div className="grid gap-3">
            {WORKSPACE_TYPE_OPTIONS.map((option, index) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-white"
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  defaultChecked={index === 0}
                  className="mt-1 h-4 w-4 border-slate-300 text-emerald-500 focus:ring-emerald-400"
                />
                <div>
                  <p className="font-semibold text-slate-950">{option.label}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Base currency
            </span>
            <select
              name="baseCurrency"
              defaultValue="CAD"
              className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Timezone</span>
            <input
              name="timezone"
              type="text"
              defaultValue={session.user.timezone}
              className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Link
            href="/app/settings"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 active:scale-[0.98]"
          >
            Account settings
          </Link>
          <button
            type="submit"
            className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 active:scale-[0.98]"
          >
            Create household
          </button>
        </div>
        </form>
      </Reveal>
    </div>
  );
}
