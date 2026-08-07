import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface RoleOption {
  id: string;
  name: string;
}

export async function getSystemRoles(): Promise<RoleOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roles")
    .select("id, name")
    .eq("is_system_role", true)
    .neq("name", "Owner")
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data;
}
