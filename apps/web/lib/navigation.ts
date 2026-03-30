export interface AppNavigationItem {
  href: string;
  label: string;
  description: string;
  shortLabel: string;
}

export const APP_NAVIGATION: AppNavigationItem[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    description: "Monthly overview and insights",
    shortLabel: "Home",
  },
  {
    href: "/app/transactions",
    label: "Transactions",
    description: "Shared and personal money movement",
    shortLabel: "Spend",
  },
  {
    href: "/app/settlements",
    label: "Settlements",
    description: "Shared balances and suggested transfers",
    shortLabel: "Settle",
  },
  {
    href: "/app/budgets",
    label: "Budgets",
    description: "Monthly envelope and category planning",
    shortLabel: "Plan",
  },
  {
    href: "/app/recurring",
    label: "Recurring",
    description: "Automation and execution monitoring",
    shortLabel: "Auto",
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Account and workspace profile",
    shortLabel: "You",
  },
];
