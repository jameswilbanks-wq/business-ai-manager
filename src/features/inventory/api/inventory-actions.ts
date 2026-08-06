"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function adjustStockAction(productId: string, delta: number) {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("inventory_items")
    .select("quantity_on_hand")
    .eq("product_id", productId)
    .maybeSingle();

  if (!item) return;

  const next = Math.max(0, item.quantity_on_hand + delta);
  await supabase
    .from("inventory_items")
    .update({ quantity_on_hand: next })
    .eq("product_id", productId);

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}
