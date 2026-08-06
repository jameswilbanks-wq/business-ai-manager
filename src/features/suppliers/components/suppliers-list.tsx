"use client";

import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/shared/data-grid";
import { Badge } from "@/components/ui/badge";
import type { SupplierListItem } from "@/features/suppliers/types/supplier";

export function SuppliersList({ suppliers }: { suppliers: SupplierListItem[] }) {
  const router = useRouter();

  const columns: DataGridColumn<SupplierListItem>[] = [
    {
      key: "name",
      header: "Proveedor",
      render: (s) => (
        <div>
          <p className="font-medium">{s.name}</p>
          {s.contactName && <p className="text-xs text-muted-foreground">{s.contactName}</p>}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contacto",
      render: (s) => s.phone ?? s.email ?? "—",
    },
    {
      key: "leadTime",
      header: "Tiempo de entrega",
      render: (s) => (s.leadTimeDays ? `${s.leadTimeDays} días` : "—"),
    },
    {
      key: "products",
      header: "Productos",
      headClassName: "text-right",
      className: "text-right",
      render: (s) => <Badge variant="outline">{s.productCount}</Badge>,
    },
  ];

  return (
    <DataGrid
      columns={columns}
      data={suppliers}
      rowKey={(s) => s.id}
      emptyIcon={<Truck />}
      emptyTitle="No hay proveedores"
      onRowClick={(s) => router.push(`/suppliers/${s.id}`)}
    />
  );
}
