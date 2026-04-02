import type { WorkspaceType } from "@/lib/workspaces";

export const ALL_WORKSPACE_TYPE_OPTIONS: Array<{
  value: WorkspaceType;
  label: string;
  description?: string;
}> = [
  {
    value: "PERSONAL",
    label: "Personal",
    description: "Private budgeting, goals, and daily spending",
  },
  {
    value: "COUPLE",
    label: "Couple",
    description: "Shared home, date nights, everyday bills",
  },
  {
    value: "FAMILY",
    label: "Family",
    description: "Household spending, school, groceries, utilities",
  },
  {
    value: "ROOMMATE",
    label: "Roommate",
    description: "Rent, shared supplies, split living costs",
  },
];

export const SHARED_WORKSPACE_TYPE_OPTIONS = ALL_WORKSPACE_TYPE_OPTIONS.filter(
  (option) => option.value !== "PERSONAL",
);
