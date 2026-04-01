import {
  ArrowLeftRight,
  Bell,
  LayoutDashboard,
  PiggyBank,
  Repeat2,
  Settings,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AppNavigationItem {
  href: string;
  label: string;
  description: string;
  shortLabel: string;
  icon: LucideIcon;
  matchers?: string[];
}

export const APP_SIDEBAR_NAVIGATION: AppNavigationItem[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    description: "Overview and month health",
    shortLabel: "Home",
    icon: LayoutDashboard,
    matchers: ["/app/dashboard"],
  },
  {
    href: "/app/transactions",
    label: "Transactions",
    description: "Daily money movement",
    shortLabel: "Spend",
    icon: Wallet,
    matchers: ["/app/transactions"],
  },
  {
    href: "/app/settlements",
    label: "Settlements",
    description: "Shared balances and transfers",
    shortLabel: "Settle",
    icon: ArrowLeftRight,
    matchers: ["/app/settlements"],
  },
  {
    href: "/app/budgets",
    label: "Budgets",
    description: "Monthly plan and targets",
    shortLabel: "Plan",
    icon: PiggyBank,
    matchers: ["/app/budgets"],
  },
  {
    href: "/app/recurring",
    label: "Recurring",
    description: "Automation and run history",
    shortLabel: "Auto",
    icon: Repeat2,
    matchers: ["/app/recurring"],
  },
  {
    href: "/app/notifications",
    label: "Notifications",
    description: "Alerts and household updates",
    shortLabel: "Alerts",
    icon: Bell,
    matchers: ["/app/notifications"],
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Account and workspace setup",
    shortLabel: "You",
    icon: Settings,
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
    description: "Secondary tools and management",
    shortLabel: "More",
    icon: Settings,
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

export function getActiveMobileNavigationIndex(pathname: string) {
  return APP_MOBILE_NAVIGATION.findIndex((item) =>
    isNavigationItemActive(pathname, item),
  );
}

export function isNavigationItemActive(
  pathname: string,
  item: AppNavigationItem,
) {
  const matchers = item.matchers ?? [item.href];

  return matchers.some((matcher) => {
    return pathname === matcher || pathname.startsWith(`${matcher}/`);
  });
}
