import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { SupplierListItem } from "@/features/suppliers/types/supplier";

interface SupplierRow {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  lead_time_days: number | null;
  supplier_products: { product_id: string }[];
}

export async function getSuppliers(): Promise<SupplierListItem[]> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, contact_name, phone, email, lead_time_days, supplier_products ( product_id )")
    .eq("business_id", currentBusiness.business.id)
    .order("name", { ascending: true });

  if (error || !data) return [];

  return (data as unknown as SupplierRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    leadTimeDays: row.lead_time_days,
    productCount: row.supplier_products?.length ?? 0,
  }));
}
