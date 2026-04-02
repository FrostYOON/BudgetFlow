import { redirect } from "next/navigation";
import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import { getDateDisplayLocale } from "@/lib/display-locale";
import { fetchNotifications } from "@/lib/notifications";

export default async function NotificationsPage() {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  const items = await fetchNotifications({
    accessToken: session.accessToken,
    workspaceId: session.currentWorkspace?.id,
  });
  const dateLocale = getDateDisplayLocale();
  const unreadCount = items.filter((item) => !item.isRead).length;

  return (
    <div className="space-y-6">
      <Reveal delay={0.02}>
        <AppSurface padding="md">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Notifications
          </p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                Attention items
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Budget pressure, settlement due, recurring failures, and invite status.
              </p>
            </div>
            <AppBadge tone={unreadCount > 0 ? "success" : "default"}>
              {unreadCount} unread
            </AppBadge>
          </div>

          <form action="/app/notifications/read-all" method="post" className="mt-5">
            <input
              type="hidden"
              name="workspaceId"
              value={session.currentWorkspace?.id ?? ""}
            />
            <AppButton type="submit" tone="secondary" size="sm">
              Mark all read
            </AppButton>
          </form>
        </AppSurface>
      </Reveal>

      {items.length === 0 ? (
        <Reveal delay={0.06}>
          <AppSurface padding="lg">
            <h2 className="text-lg font-semibold text-slate-950">No notifications</h2>
            <p className="mt-2 text-sm text-slate-500">
              This workspace is quiet right now.
            </p>
            <div className="mt-5">
              <AppButtonLink href="/app/dashboard" tone="secondary" size="sm">
                Back to dashboard
              </AppButtonLink>
            </div>
          </AppSurface>
        </Reveal>
      ) : (
        <StaggerReveal className="space-y-3">
          {items.map((item) => (
            <StaggerItem key={item.key}>
              <AppSurface padding="md" className={!item.isRead ? "border-emerald-200 bg-emerald-50/50" : undefined}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-950">{item.title}</h2>
                      {!item.isRead ? <AppBadge tone="success">New</AppBadge> : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.body}</p>
                  </div>
                  <form action="/app/notifications/read" method="post">
                    <input type="hidden" name="notificationKey" value={item.key} />
                    <AppButton type="submit" tone="secondary" size="sm">
                      Mark read
                    </AppButton>
                  </form>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {item.href ? (
                    <AppButtonLink href={item.href} tone="secondary" size="sm">
                      Open
                    </AppButtonLink>
                  ) : null}
                  <p className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString(dateLocale)}
                  </p>
                </div>
              </AppSurface>
            </StaggerItem>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
