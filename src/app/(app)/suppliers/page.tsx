import { getSuppliers } from "@/features/suppliers/api/get-suppliers";
import { SuppliersList } from "@/features/suppliers/components/suppliers-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Proveedores</h1>
        <p className="text-sm text-muted-foreground">
          {suppliers.length} proveedor{suppliers.length === 1 ? "" : "es"} registrado{suppliers.length === 1 ? "" : "s"}.
        </p>
      </div>
      <SuppliersList suppliers={suppliers} />
    </div>
  );
}
