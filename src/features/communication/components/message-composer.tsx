"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessageAction } from "@/features/communication/api/conversation-actions";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [value, setValue] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  function submit() {
    const body = value.trim();
    if (!body) return;
    setValue("");
    startTransition(async () => {
      await sendMessageAction(conversationId, body);
    });
  }

  return (
    <div className="flex items-end gap-2 border-t border-border p-3">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Escribe un mensaje…"
        className="min-h-11 flex-1"
        rows={1}
      />
      <Button size="icon" onClick={submit} loading={isPending} disabled={!value.trim()}>
        <Send />
      </Button>
    </div>
  );
}
