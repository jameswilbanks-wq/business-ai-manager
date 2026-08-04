"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Package } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/shared/data-grid";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { formatCurrency } from "@/features/orders/components/format-currency";
import type { OrderListItem, OrderStatus } from "@/features/orders/types/order";

type FilterKey = "all" | "active" | "completed" | "cancelled";

const activeStatuses: OrderStatus[] = [
  "draft",
  "awaiting_payment",
  "paid",
  "preparing",
  "ready",
  "shipped",
];

export function OrdersList({ orders }: { orders: OrderListItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [query, setQuery] = React.useState("");

  const filtered = orders.filter((o) => {
    if (filter === "active" && !activeStatuses.includes(o.status)) return false;
    if (filter === "completed" && o.status !== "completed" && o.status !== "delivered")
      return false;
    if (filter === "cancelled" && o.status !== "cancelled") return false;
    if (query && !o.customer.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const columns: DataGridColumn<OrderListItem>[] = [
    {
      key: "order_number",
      header: "Pedido",
      render: (o) => <span className="font-medium">{o.orderNumber}</span>,
    },
    {
      key: "customer",
      header: "Cliente",
      render: (o) => (
        <span className="flex items-center gap-1.5">
          {o.customer.name}
          {o.customer.isVip && (
            <Badge variant="secondary" className="text-[10px]">
              VIP
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (o) => <OrderStatusBadge status={o.status} />,
    },
    {
      key: "delivery_date",
      header: "Entrega",
      render: (o) =>
        o.deliveryDate
          ? format(new Date(o.deliveryDate + "T00:00:00"), "d MMM", { locale: es })
          : "—",
    },
    {
      key: "total",
      header: "Total",
      headClassName: "text-right",
      className: "text-right font-medium tabular-nums",
      render: (o) => formatCurrency(o.total, o.currency),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cliente…"
          className="sm:w-64"
        />
      </div>

      <DataGrid
        columns={columns}
        data={filtered}
        rowKey={(o) => o.id}
        emptyIcon={<Package />}
        emptyTitle="No hay pedidos"
        emptyDescription="Ningún pedido coincide con este filtro."
        onRowClick={(o) => router.push(`/orders/${o.id}`)}
      />
    </div>
  );
}
