"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/shared/data-grid";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { CustomerListItem } from "@/features/customers/types/customer";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export function CustomersList({ customers }: { customers: CustomerListItem[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const filtered = customers.filter(
    (c) =>
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone?.toLowerCase().includes(query.toLowerCase())
  );

  const columns: DataGridColumn<CustomerListItem>[] = [
    {
      key: "name",
      header: "Cliente",
      render: (c) => (
        <span className="flex items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className={c.isVip ? "bg-primary/15 text-primary" : undefined}>
              {initials(c.name)}
            </AvatarFallback>
          </Avatar>
          <span className="flex items-center gap-1.5">
            {c.name}
            {c.isVip && (
              <Badge variant="secondary" className="text-[10px]">
                VIP
              </Badge>
            )}
          </span>
        </span>
      ),
    },
    {
      key: "phone",
      header: "Teléfono",
      render: (c) => c.phone ?? "—",
    },
    {
      key: "tags",
      header: "Etiquetas",
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
          {c.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">+{c.tags.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      key: "orders",
      header: "Pedidos",
      headClassName: "text-right",
      className: "text-right tabular-nums",
      render: (c) => c.orderCount,
    },
    {
      key: "conversations",
      header: "Conversaciones",
      headClassName: "text-right",
      className: "text-right tabular-nums",
      render: (c) => c.conversationCount,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o teléfono…"
        className="sm:w-72"
      />
      <DataGrid
        columns={columns}
        data={filtered}
        rowKey={(c) => c.id}
        emptyIcon={<Users />}
        emptyTitle="No hay clientes"
        emptyDescription="Ningún cliente coincide con tu búsqueda."
        onRowClick={(c) => router.push(`/customers/${c.id}`)}
      />
    </div>
  );
}
