import { getCustomers } from "@/features/customers/api/get-customers";
import { CustomersList } from "@/features/customers/components/customers-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CustomersPage() {
  const customers = await getCustomers();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          {customers.length} cliente{customers.length === 1 ? "" : "s"} en total.
        </p>
      </div>
      <CustomersList customers={customers} />
    </div>
  );
}
