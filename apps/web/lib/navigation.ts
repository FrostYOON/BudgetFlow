export interface AppNavigationItem {
  href: string;
  label: string;
  description: string;
}

export const APP_NAVIGATION: AppNavigationItem[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    description: "Monthly overview and insights",
  },
  {
    href: "/app/transactions",
    label: "Transactions",
    description: "Shared and personal money movement",
  },
  {
    href: "/app/budgets",
    label: "Budgets",
    description: "Monthly envelope and category planning",
  },
  {
    href: "/app/recurring",
    label: "Recurring",
    description: "Automation and execution monitoring",
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Account and household profile",
  },
];
