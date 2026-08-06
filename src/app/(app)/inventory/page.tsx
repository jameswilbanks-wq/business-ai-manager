import { getProducts } from "@/features/inventory/api/get-products";
import { StockLevelList } from "@/features/inventory/components/stock-level-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InventoryPage() {
  const products = await getProducts();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Inventario</h1>
        <p className="text-sm text-muted-foreground">Niveles de stock por producto.</p>
      </div>
      <StockLevelList products={products} />
    </div>
  );
}
