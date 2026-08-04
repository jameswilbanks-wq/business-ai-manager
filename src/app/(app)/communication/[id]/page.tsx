import { getConversations } from "@/features/communication/api/get-conversations";
import { getConversationDetail } from "@/features/communication/api/get-conversation-detail";
import { InboxView } from "@/features/communication/components/inbox-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [conversations, detail] = await Promise.all([
    getConversations(),
    getConversationDetail(id),
  ]);

  return <InboxView conversations={conversations} detail={detail} selectedId={id} />;
}
