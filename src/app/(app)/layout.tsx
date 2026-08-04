import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getCurrentUser } from "@/features/identity/api/get-current-user";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  // Proxy already redirects unauthenticated requests before they reach
  // this layout — this check is defense in depth (Engineering Handbook:
  // "Never trust client input"), not the primary guard.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const displayName = user.profile?.displayName ?? undefined;

  return (
    <AppShell userName={displayName} userEmail={user.email ?? undefined}>
      {children}
    </AppShell>
  );
}
