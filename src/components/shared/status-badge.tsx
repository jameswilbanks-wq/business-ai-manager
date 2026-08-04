import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Renders any configurable business "Status" (per the Product Glossary —
 * statuses are never hardcoded business values, only their visual tone is).
 * Pass the status label as-is; map it to a tone via the `tone` prop.
 */
export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClassName: Record<StatusTone, string> = {
  neutral: "border-transparent bg-secondary text-secondary-foreground",
  info: "border-transparent bg-accent text-accent-foreground",
  success: "border-transparent bg-success/15 text-success-foreground",
  warning: "border-transparent bg-warning/20 text-warning-foreground",
  danger: "border-transparent bg-destructive/15 text-destructive",
};

const toneDot: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground",
  info: "bg-accent-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
};

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  tone?: StatusTone;
}

function StatusBadge({ label, tone = "neutral", className, ...props }: StatusBadgeProps) {
  return (
    <Badge className={cn(toneClassName[tone], className)} {...props}>
      <span className={cn("size-1.5 rounded-full", toneDot[tone])} aria-hidden />
      {label}
    </Badge>
  );
}

export { StatusBadge };
