import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/features/customers/api/get-customer-detail";
import { CustomerDetailView } from "@/features/customers/components/customer-detail-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerDetail(id);

  if (!customer) notFound();

  return <CustomerDetailView customer={customer} />;
}
