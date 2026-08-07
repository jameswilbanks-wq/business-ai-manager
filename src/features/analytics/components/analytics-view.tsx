import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { formatCurrency } from "@/features/orders/components/format-currency";
import { DistributionBar } from "@/features/analytics/components/distribution-bar";
import type { AnalyticsData } from "@/features/analytics/api/get-analytics";

const orderStatusLabels: Record<string, string> = {
  draft: "Borrador",
  awaiting_payment: "Esperando pago",
  paid: "Pagado",
  preparing: "Preparando",
  ready: "Listo",
  shipped: "Enviado",
  delivered: "Entregado",
  completed: "Completado",
  cancelled: "Cancelado",
};

const conversationStatusLabels: Record<string, string> = {
  open: "Abiertas",
  pending: "Pendientes",
  resolved: "Resueltas",
};

const taskStatusLabels: Record<string, string> = {
  todo: "Por hacer",
  in_progress: "En progreso",
  done: "Completadas",
  cancelled: "Canceladas",
};

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  const maxOrderStatus = Math.max(...data.ordersByStatus.map((s) => s.count), 1);
  const maxConvoStatus = Math.max(...data.conversationsByStatus.map((s) => s.count), 1);
  const maxTaskStatus = Math.max(...data.tasksByStatus.map((s) => s.count), 1);
  const maxProductRevenue = Math.max(...data.topProducts.map((p) => p.revenue), 1);

  const approvalRate =
    data.aiDraftStats.approved + data.aiDraftStats.rejected > 0
      ? Math.round(
          (data.aiDraftStats.approved / (data.aiDraftStats.approved + data.aiDraftStats.rejected)) * 100
        )
      : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analítica</h1>
        <p className="text-sm text-muted-foreground">
          Todo lo que ves aquí se calcula en vivo a partir de tus pedidos, conversaciones y tareas
          reales — no hay cifras de ejemplo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="Ingresos totales"
          value={formatCurrency(data.totalRevenue, data.currency)}
          icon={DollarSign}
        />
        <KpiCard
          label="Valor promedio de pedido"
          value={formatCurrency(data.averageOrderValue, data.currency)}
          icon={TrendingUp}
        />
        <KpiCard label="Pedidos totales" value={data.totalOrders} icon={ShoppingCart} />
        <KpiCard label="Clientes activos" value={data.activeCustomers} icon={Users} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por estado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {data.ordersByStatus.map((s) => (
              <DistributionBar
                key={s.status}
                label={orderStatusLabels[s.status] ?? s.status}
                count={s.count}
                max={maxOrderStatus}
                tone={
                  s.status === "cancelled"
                    ? "danger"
                    : s.status === "completed" || s.status === "delivered"
                      ? "success"
                      : "default"
                }
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no hay ventas confirmadas para calcular esto.
              </p>
            ) : (
              data.topProducts.map((p) => (
                <div key={p.name} className="flex items-center gap-3 text-sm">
                  <span className="w-32 shrink-0 truncate text-muted-foreground">{p.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.max(4, Math.round((p.revenue / maxProductRevenue) * 100))}%` }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right font-medium tabular-nums">
                    {formatCurrency(p.revenue, data.currency)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversaciones por estado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {data.conversationsByStatus.map((s) => (
              <DistributionBar
                key={s.status}
                label={conversationStatusLabels[s.status] ?? s.status}
                count={s.count}
                max={maxConvoStatus}
                tone={s.status === "resolved" ? "success" : "default"}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tareas por estado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {data.tasksByStatus.map((s) => (
              <DistributionBar
                key={s.status}
                label={taskStatusLabels[s.status] ?? s.status}
                count={s.count}
                max={maxTaskStatus}
                tone={s.status === "done" ? "success" : s.status === "cancelled" ? "danger" : "default"}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Desempeño de IA</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-2xl font-semibold">{data.aiDraftStats.total}</p>
            <p className="text-muted-foreground">Respuestas generadas por IA</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-success">{data.aiDraftStats.approved}</p>
            <p className="text-muted-foreground">Aprobadas</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-destructive">{data.aiDraftStats.rejected}</p>
            <p className="text-muted-foreground">Rechazadas</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-warning">{data.aiDraftStats.pending}</p>
            <p className="text-muted-foreground">Pendientes de revisión</p>
          </div>
          {approvalRate !== null && (
            <div>
              <p className="text-2xl font-semibold text-primary">{approvalRate}%</p>
              <p className="text-muted-foreground">Tasa de aprobación</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
