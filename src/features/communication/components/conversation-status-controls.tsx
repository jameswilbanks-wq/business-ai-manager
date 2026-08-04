"use client";

import * as React from "react";
import { CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateConversationStatusAction } from "@/features/communication/api/conversation-actions";
import type { ConversationStatus } from "@/features/communication/types/conversation";

/**
 * The "mark as completed / needs follow-up" control the status badge
 * alone couldn't provide — status already existed in the schema, this is
 * what actually lets a person change it.
 */
export function ConversationStatusControls({
  conversationId,
  status,
}: {
  conversationId: string;
  status: ConversationStatus;
}) {
  const [isPending, startTransition] = React.useTransition();

  function setStatus(next: ConversationStatus) {
    startTransition(async () => {
      await updateConversationStatusAction(conversationId, next);
    });
  }

  if (status === "resolved") {
    return (
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => setStatus("open")}>
        <RotateCcw /> Reabrir
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {status !== "pending" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => setStatus("pending")}
        >
          <Clock /> Pendiente de seguimiento
        </Button>
      )}
      <Button size="sm" disabled={isPending} onClick={() => setStatus("resolved")}>
        <CheckCircle2 /> Resolver
      </Button>
    </div>
  );
}
