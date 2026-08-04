"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/providers/locale-provider";
import { logoutAction } from "@/features/identity/api/auth-actions";

interface UserMenuProps {
  name?: string;
  email?: string;
}

export function UserMenu({ name, email }: UserMenuProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const displayName = name?.trim() || email?.split("@")[0] || "Usuario";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    setIsSigningOut(true);
    const result = await logoutAction();
    if (result.status === "success") {
      router.push(result.redirectTo ?? "/login");
      router.refresh();
    } else {
      setIsSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{displayName}</span>
          {email ? <span className="text-xs font-normal text-muted-foreground">{email}</span> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="size-4" /> {t.shell.profile}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={isSigningOut} onSelect={handleSignOut}>
          <LogOut className="size-4" /> {t.shell.sign_out}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
