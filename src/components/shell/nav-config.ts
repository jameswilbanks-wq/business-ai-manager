import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  ShoppingCart,
  Package,
  Warehouse,
  Truck,
  ListChecks,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";

/**
 * Primary navigation is domain-based, not page-based (Frontend Playbook —
 * "Navigation Strategy"). Each entry maps 1:1 to a feature module under
 * src/features/. `labelKey` resolves through the i18n dictionary at
 * src/lib/i18n/dictionaries/{locale}.json under the "nav" namespace.
 */
export interface NavItem {
  labelKey: keyof typeof import("@/lib/i18n/dictionaries/es.json")["nav"];
  href: string;
  icon: LucideIcon;
}

export const primaryNav: NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "communication", href: "/communication", icon: MessageCircle },
  { labelKey: "customers", href: "/customers", icon: Users },
  { labelKey: "orders", href: "/orders", icon: ShoppingCart },
  { labelKey: "products", href: "/products", icon: Package },
  { labelKey: "inventory", href: "/inventory", icon: Warehouse },
  { labelKey: "suppliers", href: "/suppliers", icon: Truck },
  { labelKey: "tasks", href: "/tasks", icon: ListChecks },
  { labelKey: "analytics", href: "/analytics", icon: BarChart3 },
  { labelKey: "ai", href: "/ai", icon: Sparkles },
];

export const secondaryNav: NavItem[] = [
  { labelKey: "settings", href: "/settings", icon: Settings },
];

/** Mobile bottom nav shows a curated subset — full list lives in the drawer. */
export const mobileNavPrimary: NavItem[] = [
  primaryNav[0],
  primaryNav[1],
  primaryNav[2],
  primaryNav[3],
];
