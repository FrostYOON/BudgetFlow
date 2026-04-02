import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CreditCard,
  Repeat2,
  Sparkles,
  Tags,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import { fetchNotifications } from "@/lib/notifications";

const QUICK_LINKS = [
  {
    href: "/app/settlements",
    label: "Settlements",
    description: "Review shared balances fast.",
    icon: ArrowLeftRight,
  },
  {
    href: "/app/reports",
    label: "Reports",
    description: "Open monthly breakdowns.",
    icon: BarChart3,
  },
  {
    href: "/app/notifications",
    label: "Notifications",
    description: "Catch household alerts.",
    icon: Bell,
  },
  {
    href: "/app/recurring",
    label: "Recurring",
    description: "Manage automated entries.",
    icon: Repeat2,
  },
] as const;

const MANAGEMENT_LINKS = [
  {
    href: "/app/settings/accounts",
    label: "Accounts",
    description: "Manage money sources.",
    icon: CreditCard,
  },
  {
    href: "/app/settings/categories",
    label: "Categories",
    description: "Tune order and labels.",
    icon: Tags,
  },
  {
    href: "/app/onboarding",
    label: "Shared space",
    description: "Create another shared workspace.",
    icon: UsersRound,
  },
] as const;

function MoreMenuCard({
  href,
  label,
  description,
  icon: Icon,
  tone = "default",
  actionLabel,
}: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  tone?: "default" | "muted";
  actionLabel: string;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-[1.75rem] border px-5 py-5 shadow-[var(--surface-shadow)] transition hover:-translate-y-0.5 ${
        tone === "muted"
          ? "border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] text-[color:var(--foreground)]"
          : "border-[color:var(--surface-border)] bg-[color:var(--surface)] text-[color:var(--foreground)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--selection-bg)] text-[color:var(--selection-fg)] shadow-[var(--selection-shadow)]">
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--surface-soft)] text-[color:var(--text-soft)]">
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </div>
      <h2 className="mt-3 text-sm font-semibold text-slate-950 sm:text-base">{label}</h2>
      <p className="mt-1 text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">{description}</p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:mt-4 sm:text-xs">
        {actionLabel}
      </p>
    </Link>
  );
}

export default async function MorePage() {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  const unreadCount = session.currentWorkspace
    ? (
        await fetchNotifications({
          accessToken: session.accessToken,
          workspaceId: session.currentWorkspace.id,
        })
      ).filter((item) => !item.isRead).length
    : 0;

  return (
    <div className="space-y-6">
      <AppSurface padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--selection-bg)] text-[color:var(--selection-fg)] shadow-[var(--selection-shadow)]">
              <Sparkles className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Manage
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Settings and tools
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Budget tabs stay focused. Account and secondary tools live here.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AppBadge tone={unreadCount > 0 ? "success" : "subtle"}>
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </AppBadge>
            <AppButtonLink href="/app/settings" tone="secondary" size="sm">
              Open settings
            </AppButtonLink>
          </div>
        </div>
      </AppSurface>

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Quick links
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {QUICK_LINKS.map((item) => (
            <MoreMenuCard
              key={item.href}
              href={item.href}
              label={item.label}
              description={item.description}
              icon={item.icon}
              actionLabel="Open"
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Management
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {MANAGEMENT_LINKS.map((item) => (
            <MoreMenuCard
              key={item.href}
              href={item.href}
              label={item.label}
              description={item.description}
              icon={item.icon}
              tone="muted"
              actionLabel="Open"
            />
          ))}
        </div>

        <AppSurface padding="md" tone="muted">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">Session</p>
              <p className="mt-1 text-sm text-slate-500">
                Sign out lives with the rest of the account tools.
              </p>
            </div>
            <form action="/auth/sign-out" method="post">
              <input type="hidden" name="redirectTo" value="/sign-in" />
              <AppButton type="submit" tone="secondary" size="sm">
                Sign out
              </AppButton>
            </form>
          </div>
        </AppSurface>
      </section>
    </div>
  );
}
