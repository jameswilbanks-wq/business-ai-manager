"use client";

import { AlertTriangle, Clock, MessageCircle, Sparkles } from "lucide-react";
import { useLocale } from "@/providers/locale-provider";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { ExecutiveBriefing } from "@/features/dashboard/components/executive-briefing";
import { NeedsAttentionList } from "@/features/dashboard/components/needs-attention-list";
import type { DashboardSummary } from "@/features/dashboard/api/get-dashboard-summary";

export function DashboardView({
  summary,
  userName,
  businessName,
}: {
  summary: DashboardSummary;
  userName: string;
  businessName: string;
}) {
  const { t, locale } = useLocale();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{businessName}</h1>
        <p className="text-sm text-muted-foreground">{t.dashboard.subtitle}</p>
      </div>

      <ExecutiveBriefing summary={summary} userName={userName} locale={locale} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label={locale === "es" ? "Mensajes sin leer" : "Unread messages"}
          value={summary.unreadCount}
          icon={MessageCircle}
        />
        <KpiCard
          label={locale === "es" ? "Urgentes" : "Urgent"}
          value={summary.urgentCount}
          icon={AlertTriangle}
          tone={summary.urgentCount > 0 ? "danger" : "default"}
        />
        <KpiCard
          label={locale === "es" ? "Sugerencias de IA" : "AI suggestions"}
          value={summary.aiDraftsAwaitingCount}
          icon={Sparkles}
        />
        <KpiCard
          label={locale === "es" ? "Pendientes" : "Pending"}
          value={summary.pendingCount}
          icon={Clock}
          tone={summary.pendingCount > 0 ? "warning" : "default"}
        />
      </div>

      <NeedsAttentionList
        conversations={summary.needsAttention}
        title={locale === "es" ? "Necesita tu atención" : "Needs your attention"}
        emptyTitle={locale === "es" ? "Todo está al día" : "You're all caught up"}
        emptyDescription={
          locale === "es"
            ? "No hay conversaciones urgentes o sin leer en este momento."
            : "No urgent or unread conversations right now."
        }
      />
    </div>
  );
}
