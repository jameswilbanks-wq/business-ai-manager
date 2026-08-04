import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import type {
  ConversationPriority,
  ConversationStatus,
  Sentiment,
} from "@/features/communication/types/conversation";

const statusTone: Record<ConversationStatus, StatusTone> = {
  open: "info",
  pending: "warning",
  resolved: "success",
};

const statusLabelEs: Record<ConversationStatus, string> = {
  open: "Abierta",
  pending: "Pendiente",
  resolved: "Resuelta",
};

const priorityTone: Record<ConversationPriority, StatusTone> = {
  normal: "neutral",
  high: "warning",
  urgent: "danger",
};

const priorityLabelEs: Record<ConversationPriority, string> = {
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

export function ConversationStatusBadge({ status }: { status: ConversationStatus }) {
  return <StatusBadge tone={statusTone[status]} label={statusLabelEs[status]} />;
}

export function ConversationPriorityBadge({ priority }: { priority: ConversationPriority }) {
  if (priority === "normal") return null;
  return <StatusBadge tone={priorityTone[priority]} label={priorityLabelEs[priority]} />;
}

const sentimentEmoji: Record<Sentiment, string> = {
  positive: "🙂",
  neutral: "😐",
  negative: "😟",
};

export function SentimentIndicator({ sentiment }: { sentiment: Sentiment | null }) {
  if (!sentiment) return null;
  return <span title={sentiment}>{sentimentEmoji[sentiment]}</span>;
}
