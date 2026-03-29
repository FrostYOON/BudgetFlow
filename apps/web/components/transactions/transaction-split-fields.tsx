"use client";

import { useMemo, useState } from "react";
import type { WorkspaceMemberSummary } from "@/lib/settings";
import type { TransactionCategory } from "@/lib/transactions";

type SplitMode = "EQUAL" | "FIXED";

type ParticipantEntry = {
  userId: string;
  shareValue: string;
};

function buildDefaultParticipants(
  members: WorkspaceMemberSummary[],
  defaultParticipants?: {
    userId: string;
    shareType: "EQUAL" | "FIXED" | "PERCENTAGE";
    shareValue: string | null;
  }[],
) {
  if (defaultParticipants && defaultParticipants.length > 0) {
    return members.map((member) => {
      const matched = defaultParticipants.find(
        (participant) => participant.userId === member.userId,
      );

      return {
        userId: member.userId,
        shareValue: matched?.shareValue ?? "",
      };
    });
  }

  return members.map((member) => ({
    userId: member.userId,
    shareValue: "",
  }));
}

export function TransactionSplitFields({
  categories,
  categoryName = "categoryId",
  defaultMode = "EQUAL",
  defaultCategoryId,
  defaultParticipants,
  defaultType,
  defaultVisibility = "SHARED",
  members,
  showTypeControl = true,
}: {
  categories: TransactionCategory[];
  categoryName?: string;
  defaultMode?: SplitMode;
  defaultCategoryId?: string | null;
  defaultParticipants?: {
    userId: string;
    shareType: "EQUAL" | "FIXED" | "PERCENTAGE";
    shareValue: string | null;
  }[];
  defaultType: "INCOME" | "EXPENSE";
  defaultVisibility?: "SHARED" | "PERSONAL";
  members: WorkspaceMemberSummary[];
  showTypeControl?: boolean;
}) {
  const [type, setType] = useState<"INCOME" | "EXPENSE">(defaultType);
  const [visibility, setVisibility] = useState<"SHARED" | "PERSONAL">(
    defaultVisibility,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    defaultCategoryId ?? "",
  );
  const [splitMode, setSplitMode] = useState<SplitMode>(defaultMode);
  const [participants, setParticipants] = useState<ParticipantEntry[]>(
    buildDefaultParticipants(members, defaultParticipants),
  );

  const isSharedExpense = visibility === "SHARED" && type === "EXPENSE";
  const filteredCategories = categories.filter((category) => category.type === type);

  const serializedParticipants = useMemo(() => {
    if (!isSharedExpense) {
      return "[]";
    }

    return JSON.stringify(
      participants.map((participant) => ({
        userId: participant.userId,
        shareType: splitMode,
        ...(splitMode === "FIXED" && participant.shareValue.trim().length > 0
          ? { shareValue: participant.shareValue.trim() }
          : {}),
      })),
    );
  }, [isSharedExpense, participants, splitMode]);

  return (
    <div className="space-y-4">
      <input type="hidden" name="splitParticipants" value={serializedParticipants} />

      <div className="grid gap-4 sm:grid-cols-2">
        {showTypeControl ? (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <select
              name="type"
              value={type}
              onChange={(event) => {
                const nextType = event.target.value as "INCOME" | "EXPENSE";
                setType(nextType);
                if (
                  selectedCategoryId &&
                  !categories.some(
                    (category) =>
                      category.id === selectedCategoryId &&
                      category.type === nextType,
                  )
                ) {
                  setSelectedCategoryId("");
                }
              }}
              className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </label>
        ) : (
          <input type="hidden" name="type" value={type} />
        )}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Visibility</span>
          <select
            name="visibility"
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as "SHARED" | "PERSONAL")
            }
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          >
            <option value="SHARED">Shared</option>
            <option value="PERSONAL">Personal</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Category</span>
        <select
          name={categoryName}
          value={selectedCategoryId}
          onChange={(event) => setSelectedCategoryId(event.target.value)}
          className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
        >
          <option value="">No category</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      {isSharedExpense ? (
        <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/70 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Split</p>
              <p className="mt-1 text-xs text-slate-500">
                Shared expenses can be split equally or with fixed amounts.
              </p>
            </div>

            <div className="flex rounded-full bg-white p-1 shadow-sm">
              {(["EQUAL", "FIXED"] as SplitMode[]).map((mode) => {
                const active = splitMode === mode;

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSplitMode(mode)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-emerald-500 text-slate-950"
                        : "text-slate-500"
                    }`}
                  >
                    {mode === "EQUAL" ? "Equal" : "Custom"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {members.map((member, index) => (
              <div
                key={member.userId}
                className="grid items-center gap-3 rounded-[1rem] bg-white px-3 py-3 sm:grid-cols-[minmax(0,1fr)_140px]"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {member.nickname ?? member.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {member.role}
                  </p>
                </div>

                {splitMode === "FIXED" ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={participants[index]?.shareValue ?? ""}
                    onChange={(event) => {
                      const next = [...participants];
                      next[index] = {
                        userId: member.userId,
                        shareValue: event.target.value,
                      };
                      setParticipants(next);
                    }}
                    className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
                    placeholder="0.00"
                  />
                ) : (
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-sm font-medium text-slate-500">
                    Equal share
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
