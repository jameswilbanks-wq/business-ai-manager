import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { DashboardSummary } from "@/features/dashboard/api/get-dashboard-summary";
import type { Locale } from "@/lib/i18n/config";

/**
 * Every clause here reflects a real number from the summary — nothing is
 * hardcoded copy pretending to be generated. This is a template, not a
 * live model call (that's the AI domain's own future milestone), but the
 * numbers it plugs in are genuine.
 */
function buildBriefing(summary: DashboardSummary, name: string, locale: Locale): string {
  const { unreadCount, urgentCount, aiDraftsAwaitingCount, pendingCount } = summary;

  if (locale === "es") {
    const parts: string[] = [];
    if (urgentCount > 0) {
      parts.push(`${urgentCount} conversación${urgentCount === 1 ? "" : "es"} urgente${urgentCount === 1 ? "" : "s"} requiere${urgentCount === 1 ? "" : "n"} tu atención`);
    }
    if (unreadCount > 0) {
      parts.push(`${unreadCount} mensaje${unreadCount === 1 ? "" : "s"} sin leer`);
    }
    if (aiDraftsAwaitingCount > 0) {
      parts.push(`${aiDraftsAwaitingCount} respuesta${aiDraftsAwaitingCount === 1 ? "" : "s"} de IA lista${aiDraftsAwaitingCount === 1 ? "" : "s"} para tu aprobación`);
    }
    if (pendingCount > 0) {
      parts.push(`${pendingCount} conversación${pendingCount === 1 ? "" : "es"} pendiente${pendingCount === 1 ? "" : "s"} de respuesta`);
    }
    const body =
      parts.length > 0
        ? `Hoy tienes ${parts.join(", ")}.`
        : "No hay nada urgente pendiente en este momento. Buen trabajo.";
    return `¡Buenos días, ${name}! ${body}`;
  }

  const parts: string[] = [];
  if (urgentCount > 0) parts.push(`${urgentCount} urgent conversation${urgentCount === 1 ? "" : "s"}`);
  if (unreadCount > 0) parts.push(`${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`);
  if (aiDraftsAwaitingCount > 0)
    parts.push(`${aiDraftsAwaitingCount} AI reply${aiDraftsAwaitingCount === 1 ? "" : "ies"} awaiting your approval`);
  if (pendingCount > 0) parts.push(`${pendingCount} conversation${pendingCount === 1 ? "" : "s"} pending a reply`);
  const body =
    parts.length > 0
      ? `Today you have ${parts.join(", ")}.`
      : "Nothing urgent pending right now. Good work.";
  return `Good morning, ${name}! ${body}`;
}

export function ExecutiveBriefing({
  summary,
  userName,
  locale,
}: {
  summary: DashboardSummary;
  userName: string;
  locale: Locale;
}) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4.5" />
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            {buildBriefing(summary, userName, locale)}
          </p>
        </div>
        {summary.aiDraftsAwaitingCount > 0 && (
          <Button asChild size="sm" className="shrink-0">
            <Link href="/communication">
              {locale === "es" ? "Revisar sugerencias de IA" : "Review AI suggestions"}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
