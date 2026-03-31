export interface AppNavigationItem {
  href: string;
  label: string;
  description: string;
  shortLabel: string;
  matchers?: string[];
}

export const APP_SIDEBAR_NAVIGATION: AppNavigationItem[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    description: "Monthly overview and insights",
    shortLabel: "Home",
    matchers: ["/app/dashboard"],
  },
  {
    href: "/app/transactions",
    label: "Transactions",
    description: "Shared and personal money movement",
    shortLabel: "Spend",
    matchers: ["/app/transactions"],
  },
  {
    href: "/app/settlements",
    label: "Settlements",
    description: "Shared balances and suggested transfers",
    shortLabel: "Settle",
    matchers: ["/app/settlements"],
  },
  {
    href: "/app/budgets",
    label: "Budgets",
    description: "Monthly envelope and category planning",
    shortLabel: "Plan",
    matchers: ["/app/budgets"],
  },
  {
    href: "/app/recurring",
    label: "Recurring",
    description: "Automation and execution monitoring",
    shortLabel: "Auto",
    matchers: ["/app/recurring"],
  },
  {
    href: "/app/notifications",
    label: "Notifications",
    description: "Budget, settlement, and recurring updates",
    shortLabel: "Alerts",
    matchers: ["/app/notifications"],
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Account and workspace profile",
    shortLabel: "You",
    matchers: ["/app/settings"],
  },
];

export const APP_MOBILE_NAVIGATION: AppNavigationItem[] = [
  APP_SIDEBAR_NAVIGATION[0],
  APP_SIDEBAR_NAVIGATION[1],
  APP_SIDEBAR_NAVIGATION[3],
  {
    href: "/app/more",
    label: "More",
    description: "Settlements, reports, alerts, and settings",
    shortLabel: "More",
    matchers: [
      "/app/more",
      "/app/settlements",
      "/app/reports",
      "/app/recurring",
      "/app/notifications",
      "/app/settings",
      "/app/onboarding",
    ],
  },
];

export function isNavigationItemActive(
  pathname: string,
  item: AppNavigationItem,
) {
  const matchers = item.matchers ?? [item.href];

  return matchers.some((matcher) => {
    return pathname === matcher || pathname.startsWith(`${matcher}/`);
  });
}
