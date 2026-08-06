import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { SupplierDetail } from "@/features/suppliers/types/supplier";

export async function getSupplierDetail(supplierId: string): Promise<SupplierDetail | null> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return null;

  const supabase = await createClient();
  const { data: supplier, error } = await supabase
    .from("suppliers")
    .select(
      `
      id, name, contact_name, phone, email, lead_time_days, notes,
      supplier_products ( products ( id, name, category ) )
    `
    )
    .eq("id", supplierId)
    .eq("business_id", currentBusiness.business.id)
    .maybeSingle();

  if (error || !supplier) return null;

  const products = (
    supplier.supplier_products as unknown as { products: { id: string; name: string; category: string | null } | null }[]
  )
    .map((sp) => sp.products)
    .filter((p): p is { id: string; name: string; category: string | null } => !!p);

  return {
    id: supplier.id,
    name: supplier.name,
    contactName: supplier.contact_name,
    phone: supplier.phone,
    email: supplier.email,
    leadTimeDays: supplier.lead_time_days,
    notes: supplier.notes,
    productCount: products.length,
    products,
  };
}
