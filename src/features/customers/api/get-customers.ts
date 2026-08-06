import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { CustomerListItem } from "@/features/customers/types/customer";

interface CustomerRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  tags: string[];
  is_vip: boolean;
  created_at: string;
  orders: { id: string }[];
  conversations: { id: string }[];
}

export async function getCustomers(): Promise<CustomerListItem[]> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      id, name, phone, email, tags, is_vip, created_at,
      orders ( id ),
      conversations ( id )
    `
    )
    .eq("business_id", currentBusiness.business.id)
    .order("is_vip", { ascending: false })
    .order("name", { ascending: true });

  if (error || !data) return [];

  return (data as unknown as CustomerRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    tags: row.tags,
    isVip: row.is_vip,
    orderCount: row.orders?.length ?? 0,
    conversationCount: row.conversations?.length ?? 0,
    createdAt: row.created_at,
  }));
}
