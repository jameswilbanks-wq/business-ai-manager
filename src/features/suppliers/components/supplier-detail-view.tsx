import Link from "next/link";
import { ArrowLeft, Clock, Mail, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { SupplierDetail } from "@/features/suppliers/types/supplier";

export function SupplierDetailView({ supplier }: { supplier: SupplierDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href="/suppliers">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{supplier.name}</h1>
          {supplier.contactName && (
            <p className="text-xs text-muted-foreground">Contacto: {supplier.contactName}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Información de contacto</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-sm">
            {supplier.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <a href={`tel:${supplier.phone}`} className="hover:text-foreground">
                  {supplier.phone}
                </a>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <a href={`mailto:${supplier.email}`} className="hover:text-foreground">
                  {supplier.email}
                </a>
              </div>
            )}
            {supplier.leadTimeDays && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                Tiempo de entrega: {supplier.leadTimeDays} días
              </div>
            )}
            {supplier.notes && (
              <p className="mt-2 border-t border-border pt-2 text-muted-foreground">
                {supplier.notes}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Productos suministrados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {supplier.products.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={<Package />} title="Sin productos vinculados" className="border-none py-6" />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {supplier.products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.category ?? "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
