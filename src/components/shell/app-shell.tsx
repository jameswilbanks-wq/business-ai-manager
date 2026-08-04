import * as React from "react";
import { SidebarProvider } from "@/components/shell/sidebar-context";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { MobileBottomNav } from "@/components/shell/mobile-nav";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

/**
 * The permanent application shell (Frontend Playbook — "Application Shell").
 * Persists across every authenticated route; only the content area swaps.
 */
export function AppShell({ children, userName, userEmail }: AppShellProps) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar userName={userName} userEmail={userEmail} />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <div className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
