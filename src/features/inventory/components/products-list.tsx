"use client";

import * as React from "react";
import { Package } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/shared/data-grid";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/features/orders/components/format-currency";
import type { StockLevel } from "@/features/inventory/types/product";

export function ProductsList({ products }: { products: StockLevel[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = products.filter(
    (p) =>
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase())
  );

  const columns: DataGridColumn<StockLevel>[] = [
    {
      key: "name",
      header: "Producto",
      render: (p) => (
        <div>
          <p className="font-medium">{p.name}</p>
          {p.sku && <p className="text-xs text-muted-foreground">{p.sku}</p>}
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      render: (p) => p.category ?? "—",
    },
    {
      key: "price",
      header: "Precio",
      headClassName: "text-right",
      className: "text-right tabular-nums",
      render: (p) => formatCurrency(p.price, p.currency),
    },
    {
      key: "status",
      header: "Estado",
      render: (p) =>
        p.isActive ? (
          <Badge variant="success">Activo</Badge>
        ) : (
          <Badge variant="secondary">Inactivo</Badge>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o categoría…"
        className="sm:w-72"
      />
      <DataGrid
        columns={columns}
        data={filtered}
        rowKey={(p) => p.id}
        emptyIcon={<Package />}
        emptyTitle="No hay productos"
        emptyDescription="Ningún producto coincide con tu búsqueda."
      />
    </div>
  );
}
