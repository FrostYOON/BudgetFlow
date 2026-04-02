import {
  ArrowLeftRight,
  Bell,
  LayoutDashboard,
  Menu,
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

export const APP_SIDEBAR_PRIMARY_NAVIGATION: AppNavigationItem[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    description: "Month overview",
    shortLabel: "Home",
    icon: LayoutDashboard,
    matchers: ["/app/dashboard"],
  },
  {
    href: "/app/transactions",
    label: "Transactions",
    description: "Daily entries",
    shortLabel: "Spend",
    icon: Wallet,
    matchers: ["/app/transactions"],
  },
  {
    href: "/app/settlements",
    label: "Settlements",
    description: "Shared balances",
    shortLabel: "Settle",
    icon: ArrowLeftRight,
    matchers: ["/app/settlements"],
  },
  {
    href: "/app/budgets",
    label: "Budgets",
    description: "Monthly plan",
    shortLabel: "Plan",
    icon: PiggyBank,
    matchers: ["/app/budgets"],
  },
];

export const APP_SIDEBAR_UTILITY_NAVIGATION: AppNavigationItem[] = [
  {
    href: "/app/recurring",
    label: "Recurring",
    description: "Scheduled entries",
    shortLabel: "Auto",
    icon: Repeat2,
    matchers: ["/app/recurring"],
  },
  {
    href: "/app/notifications",
    label: "Notifications",
    description: "Unread updates",
    shortLabel: "Alerts",
    icon: Bell,
    matchers: ["/app/notifications"],
  },
  {
    href: "/app/settings",
    label: "Settings",
    description: "Account and workspace",
    shortLabel: "You",
    icon: Settings,
    matchers: ["/app/settings"],
  },
];

export const APP_SIDEBAR_NAVIGATION: AppNavigationItem[] = [
  ...APP_SIDEBAR_PRIMARY_NAVIGATION,
  ...APP_SIDEBAR_UTILITY_NAVIGATION,
];

export const APP_MOBILE_NAVIGATION: AppNavigationItem[] = [
  APP_SIDEBAR_PRIMARY_NAVIGATION[0],
  APP_SIDEBAR_PRIMARY_NAVIGATION[1],
  APP_SIDEBAR_PRIMARY_NAVIGATION[3],
  {
    href: "/app/more",
    label: "Manage",
    description: "Settings and tools",
    shortLabel: "Manage",
    icon: Menu,
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
