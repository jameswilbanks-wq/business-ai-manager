"use client";

import * as React from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

/**
 * Single composition root for every cross-cutting client provider.
 * Order matters: theme first (affects paint), then data layer, then locale,
 * then UI-level providers (tooltip delay group, toast portal).
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <LocaleProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster />
          </TooltipProvider>
        </LocaleProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
