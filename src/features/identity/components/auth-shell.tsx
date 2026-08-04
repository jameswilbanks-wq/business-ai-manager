import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Shared visual frame for every unauthenticated screen (login, register,
 * forgot/update password, verify email). Centers a single card on the
 * canvas background — deliberately outside the AppShell (no sidebar/topbar
 * before a session exists).
 */
export function AuthShell({ title, subtitle, children, footer, className }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sparkles className="size-4.5" />
        </div>
        <span className="text-sm font-semibold">Business AI Manager</span>
      </Link>

      <Card className={cn("w-full max-w-sm", className)}>
        <CardHeader className="items-center gap-1 text-center">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>

      {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  );
}
