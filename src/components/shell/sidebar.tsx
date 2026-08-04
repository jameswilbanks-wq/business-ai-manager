"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { primaryNav, secondaryNav } from "@/components/shell/nav-config";
import { useSidebar } from "@/components/shell/sidebar-context";
import { useLocale } from "@/providers/locale-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function NavLink({
  href,
  icon: Icon,
  label,
  collapsed,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
  active: boolean;
}) {
  const link = (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className={cn("size-4.5 shrink-0", active && "text-sidebar-primary")} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

/** Persistent desktop sidebar. Collapses to icon rail; state persists locally. */
export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 px-4", collapsed && "justify-center px-0")}>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-sidebar-foreground">
            {t.app.name}
          </span>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {primaryNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={t.nav[item.labelKey]}
            collapsed={collapsed}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-sidebar-border px-3 py-2">
        {secondaryNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={t.nav[item.labelKey]}
            collapsed={collapsed}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
          />
        ))}
        <button
          onClick={toggle}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <PanelLeftOpen className="size-4.5" /> : <PanelLeftClose className="size-4.5" />}
          {!collapsed && <span>{t.shell.collapse_sidebar}</span>}
        </button>
      </div>
    </aside>
  );
}
