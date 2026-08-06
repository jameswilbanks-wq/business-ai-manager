import { getProducts } from "@/features/inventory/api/get-products";
import { ProductsList } from "@/features/inventory/components/products-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Productos</h1>
        <p className="text-sm text-muted-foreground">
          {products.length} producto{products.length === 1 ? "" : "s"} en el catálogo.
        </p>
      </div>
      <ProductsList products={products} />
    </div>
  );
}
