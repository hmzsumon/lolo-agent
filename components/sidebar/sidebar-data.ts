// Central place to edit menu items
import type { LucideIcon } from "lucide-react";
import {
  Clock4,
  Download,
  Grid2x2,
  LifeBuoy,
  MessageSquare,
  Settings,
  SquareGanttChart,
  Upload,
  Users,
  Wallet,
} from "lucide-react";

export type NavChild = { label: string; sublabel?: string; href: string };
export type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: "new" | number;
  children?: NavChild[];
  section?: "default" | "bottom";
};

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: Grid2x2, href: "/dashboard" },
  { key: "users", label: "All Users", icon: Users, href: "/users" },

  {
    key: "deposits",
    label: "Deposits",
    icon: Download,

    children: [
      { label: "All Deposits", href: "/deposits/all" },
      {
        label: "Manual Deposits",
        href: "/deposits/manual",
      },
    ],
  },

  {
    key: "withdraw",
    label: "Withdrawals",
    icon: Upload,

    children: [
      { label: "All Withdrawals", href: "/withdrawals/all" },
      {
        label: "Pending Withdrawals",
        href: "/withdrawals/pending",
      },
    ],
  },

  {
    key: "wallet",
    label: "Wallet",
    icon: Wallet,

    children: [
      { label: "Add Payment Method", href: "/wallet/add-payment-method" },
      {
        label: "My Payment Methods",
        href: "/wallet/my-payment-methods",
      },
    ],
  },
  {
    key: "rewards",
    label: "Rewards",
    icon: Wallet,
    children: [{ label: "Grant Reward", href: "/rewards/grant" }],
  },
  {
    key: "history",
    label: "Transaction history",
    icon: Clock4,
    href: "/dashboard/history",
  },

  {
    key: "settings",
    label: "Settings",
    icon: Settings,

    children: [
      { label: "Profile", href: "/settings/profile" },
      {
        label: "Security",
        href: "/settings/security",
      },
    ],
  },

  {
    key: "chat",
    label: "Live Chat",
    icon: MessageSquare,
    href: "/dashboard/chat",
    section: "bottom",
  },
  {
    key: "support",
    label: "Support",
    icon: LifeBuoy,
    href: "/dashboard/support",
  },
];

export const INVITE_CARD = {
  title: "Invite friends and earn money",
  icon: SquareGanttChart,
  href: "/dashboard/referrals",
};
