import { redirect } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CreditCard,
  Repeat2,
  Settings,
  Sparkles,
  Tags,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButtonLink } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import { fetchNotifications } from "@/lib/notifications";

function getWorkspaceTypeLabel(type?: string | null) {
  switch (type) {
    case "COUPLE":
      return "Couple";
    case "FAMILY":
      return "Family";
    case "ROOMMATE":
      return "Roommate";
    case "PERSONAL":
      return "Personal";
    default:
      return "No workspace";
  }
}

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
    href: "/app/settings",
    label: "Settings",
    description: "Profile and workspace setup.",
    icon: Settings,
  },
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
    <AppSurface padding="md" tone={tone}>
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <AppBadge tone="subtle">Menu</AppBadge>
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-950">{label}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <AppButtonLink
        href={href}
        tone="secondary"
        size="sm"
        className="mt-4 w-full gap-2"
      >
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
        {actionLabel}
      </AppButtonLink>
    </AppSurface>
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
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]">
              <Sparkles className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              More
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Mobile shortcuts and workspace tools
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Keep the main navigation focused on daily budgeting. Secondary
              tools live here with clearer visual cues.
            </p>
          </div>
          <AppBadge tone={unreadCount > 0 ? "success" : "subtle"}>
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </AppBadge>
        </div>
      </AppSurface>

      <AppSurface padding="md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Current workspace</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {session.currentWorkspace?.name ?? "No workspace selected"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {getWorkspaceTypeLabel(session.currentWorkspace?.type)} ·{" "}
              {session.currentWorkspace?.memberRole ?? "Member"} ·{" "}
              {session.currentWorkspace?.baseCurrency ?? "CAD"}
            </p>
          </div>
          <AppBadge tone="subtle">
            {session.workspaces.length} workspace
            {session.workspaces.length === 1 ? "" : "s"}
          </AppBadge>
        </div>
      </AppSurface>

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Quick links
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map((item) => (
            <MoreMenuCard
              key={item.href}
              href={item.href}
              label={item.label}
              description={item.description}
              icon={item.icon}
              actionLabel={`Open ${item.label}`}
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
        <div className="grid gap-3 sm:grid-cols-2">
          {MANAGEMENT_LINKS.map((item) => (
            <MoreMenuCard
              key={item.href}
              href={item.href}
              label={item.label}
              description={item.description}
              icon={item.icon}
              tone="muted"
              actionLabel={`Go to ${item.label}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
