import type { OrderStatus } from "@/features/orders/types/order";
import type { ConversationStatus, ConversationPriority } from "@/features/communication/types/conversation";

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  tags: string[];
  isVip: boolean;
  orderCount: number;
  conversationCount: number;
  createdAt: string;
}

export interface CustomerTimelineOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  currency: string;
  createdAt: string;
}

export interface CustomerTimelineConversation {
  id: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  aiSummary: string | null;
  lastMessageAt: string;
}

export interface CustomerDetail {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  tags: string[];
  isVip: boolean;
  notes: string | null;
  createdAt: string;
  orders: CustomerTimelineOrder[];
  conversations: CustomerTimelineConversation[];
  totalSpent: number;
  currency: string;
}
