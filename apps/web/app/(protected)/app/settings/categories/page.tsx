import { redirect } from "next/navigation";
import {
  Reveal,
  StaggerItem,
  StaggerReveal,
} from "@/components/motion/reveal";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import {
  fetchWorkspaceCategoriesForSettings,
  type CategoryType,
  type WorkspaceCategory,
} from "@/lib/categories";

function groupCategories(categories: WorkspaceCategory[], type: CategoryType) {
  const filtered = categories.filter((category) => category.type === type);

  return {
    active: filtered.filter((category) => !category.isArchived),
    archived: filtered.filter((category) => category.isArchived),
  };
}

function normalizeEditValue(value?: string | null) {
  return value && value.length > 0 ? value : null;
}

function CategoryForm({
  action,
  category,
  submitLabel,
  workspaceId,
}: {
  action: string;
  category?: WorkspaceCategory | null;
  submitLabel: string;
  workspaceId: string;
}) {
  return (
    <form action={action} method="post" className="space-y-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      {category ? (
        <input type="hidden" name="categoryId" value={category.id} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            name="name"
            type="text"
            required
            defaultValue={category?.name ?? ""}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Type</span>
          <select
            name="type"
            defaultValue={category?.type ?? "EXPENSE"}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Color</span>
          <input
            name="color"
            type="text"
            defaultValue={normalizeEditValue(category?.color) ?? ""}
            placeholder="#4E8B57"
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Icon</span>
          <input
            name="icon"
            type="text"
            defaultValue={normalizeEditValue(category?.icon) ?? ""}
            placeholder="cart"
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Sort order</span>
          <input
            name="sortOrder"
            type="number"
            min="0"
            step="1"
            defaultValue={category?.sortOrder ?? 0}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          />
        </label>
      </div>

      <AppButton type="submit" className="w-full">
        {submitLabel}
      </AppButton>
    </form>
  );
}

