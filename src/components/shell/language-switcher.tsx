"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/providers/locale-provider";
import { locales, localeLabels } from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t.shell.language}>
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLocale(code)}
            className={locale === code ? "font-medium text-primary" : undefined}
          >
            {localeLabels[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
