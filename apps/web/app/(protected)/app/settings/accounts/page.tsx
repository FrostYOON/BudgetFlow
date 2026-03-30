import { redirect } from "next/navigation";
import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import { fetchFinancialAccounts } from "@/lib/accounts";

const ACCOUNT_TYPE_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "CHECKING", label: "Checking" },
  { value: "SAVINGS", label: "Savings" },
  { value: "CREDIT_CARD", label: "Credit card" },
  { value: "E_WALLET", label: "E-wallet" },
] as const;

export default async function SettingsAccountsPage() {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!session.currentWorkspace) {
    redirect("/app/onboarding");
  }

  const accounts = await fetchFinancialAccounts({
    accessToken: session.accessToken,
    workspaceId: session.currentWorkspace.id,
  });

  return (
    <div className="space-y-6">
      <Reveal delay={0.02}>
        <AppSurface padding="md">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Accounts
          </p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                Funding sources
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Track cash, bank, and card sources for each transaction.
              </p>
            </div>
            <AppButtonLink href="/app/settings" tone="secondary" size="sm">
              Back
            </AppButtonLink>
          </div>
        </AppSurface>
      </Reveal>

      <Reveal delay={0.06}>
        <form action="/app/settings/accounts/create" method="post">
          <AppSurface padding="md">
            <input type="hidden" name="workspaceId" value={session.currentWorkspace.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
                <input
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Type</span>
                <select
                  name="type"
                  defaultValue="CHECKING"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500"
                >
                  {ACCOUNT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Currency</span>
                <input
                  name="currency"
                  type="text"
                  defaultValue={session.currentWorkspace.baseCurrency}
                  maxLength={3}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 uppercase outline-none transition focus:border-emerald-500"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Institution</span>
                <input
                  name="institutionName"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Last four</span>
              <input
                name="lastFour"
                type="text"
                inputMode="numeric"
                maxLength={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500"
              />
            </label>
            <div className="mt-5">
              <AppButton type="submit" tone="success" size="sm">
                Add account
              </AppButton>
            </div>
          </AppSurface>
        </form>
      </Reveal>

      <StaggerReveal className="space-y-3">
        {accounts.map((account) => (
          <StaggerItem key={account.id}>
            <AppSurface padding="md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-950">{account.name}</h2>
                    <AppBadge tone={account.isArchived ? "default" : "success"}>
                      {account.isArchived ? "Archived" : account.type}
                    </AppBadge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {[account.institutionName, account.lastFour ? `•••• ${account.lastFour}` : null, account.currency]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {!account.isArchived ? (
                  <form action="/app/settings/accounts/archive" method="post">
                    <input type="hidden" name="workspaceId" value={session.currentWorkspace!.id} />
                    <input type="hidden" name="accountId" value={account.id} />
                    <AppButton type="submit" tone="secondary" size="sm">
                      Archive
                    </AppButton>
                  </form>
                ) : null}
              </div>
            </AppSurface>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </div>
  );
}
