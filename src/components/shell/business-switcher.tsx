"use client";

import Link from "next/link";
import { ChevronsUpDown, Plus, Sparkles } from "lucide-react";
import { useBusiness } from "@/providers/business-provider";
import { useLocale } from "@/providers/locale-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Sidebar header: shows the current business and, when the person belongs
 * to more than one, lets them switch (Frontend Playbook — "Business
 * selector (multi-business support)"). Collapses to just the brand mark
 * when the sidebar itself is collapsed.
 */
export function BusinessSwitcher({ collapsed }: { collapsed: boolean }) {
  const { memberships, current, switchTo } = useBusiness();
  const { t } = useLocale();

  const trigger = (
    <button
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-sidebar-accent",
        collapsed && "justify-center px-0"
      )}
    >
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Sparkles className="size-4" />
      </div>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-sidebar-foreground">
            {current?.business.name ?? "Business AI Manager"}
          </span>
          {memberships.length > 1 ? (
            <ChevronsUpDown className="size-3.5 shrink-0 text-sidebar-foreground/50" />
          ) : null}
        </>
      )}
    </button>
  );

  if (memberships.length <= 1 && !collapsed) {
    // Nothing to switch to yet — just show the brand/business name, no menu.
    return <div className="flex h-14 items-center px-4">{trigger}</div>;
  }

  return (
    <div className="flex h-14 items-center px-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>{t.business.switch_business}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {memberships.map((m) => (
            <DropdownMenuItem
              key={m.business.id}
              className={m.business.id === current?.business.id ? "bg-accent" : undefined}
              onClick={() => switchTo(m.business.id)}
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{m.business.name}</span>
                <span className="text-xs text-muted-foreground">{m.roleName}</span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/onboarding">
              <Plus className="size-4" /> {t.business.add_business}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
