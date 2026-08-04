import { getOrders } from "@/features/orders/api/get-orders";
import { OrdersList } from "@/features/orders/components/orders-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
  const orders = await getOrders();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} pedido{orders.length === 1 ? "" : "s"} en total.
        </p>
      </div>
      <OrdersList orders={orders} />
    </div>
  );
}
