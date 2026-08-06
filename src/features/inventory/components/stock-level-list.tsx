"use client";

import * as React from "react";
import { AlertTriangle, Minus, Plus, Warehouse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { adjustStockAction } from "@/features/inventory/api/inventory-actions";
import { cn } from "@/lib/utils";
import type { StockLevel } from "@/features/inventory/types/product";

function StockRow({ product }: { product: StockLevel }) {
  const [isPending, startTransition] = React.useTransition();
  const isLow = product.quantityOnHand <= product.reorderThreshold;

  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.category ?? "Sin categoría"}</p>
      </div>

      {isLow && (
        <div className="hidden items-center gap-1 text-xs font-medium text-warning sm:flex">
          <AlertTriangle className="size-3.5" /> Inventario bajo
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={isPending || product.quantityOnHand === 0}
          onClick={() => startTransition(async () => adjustStockAction(product.id, -1))}
        >
          <Minus className="size-3.5" />
        </Button>
        <span
          className={cn(
            "w-10 text-center text-sm font-semibold tabular-nums",
            isLow && "text-warning"
          )}
        >
          {product.quantityOnHand}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={isPending}
          onClick={() => startTransition(async () => adjustStockAction(product.id, 1))}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function StockLevelList({ products }: { products: StockLevel[] }) {
  const lowStock = products.filter((p) => p.quantityOnHand <= p.reorderThreshold);
  const rest = products.filter((p) => p.quantityOnHand > p.reorderThreshold);

  if (products.length === 0) {
    return (
      <EmptyState icon={<Warehouse />} title="No hay productos en inventario" className="mt-6" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {lowStock.length > 0 && (
        <Card className="border-warning/40">
          <div className="flex items-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2.5 text-sm font-medium text-warning-foreground">
            <AlertTriangle className="size-4 text-warning" />
            {lowStock.length} producto{lowStock.length === 1 ? "" : "s"} con inventario bajo
          </div>
          <CardContent className="p-0">
            {lowStock.map((p) => (
              <StockRow key={p.id} product={p} />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {rest.map((p) => (
            <StockRow key={p.id} product={p} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
