"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { primaryNav } from "@/components/shell/nav-config";
import { useLocale } from "@/providers/locale-provider";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Global command palette (Frontend Playbook — "Universal Command Palette").
 * M1 wires navigation only; "create order", "ask AI", etc. attach to their
 * feature modules as those milestones land.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { t } = useLocale();

  const go = React.useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t.shell.search_placeholder} />
      <CommandList>
        <CommandEmpty>—</CommandEmpty>
        <CommandGroup heading={t.nav.dashboard}>
          {primaryNav.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              <item.icon />
              <span>{t.nav[item.labelKey]}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/** Trigger button shown in the topbar search field. */
export function CommandPaletteTrigger({ onOpen }: { onOpen: () => void }) {
  const { t } = useLocale();
  return (
    <button
      onClick={onOpen}
      className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent/50"
    >
      <Search className="size-4" />
      <span className="truncate">{t.shell.search_placeholder}</span>
      <CommandShortcut className="ml-auto hidden items-center gap-0.5 sm:flex">
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">⌘</kbd>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">K</kbd>
      </CommandShortcut>
    </button>
  );
}
