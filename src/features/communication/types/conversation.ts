export type ConversationStatus = "open" | "pending" | "resolved";
export type ConversationPriority = "normal" | "high" | "urgent";
export type Sentiment = "positive" | "neutral" | "negative";
export type SenderType = "customer" | "agent" | "ai" | "system";
export type AiStatus = "draft" | "approved" | "rejected";

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  isVip: boolean;
  tags: string[];
}

export interface ConversationListItem {
  id: string;
  customer: CustomerSummary;
  status: ConversationStatus;
  priority: ConversationPriority;
  assignedToName: string | null;
  tags: string[];
  unreadCount: number;
  aiSummary: string | null;
  sentiment: Sentiment | null;
  lastMessageAt: string;
  hasAiDraft: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderName: string | null;
  body: string;
  isInternalNote: boolean;
  aiConfidence: number | null;
  aiStatus: AiStatus | null;
  createdAt: string;
}

export interface ConversationDetail extends ConversationListItem {
  messages: Message[];
}
