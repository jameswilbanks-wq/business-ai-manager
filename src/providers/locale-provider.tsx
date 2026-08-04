"use client";

import * as React from "react";
import {
  type Locale,
  defaultLocale,
  isLocale,
  localeCookieName,
} from "@/lib/i18n/config";
import es from "@/lib/i18n/dictionaries/es.json";
import en from "@/lib/i18n/dictionaries/en.json";

type Dictionary = typeof es;

const dictionaries: Record<Locale, Dictionary> = { es, en };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${localeCookieName}=`));
  const value = match?.split("=")[1];
  return isLocale(value) ? value : defaultLocale;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(defaultLocale);

  // Reconcile with the persisted cookie after mount (avoids SSR/client
  // mismatch — the cookie is a browser-only read, so this must run in an
  // effect rather than during render).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(readInitialLocale());
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${localeCookieName}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
  }, []);

  const value = React.useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}
