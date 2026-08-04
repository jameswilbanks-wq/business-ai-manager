"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mobileNavPrimary,
  primaryNav,
  secondaryNav,
} from "@/components/shell/nav-config";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useLocale } from "@/providers/locale-provider";

/** Bottom tab bar — the primary mobile navigation surface (thumb reach). */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card/95 backdrop-blur md:hidden [padding-bottom:env(safe-area-inset-bottom)]">
      {mobileNavPrimary.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="size-5" />
            {t.nav[item.labelKey]}
          </Link>
        );
      })}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <button className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground">
            <Menu className="size-5" />
            {t.shell.more}
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> {t.app.name}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-1 overflow-y-auto px-4 pb-8">
            {[...primaryNav, ...secondaryNav].map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active ? "bg-accent text-accent-foreground" : "text-foreground"
                  )}
                >
                  <item.icon className="size-4.5" />
                  {t.nav[item.labelKey]}
                </Link>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
}
