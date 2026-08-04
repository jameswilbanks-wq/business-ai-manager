"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { BusinessMembership } from "@/features/identity/types/business";
import { switchBusinessAction } from "@/features/identity/api/business-actions";

interface BusinessContextValue {
  memberships: BusinessMembership[];
  current: BusinessMembership | null;
  switchTo: (businessId: string) => Promise<void>;
}

const BusinessContext = React.createContext<BusinessContextValue | null>(null);

/**
 * Server-resolved business list + "current business" (from a cookie, set
 * by (app)/layout.tsx) hydrated into a client context so the switcher and
 * any future business-scoped UI can read/change it without prop drilling.
 */
export function BusinessProvider({
  memberships,
  currentBusinessId,
  children,
}: {
  memberships: BusinessMembership[];
  currentBusinessId: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const current = React.useMemo(
    () => memberships.find((m) => m.business.id === currentBusinessId) ?? memberships[0] ?? null,
    [memberships, currentBusinessId]
  );

  const switchTo = React.useCallback(
    async (businessId: string) => {
      await switchBusinessAction(businessId);
      router.refresh();
    },
    [router]
  );

  const value = React.useMemo(
    () => ({ memberships, current, switchTo }),
    [memberships, current, switchTo]
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  const ctx = React.useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used within a BusinessProvider");
  return ctx;
}
