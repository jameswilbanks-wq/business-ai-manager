"use client";

import * as React from "react";
import { CommandPalette, CommandPaletteTrigger } from "@/components/shell/command-palette";
import { NotificationCenter } from "@/components/shell/notification-center";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { UserMenu } from "@/components/shell/user-menu";
import { Separator } from "@/components/ui/separator";

interface TopbarProps {
  userName?: string;
  userEmail?: string;
}

/** Persistent top bar: global search / command palette, and account controls. */
export function Topbar({ userName, userEmail }: TopbarProps) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <div className="flex flex-1 items-center">
        <CommandPaletteTrigger onOpen={() => setPaletteOpen(true)} />
      </div>

      <div className="flex items-center gap-1">
        <NotificationCenter />
        <ThemeToggle />
        <LanguageSwitcher />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <UserMenu name={userName} email={userEmail} />
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
