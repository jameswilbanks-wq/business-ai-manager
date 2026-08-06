import { notFound } from "next/navigation";
import { getSupplierDetail } from "@/features/suppliers/api/get-supplier-detail";
import { SupplierDetailView } from "@/features/suppliers/components/supplier-detail-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplierDetail(id);

  if (!supplier) notFound();

  return <SupplierDetailView supplier={supplier} />;
}
