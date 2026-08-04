"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EmptyState } from "@/components/shared/empty-state";
import { useLocale } from "@/providers/locale-provider";

/**
 * Placeholder for M1. Wired to the real Notification domain in a future
 * milestone (see Architecture Playbook — Notifications domain). The trigger,
 * layout, and empty state are final; only the data source is pending.
 */
export function NotificationCenter() {
  const { t } = useLocale();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t.shell.notifications} className="relative">
          <Bell className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">{t.shell.notifications}</p>
        </div>
        <div className="p-4">
          <EmptyState
            icon={<Bell />}
            title={t.shell.no_notifications}
            className="border-none py-6"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
