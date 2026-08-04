import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ConversationList } from "@/features/communication/components/conversation-list";
import { ConversationDetailPanel } from "@/features/communication/components/conversation-detail-panel";
import type {
  ConversationDetail,
  ConversationListItem,
} from "@/features/communication/types/conversation";
import { cn } from "@/lib/utils";

interface InboxViewProps {
  conversations: ConversationListItem[];
  detail: ConversationDetail | null;
  selectedId?: string;
}

/**
 * Responsive master-detail: side-by-side from md breakpoint up; on mobile,
 * selecting a conversation replaces the list with the detail view (back
 * arrow returns to /communication). Fully server-driven via ?id= — no
 * client routing state beyond the URL itself.
 */
export function InboxView({ conversations, detail, selectedId }: InboxViewProps) {
  return (
    <div className="flex h-[calc(100dvh-8.5rem)] overflow-hidden rounded-xl border border-border md:h-[calc(100dvh-7rem)]">
      <div
        className={cn(
          "w-full shrink-0 border-r border-border md:block md:w-80",
          selectedId ? "hidden" : "block"
        )}
      >
        <ConversationList conversations={conversations} selectedId={selectedId} />
      </div>

      <div className={cn("min-w-0 flex-1", selectedId ? "block" : "hidden md:block")}>
        {detail ? (
          <ConversationDetailPanel conversation={detail} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={<MessageCircle />}
              title="Selecciona una conversación"
              description="Elige una conversación de la lista para ver los mensajes."
              className="border-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
