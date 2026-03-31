import { redirect } from "next/navigation";
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
    description: "Review who owes whom for shared expenses.",
  },
  {
    href: "/app/reports",
    label: "Reports",
    description: "Open monthly summaries, CSV export, and print view.",
  },
  {
    href: "/app/notifications",
    label: "Notifications",
    description: "Catch budget pressure, recurring failures, and invite updates.",
  },
  {
    href: "/app/recurring",
    label: "Recurring",
    description: "Manage automated entries and execution history.",
  },
] as const;

const MANAGEMENT_LINKS = [
  {
    href: "/app/settings",
    label: "Settings",
    description: "Profile, security, workspace details, and invites.",
  },
  {
    href: "/app/settings/accounts",
    label: "Accounts",
    description: "Manage cash, bank, card, and wallet sources.",
  },
  {
    href: "/app/settings/categories",
    label: "Categories",
    description: "Tune starter categories, order, labels, and archive state.",
  },
  {
    href: "/app/onboarding",
    label: "Shared space",
    description: "Create an additional shared workspace when needed.",
  },
] as const;

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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              More
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Mobile shortcuts and workspace tools
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Keep the main navigation focused on daily budgeting. Reach secondary
              tools here without crowding the bottom bar.
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
            <AppSurface key={item.href} padding="md">
              <h2 className="text-base font-semibold text-slate-950">
                {item.label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
              <AppButtonLink
                href={item.href}
                tone="secondary"
                size="sm"
                className="mt-4 w-full"
              >
                Open {item.label}
              </AppButtonLink>
            </AppSurface>
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
            <AppSurface key={item.href} padding="md" tone="muted">
              <h2 className="text-base font-semibold text-slate-950">
                {item.label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
              <AppButtonLink
                href={item.href}
                tone="secondary"
                size="sm"
                className="mt-4 w-full"
              >
                Go to {item.label}
              </AppButtonLink>
            </AppSurface>
          ))}
        </div>
      </section>
    </div>
  );
}
