"use client";

import * as React from "react";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "bam-sidebar-collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // One-time reconciliation with a browser-only API (localStorage) that
    // cannot be read during SSR — an effect is the correct place for this,
    // not a "you might not need an effect" case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "1") setCollapsed(true);
  }, []);

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({ collapsed, toggle, mobileOpen, setMobileOpen }),
    [collapsed, toggle, mobileOpen]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}
