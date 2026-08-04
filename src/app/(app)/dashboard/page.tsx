"use client";

import { Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useLocale } from "@/providers/locale-provider";

export default function DashboardPage() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t.dashboard.title}</h1>
        <p className="text-sm text-muted-foreground">{t.dashboard.subtitle}</p>
      </div>

      <EmptyState
        icon={<Sparkles />}
        title={t.dashboard.empty_title}
        description={t.dashboard.empty_description}
        className="min-h-[50vh]"
      />
    </div>
  );
}
