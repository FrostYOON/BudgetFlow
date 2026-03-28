import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";
import { fetchWorkspaceMembers } from "@/lib/settings";

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
            <p className="mt-1 text-sm text-slate-500">
              Name, locale, timezone, and optional profile image URL.
            </p>
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
            <h2 className="text-lg font-semibold text-slate-950">
              Household profile
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Workspace-specific nickname and current role.
            </p>
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
                  placeholder="How this household sees you"
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
      </div>
    </div>
  );
}