function CategoryRow({
  category,
  isFirst,
  isLast,
  workspaceId,
}: {
  category: WorkspaceCategory;
  isFirst: boolean;
  isLast: boolean;
  workspaceId: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-slate-900/8 bg-slate-50 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-950">
              {category.name}
            </p>
            {category.isDefault ? (
              <AppBadge
                tone="success"
                className="px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]"
              >
                Starter
              </AppBadge>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {category.type} · order {category.sortOrder}
            {category.icon ? ` · ${category.icon}` : ""}
          </p>
        </div>
        {category.color ? (
          <span
            className="h-5 w-5 rounded-full border border-slate-200"
            style={{ backgroundColor: category.color }}
          />
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <form action="/app/settings/categories/reorder" method="post">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="categoryId" value={category.id} />
          <input type="hidden" name="direction" value="up" />
          <AppButton type="submit" tone="secondary" size="sm" disabled={isFirst}>
            Up
          </AppButton>
        </form>
        <form action="/app/settings/categories/reorder" method="post">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="categoryId" value={category.id} />
          <input type="hidden" name="direction" value="down" />
          <AppButton type="submit" tone="secondary" size="sm" disabled={isLast}>
            Down
          </AppButton>
        </form>
        <AppButtonLink
          href={`/app/settings/categories?edit=${category.id}`}
          tone="secondary"
          size="sm"
        >
          Edit
        </AppButtonLink>
        {!category.isArchived ? (
          <form action="/app/settings/categories/archive" method="post">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="categoryId" value={category.id} />
            <AppButton type="submit" tone="danger" size="sm">
              Archive
            </AppButton>
          </form>
        ) : (
          <form action="/app/settings/categories/unarchive" method="post">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="categoryId" value={category.id} />
            <AppButton type="submit" tone="success" size="sm">
              Restore
            </AppButton>
          </form>
        )}
      </div>
    </article>
  );
}

export default async function CategorySettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!session.currentWorkspace) {
    redirect("/app/onboarding");
  }

  const params = await searchParams;
  const categories = await fetchWorkspaceCategoriesForSettings({
    accessToken: session.accessToken,
    workspaceId: session.currentWorkspace.id,
    includeArchived: true,
  });
  const editCategory =
    categories.find((category) => category.id === params.edit) ?? null;
  const expense = groupCategories(categories, "EXPENSE");
  const income = groupCategories(categories, "INCOME");

  return (
    <div className="space-y-6">
      <Reveal delay={0.02}>
        <AppSurface padding="md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Categories
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {session.currentWorkspace.name}
            </h1>
          </div>
          <AppButtonLink
            href="/app/settings"
            tone="secondary"
            size="sm"
          >
            Back
          </AppButtonLink>
        </div>
        </AppSurface>
      </Reveal>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Reveal delay={0.06}>
          <AppSurface as="div" padding="md">
          <div className="border-b border-slate-900/8 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">
              {editCategory ? "Edit category" : "New category"}
            </h2>
          </div>

          <div className="mt-5">
            <CategoryForm
              action={
                editCategory
                  ? "/app/settings/categories/update"
                  : "/app/settings/categories/create"
              }
              category={editCategory}
              submitLabel={editCategory ? "Save category" : "Add category"}
              workspaceId={session.currentWorkspace.id}
            />

            {editCategory ? (
              <AppButtonLink
                href="/app/settings/categories"
                tone="secondary"
                className="mt-3 w-full"
              >
                Cancel edit
              </AppButtonLink>
            ) : null}
          </div>
          </AppSurface>
        </Reveal>

        <div className="space-y-6">
          <Reveal delay={0.1}>
            <AppSurface padding="md">
            <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
              <h2 className="text-lg font-semibold text-slate-950">
                Expense categories
              </h2>
              <AppBadge tone="subtle">
                {expense.active.length}
              </AppBadge>
            </div>

              <StaggerReveal className="mt-5 space-y-3">
                {expense.active.map((category, index) => (
                  <StaggerItem key={category.id}>
                    <CategoryRow
                      category={category}
                      isFirst={index === 0}
                      isLast={index === expense.active.length - 1}
                      workspaceId={session.currentWorkspace!.id}
                    />
                  </StaggerItem>
                ))}
              </StaggerReveal>
            </AppSurface>
          </Reveal>

          <Reveal delay={0.14}>
            <AppSurface padding="md">
            <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
              <h2 className="text-lg font-semibold text-slate-950">
                Income categories
              </h2>
              <AppBadge tone="subtle">
                {income.active.length}
              </AppBadge>
            </div>

              <StaggerReveal className="mt-5 space-y-3">
                {income.active.map((category, index) => (
                  <StaggerItem key={category.id}>
                    <CategoryRow
                      category={category}
                      isFirst={index === 0}
                      isLast={index === income.active.length - 1}
                      workspaceId={session.currentWorkspace!.id}
                    />
                  </StaggerItem>
                ))}
              </StaggerReveal>
            </AppSurface>
          </Reveal>

          {expense.archived.length + income.archived.length > 0 ? (
            <Reveal delay={0.18}>
              <AppSurface padding="md">
              <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
                <h2 className="text-lg font-semibold text-slate-950">
                  Archived
                </h2>
                <AppBadge tone="subtle">
                  {expense.archived.length + income.archived.length}
                </AppBadge>
              </div>

                <StaggerReveal className="mt-5 space-y-3">
                  {[...expense.archived, ...income.archived].map((category, index, all) => (
                    <StaggerItem key={category.id}>
                      <CategoryRow
                        category={category}
                        isFirst={index === 0}
                        isLast={index === all.length - 1}
                        workspaceId={session.currentWorkspace!.id}
                      />
                    </StaggerItem>
                  ))}
                </StaggerReveal>
              </AppSurface>
            </Reveal>
          ) : null}
        </div>
      </section>
    </div>
  );
}
