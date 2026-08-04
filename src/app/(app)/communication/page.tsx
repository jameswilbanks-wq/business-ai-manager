import { getConversations } from "@/features/communication/api/get-conversations";
import { getConversationDetail } from "@/features/communication/api/get-conversation-detail";
import { InboxView } from "@/features/communication/components/inbox-view";

export default async function CommunicationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  const [conversations, detail] = await Promise.all([
    getConversations(),
    id ? getConversationDetail(id) : Promise.resolve(null),
  ]);

  return <InboxView conversations={conversations} detail={detail} selectedId={id} />;
}
