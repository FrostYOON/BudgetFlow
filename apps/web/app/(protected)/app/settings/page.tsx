import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";
import {
  fetchWorkspaceInvites,
  fetchWorkspaceMembers,
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

function formatInviteDate(input: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
  }).format(new Date(input));
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
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

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save account
            </button>
          </form>
        </section>

        <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
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

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
              >
                Save household profile
              </button>
            </form>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Create or join a workspace to set a household nickname.
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6 xl:col-span-2">
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
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Send invite
                    </button>
                  </div>
                </form>

                {pendingInvites.length > 0 ? (
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => (
                      <InviteCard key={invite.id} invite={invite} />
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
                Only owners can send or review invites.
              </div>
            )
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Create or join a workspace before inviting anyone.
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6 xl:col-span-2">
          <div className="border-b border-slate-900/8 pb-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-950">
                Household settings
              </h2>
              {session.currentWorkspace ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {session.currentWorkspace.memberRole}
                </span>
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

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Save household settings
                </button>
                <Link
                  href="/app/settings/categories"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                >
                  Manage categories
                </Link>
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
                  Only owners can edit household settings.
                </div>
              </div>
            )
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Create or join a workspace to manage household settings.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InviteCard({ invite }: { invite: WorkspaceInviteSummary }) {
  const joinPath = `/join/${invite.token}`;

  return (
    <article className="rounded-[1.5rem] border border-slate-900/8 bg-slate-50 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{invite.email}</p>
          <p className="mt-1 text-xs text-slate-500">
            {invite.role} · expires {formatInviteDate(invite.expiresAt)}
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {invite.status}
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-600">
        {joinPath}
      </div>

      <div className="mt-3 flex justify-end">
        <Link
          href={joinPath}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
        >
          Open invite link
        </Link>
      </div>
    </article>
  );
}
