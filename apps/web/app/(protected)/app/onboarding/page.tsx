import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
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
        <AppSurface padding="lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Household setup
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Create your first shared budget space
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          One household, one budget base, then transactions and plans can start.
        </p>
        </AppSurface>
      </Reveal>

      <Reveal delay={0.08}>
        <form
          action="/app/onboarding/create-workspace"
          method="post"
          className="space-y-6"
        >
        <AppSurface as="div" padding="md">
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
          <AppButtonLink
            href="/app/settings"
            tone="secondary"
            size="sm"
          >
            Account settings
          </AppButtonLink>
          <AppButton type="submit" tone="success">
            Create household
          </AppButton>
        </div>
        </AppSurface>
        </form>
      </Reveal>
    </div>
  );
}
