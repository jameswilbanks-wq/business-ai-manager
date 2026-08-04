import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { BusinessProvider } from "@/providers/business-provider";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { getUserBusinesses } from "@/features/identity/api/get-user-businesses";
import { currentBusinessCookieName } from "@/lib/business-context";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  // Proxy/Middleware isn't available on this deployment target (see
  // src/middleware/README.md) — this check is the primary guard here, not
  // defense in depth.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const memberships = await getUserBusinesses();
  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const cookieStore = await cookies();
  const currentBusinessId = cookieStore.get(currentBusinessCookieName)?.value ?? null;

  const displayName = user.profile?.displayName ?? undefined;

  return (
    <BusinessProvider memberships={memberships} currentBusinessId={currentBusinessId}>
      <AppShell userName={displayName} userEmail={user.email ?? undefined}>
        {children}
      </AppShell>
    </BusinessProvider>
  );
}
