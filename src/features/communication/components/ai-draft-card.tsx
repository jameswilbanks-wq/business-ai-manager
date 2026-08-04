"use client";

import * as React from "react";
import { Check, Pencil, RotateCw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  approveAiDraftAction,
  rejectAiDraftAction,
  regenerateAiDraftAction,
} from "@/features/communication/api/conversation-actions";
import type { Message } from "@/features/communication/types/conversation";

/**
 * Approve / Edit / Reject / Regenerate on a seeded AI draft (Product
 * Principle — "Explainable Intelligence": confidence is always visible).
 * Regeneration is a local deterministic rewrite, not a live model call —
 * see conversation-actions.ts for why.
 */
export function AiDraftCard({ draft }: { draft: Message }) {
  const [isPending, startTransition] = React.useTransition();
  const [editing, setEditing] = React.useState(false);
  const [editedBody, setEditedBody] = React.useState(draft.body);

  const confidencePct = Math.round((draft.aiConfidence ?? 0) * 100);

  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <Sparkles className="size-4" /> Respuesta sugerida por IA
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{confidencePct}% confianza</span>
          <Progress value={confidencePct} className="w-16" />
        </div>
      </div>

      {editing ? (
        <Textarea
          value={editedBody}
          onChange={(e) => setEditedBody(e.target.value)}
          className="mb-3 min-h-20"
        />
      ) : (
        <p className="mb-3 text-sm text-foreground">{draft.body}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await approveAiDraftAction(draft.id, draft.conversationId);
            })
          }
        >
          <Check /> Aprobar
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
          <Pencil /> {editing ? "Cancelar edición" : "Editar"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await regenerateAiDraftAction(draft.id, draft.conversationId);
            })
          }
        >
          <RotateCw /> Regenerar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await rejectAiDraftAction(draft.id, draft.conversationId);
            })
          }
        >
          <X /> Rechazar
        </Button>
      </div>
    </div>
  );
}
