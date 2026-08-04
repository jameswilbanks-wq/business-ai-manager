import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Sparkles, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/features/communication/types/conversation";

export function MessageBubble({ message, locale }: { message: Message; locale: "es" | "en" }) {
  const time = format(new Date(message.createdAt), "p", { locale: locale === "es" ? es : enUS });

  if (message.senderType === "system") {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {message.body}
        </span>
      </div>
    );
  }

  if (message.isInternalNote) {
    return (
      <div className="mx-auto flex max-w-[85%] items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm">
        <StickyNote className="mt-0.5 size-3.5 shrink-0 text-warning" />
        <div>
          <p className="text-foreground">{message.body}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {message.senderName} · {time}
          </p>
        </div>
      </div>
    );
  }

  const isOutbound = message.senderType === "agent" || message.senderType === "ai";
  const isAiDraft = message.senderType === "ai" && message.aiStatus === "draft";

  return (
    <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
          isOutbound
            ? isAiDraft
              ? "rounded-br-sm border border-dashed border-primary/40 bg-primary/10 text-foreground"
              : "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground"
        )}
      >
        {isAiDraft && (
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-primary">
            <Sparkles className="size-3" /> Borrador de IA
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.body}</p>
        <p
          className={cn(
            "mt-1 text-right text-[10px]",
            isOutbound && !isAiDraft ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
