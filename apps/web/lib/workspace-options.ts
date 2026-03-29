import type { WorkspaceType } from "@/lib/workspaces";

export const WORKSPACE_TYPE_OPTIONS: Array<{
  value: WorkspaceType;
  label: string;
  description?: string;
}> = [
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
