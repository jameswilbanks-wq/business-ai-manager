export type OrderStatus =
  | "draft"
  | "awaiting_payment"
  | "paid"
  | "preparing"
  | "ready"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id: string;
  productName: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  total: number;
  deliveryDate: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    isVip: boolean;
  };
}

export interface OrderDetail extends OrderListItem {
  subtotal: number;
  discount: number;
  notes: string | null;
  deliveryAddress: string | null;
  paidAt: string | null;
  deliveredAt: string | null;
  conversationId: string | null;
  items: OrderItem[];
}
