import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { StockLevel } from "@/features/inventory/types/product";

interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  description: string | null;
  price: number;
  currency: string;
  is_active: boolean;
  inventory_items: { quantity_on_hand: number; reorder_threshold: number }[];
}

export async function getProducts(): Promise<StockLevel[]> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, sku, category, description, price, currency, is_active,
      inventory_items ( quantity_on_hand, reorder_threshold )
    `
    )
    .eq("business_id", currentBusiness.business.id)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) return [];

  return (data as unknown as ProductRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    description: row.description,
    price: row.price,
    currency: row.currency,
    isActive: row.is_active,
    quantityOnHand: row.inventory_items?.[0]?.quantity_on_hand ?? 0,
    reorderThreshold: row.inventory_items?.[0]?.reorder_threshold ?? 0,
  }));
}
