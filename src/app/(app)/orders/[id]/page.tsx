import { notFound } from "next/navigation";
import { getOrderDetail } from "@/features/orders/api/get-order-detail";
import { OrderDetailView } from "@/features/orders/components/order-detail-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetail(id);

  if (!order) notFound();

  return <OrderDetailView order={order} />;
}
