import { cn } from "@/lib/utils";

interface DistributionBarProps {
  label: string;
  count: number;
  max: number;
  tone?: "default" | "success" | "warning" | "danger";
}

const toneClass: Record<NonNullable<DistributionBarProps["tone"]>, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
};

export function DistributionBar({ label, count, max, tone = "default" }: DistributionBarProps) {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 shrink-0 truncate text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", toneClass[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right font-medium tabular-nums">{count}</span>
    </div>
  );
}
