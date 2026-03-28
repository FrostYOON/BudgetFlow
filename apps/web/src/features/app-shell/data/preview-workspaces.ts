export interface PreviewWorkspace {
  id: string;
  name: string;
  roleLabel: string;
  memberLabel: string;
  budgetLabel: string;
  summary: string;
}

export const PREVIEW_WORKSPACES: PreviewWorkspace[] = [
  {
    id: "couple-home",
    name: "Juno & Min Home",
    roleLabel: "Owner",
    memberLabel: "2 active members",
    budgetLabel: "March budget CAD 3,200",
    summary: "Shared household budget with monthly groceries, rent, and bills.",
  },
  {
    id: "family-hq",
    name: "Family HQ",
    roleLabel: "Owner",
    memberLabel: "4 active members",
    budgetLabel: "March budget CAD 5,850",
    summary:
      "Family-focused workspace with school, food, and subscription costs.",
  },
  {
    id: "roommates-hub",
    name: "Roommates Hub",
    roleLabel: "Member",
    memberLabel: "3 active members",
    budgetLabel: "March budget CAD 2,450",
    summary:
      "Rent split, utility tracking, and recurring shared apartment expenses.",
  },
];
