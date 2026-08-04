"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/providers/locale-provider";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { t } = useLocale();
  const [mounted, setMounted] = React.useState(false);
  // Standard next-themes mount guard: the resolved theme is only known
  // client-side, so we render a neutral icon until after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t.shell.theme}>
          {mounted && theme === "dark" ? (
            <Moon className="size-4" />
          ) : mounted && theme === "light" ? (
            <Sun className="size-4" />
          ) : (
            <Monitor className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="size-4" /> {t.shell.theme_light}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="size-4" /> {t.shell.theme_dark}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="size-4" /> {t.shell.theme_system}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
