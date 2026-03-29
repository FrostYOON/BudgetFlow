import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { InviteShareActions } from "@/components/settings/invite-share-actions";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import {
  buildWorkspaceInviteJoinPath,
  fetchWorkspaceInvites,
  fetchWorkspaceMembers,
  getWorkspaceInviteDisplayMeta,
  type WorkspaceInviteSummary,
} from "@/lib/settings";
import { WORKSPACE_TYPE_OPTIONS } from "@/lib/workspace-options";

function getLocaleOptions() {
  return [
    { value: "ko-KR", label: "Korean" },
    { value: "en-CA", label: "English (Canada)" },
  ];
}

function getTimezoneOptions() {
  return [
    { value: "Asia/Seoul", label: "Asia/Seoul" },
    { value: "America/Toronto", label: "America/Toronto" },
    { value: "America/Vancouver", label: "America/Vancouver" },
  ];
}

function getCurrencyOptions() {
  return [
    { value: "KRW", label: "KRW" },
    { value: "CAD", label: "CAD" },
    { value: "USD", label: "USD" },
  ];
}

function getWorkspaceTypeOptions() {
  return WORKSPACE_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));
}

export default async function SettingsPage() {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  const members = session.currentWorkspace
    ? await fetchWorkspaceMembers({
        accessToken: session.accessToken,
        workspaceId: session.currentWorkspace.id,
      })
    : [];

  const currentMember =
    members.find((member) => member.userId === session.user.id) ?? null;
  const isOwner = session.currentWorkspace?.memberRole === "OWNER";
  const invites =
    session.currentWorkspace && isOwner
      ? await fetchWorkspaceInvites({
          accessToken: session.accessToken,
          workspaceId: session.currentWorkspace.id,
        })
      : [];
  const pendingInvites = invites.filter((invite) => invite.status === "INVITED");

  return (
    <div className="space-y-8">
      <Reveal delay={0.02}>
        <section className="border-b border-slate-900/8 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Settings
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-15 w-15 items-center justify-center overflow-hidden rounded-[1.35rem] bg-emerald-100 text-base font-semibold text-emerald-900">
            {session.user.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.profileImageUrl}
                alt={session.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              session.user.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? "")
                .join("")
            )}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {session.user.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{session.user.email}</p>
          </div>
        </div>
        </section>
      </Reveal>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Reveal delay={0.06}>
          <AppSurface padding="md">
          <div className="border-b border-slate-900/8 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">Account</h2>
          </div>

          <form
            action="/app/settings/account"
            method="post"
            className="mt-5 space-y-4"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Name
              </span>
              <input
                name="name"
                type="text"
                required
                minLength={2}
                defaultValue={session.user.name}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </span>
              <input
                value={session.user.email}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Locale
              </span>
              <select
                name="locale"
                defaultValue={session.user.locale}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500"
              >
                {getLocaleOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Timezone
              </span>
              <select
                name="timezone"
                defaultValue={session.user.timezone}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500"
              >
                {getTimezoneOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Profile image URL
              </span>
              <input
                name="profileImageUrl"
                type="url"
                defaultValue={session.user.profileImageUrl ?? ""}
                placeholder="https://..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
              />
            </label>

            <AppButton type="submit" className="w-full">
              Save account
            </AppButton>
          </form>
          </AppSurface>
        </Reveal>

        <Reveal delay={0.1}>
          <AppSurface padding="md">
          <div className="border-b border-slate-900/8 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">Household</h2>
          </div>

          {session.currentWorkspace ? (
            <form
              action="/app/settings/member"
              method="post"
              className="mt-5 space-y-4"
            >
              <input
                type="hidden"
                name="workspaceId"
                value={session.currentWorkspace.id}
              />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Workspace
                </span>
                <input
                  value={session.currentWorkspace.name}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Nickname
                </span>
                <input
                  name="nickname"
                  type="text"
                  defaultValue={currentMember?.nickname ?? ""}
                  placeholder="Nickname"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Role
                  </span>
                  <input
                    value={session.currentWorkspace.memberRole}
                    disabled
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Currency
                  </span>
                  <input
                    value={session.currentWorkspace.baseCurrency}
                    disabled
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                  />
                </label>
              </div>

              <AppButton type="submit" tone="secondary" className="w-full">
                Save household profile
              </AppButton>
            </form>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No household.
            </div>
          )}
          </AppSurface>
        </Reveal>

        <Reveal delay={0.14}>
          <AppSurface className="xl:col-span-2" padding="md">
          <div className="border-b border-slate-900/8 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">
              Household invites
            </h2>
          </div>

          {session.currentWorkspace ? (
            isOwner ? (
              <div className="mt-5 space-y-5">
                <form
                  action="/app/settings/invites/create"
                  method="post"
                  className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px_auto]"
                >
                  <input
                    type="hidden"
                    name="workspaceId"
                    value={session.currentWorkspace.id}
                  />
                  <label className="block sm:col-span-1">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                    </span>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="partner@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Role
                    </span>
                    <select
                      name="role"
                      defaultValue="MEMBER"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500"
                    >
                      <option value="MEMBER">Member</option>
                    </select>
                  </label>

                  <div className="flex items-end">
                    <AppButton type="submit" className="w-full">
                      Send invite
                    </AppButton>
                  </div>
                </form>

                {pendingInvites.length > 0 ? (
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => (
                      <InviteCard
                        key={invite.id}
                        invite={invite}
                        workspaceId={invite.workspaceId}
                        workspaceName={session.currentWorkspace?.name ?? "BudgetFlow"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    No pending invites.
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Owner only.
              </div>
            )
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No household.
            </div>
          )}
        </AppSurface>

        <AppSurface className="xl:col-span-2" padding="md">
          <div className="border-b border-slate-900/8 pb-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-950">
                Household settings
              </h2>
              {session.currentWorkspace ? (
                <AppBadge tone="subtle" className="uppercase tracking-[0.18em]">
                  {session.currentWorkspace.memberRole}
                </AppBadge>
              ) : null}
            </div>
          </div>

          {session.currentWorkspace ? (
            isOwner ? (
              <form
                action="/app/settings/workspace"
                method="post"
                className="mt-5 space-y-4"
              >
                <input
                  type="hidden"
                  name="workspaceId"
                  value={session.currentWorkspace.id}
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Name
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    defaultValue={session.currentWorkspace.name}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Type
                    </span>
                    <select
                      name="type"
                      defaultValue={session.currentWorkspace.type}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500"
                    >
                      {getWorkspaceTypeOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Currency
                    </span>
                    <select
                      name="baseCurrency"
                      defaultValue={session.currentWorkspace.baseCurrency}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500"
                    >
                      {getCurrencyOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Timezone
                  </span>
                  <select
                    name="timezone"
                    defaultValue={session.currentWorkspace.timezone}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500"
                  >
                    {getTimezoneOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <AppButton type="submit" tone="success" className="w-full">
                  Save household settings
                </AppButton>
                <AppButtonLink
                  href="/app/settings/categories"
                  tone="secondary"
                  className="w-full"
                >
                  Manage categories
                </AppButtonLink>
              </form>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Name
                    </span>
                    <input
                      value={session.currentWorkspace.name}
                      disabled
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Type
                    </span>
                    <input
                      value={session.currentWorkspace.type}
                      disabled
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Currency
                    </span>
                    <input
                      value={session.currentWorkspace.baseCurrency}
                      disabled
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Timezone
                    </span>
                    <input
                      value={session.currentWorkspace.timezone}
                      disabled
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                    />
                  </label>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  Owner only.
                </div>
              </div>
            )
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No household.
            </div>
          )}
          </AppSurface>
        </Reveal>
      </div>
    </div>
  );
}

function InviteCard({
  invite,
  workspaceId,
  workspaceName,
}: {
  invite: WorkspaceInviteSummary;
  workspaceId: string;
  workspaceName: string;
}) {
  const joinPath = buildWorkspaceInviteJoinPath(invite.token);
  const inviteMeta = getWorkspaceInviteDisplayMeta(invite);

  return (
    <article className="rounded-[1.5rem] border border-slate-900/8 bg-slate-50 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{invite.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <AppBadge tone={inviteMeta.tone}>{inviteMeta.label}</AppBadge>
            <p className="text-slate-500">
              {invite.role} · {inviteMeta.detail}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Invite link
            </p>
            <p className="mt-1 break-all text-sm text-slate-700">{joinPath}</p>
          </div>
          <InviteShareActions
            invitePath={joinPath}
            workspaceName={workspaceName}
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Copy or share this link. Resend rotates the token and renews the
          expiry.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <form action="/app/settings/invites/resend" method="post">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="inviteId" value={invite.id} />
          <AppButton type="submit" tone="secondary" size="sm">
            Resend
          </AppButton>
        </form>
        <form action="/app/settings/invites/revoke" method="post">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="inviteId" value={invite.id} />
          <AppButton type="submit" tone="danger" size="sm">
            Revoke
          </AppButton>
        </form>
        <AppButtonLink
          href={joinPath}
          tone="secondary"
          size="sm"
        >
          Open invite link
        </AppButtonLink>
      </div>
    </article>
  );
}
