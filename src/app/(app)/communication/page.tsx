import { getConversations } from "@/features/communication/api/get-conversations";
import { InboxView } from "@/features/communication/components/inbox-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CommunicationPage() {
  const conversations = await getConversations();
  return <InboxView conversations={conversations} detail={null} />;
}
