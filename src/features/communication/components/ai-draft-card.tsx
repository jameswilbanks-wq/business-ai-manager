"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Pencil, RotateCw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  approveAiDraftAction,
  rejectAiDraftAction,
  regenerateAiDraftAction,
  updateDraftBodyAction,
} from "@/features/communication/api/conversation-actions";
import type { Message } from "@/features/communication/types/conversation";

/**
 * Approve / Edit / Reject / Regenerate on an AI draft. Confidence
 * (Product Principle — "Explainable Intelligence") only renders when
 * present: seeded demo drafts carry a manufactured score for
 * illustration, but real model output from the AI orchestrator doesn't
 * self-report a number, so fabricating one there would be dishonest.
 */
export function AiDraftCard({ draft }: { draft: Message }) {
  const [isPending, startTransition] = React.useTransition();
  const [editing, setEditing] = React.useState(false);
  const [editedBody, setEditedBody] = React.useState(draft.body);

  const confidencePct =
    draft.aiConfidence !== null ? Math.round(draft.aiConfidence * 100) : null;

  function saveEdit() {
    startTransition(async () => {
      await updateDraftBodyAction(draft.id, draft.conversationId, editedBody);
      setEditing(false);
    });
  }

  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <Sparkles className="size-4" /> Respuesta sugerida por IA
        </div>
        {confidencePct !== null && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{confidencePct}% confianza</span>
            <Progress value={confidencePct} className="w-16" />
          </div>
        )}
      </div>

      {editing ? (
        <Textarea
          value={editedBody}
          onChange={(e) => setEditedBody(e.target.value)}
          className="mb-3 min-h-20"
          autoFocus
        />
      ) : (
        <p className="mb-3 text-sm text-foreground">{draft.body}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {editing ? (
          <>
            <Button size="sm" disabled={isPending || !editedBody.trim()} onClick={saveEdit}>
              <Check /> Guardar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditedBody(draft.body);
                setEditing(false);
              }}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <>
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
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil /> Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await regenerateAiDraftAction(draft.id, draft.conversationId);
                  if (result.status === "error") {
                    toast.error(
                      result.message === "ai_not_configured"
                        ? "La IA en tiempo real no está configurada todavía — se aplicó una variación local."
                        : `No se pudo generar con IA — se aplicó una variación local.${result.detail ? " " + result.detail : ""}`
                    );
                  }
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
          </>
        )}
      </div>
    </div>
  );
}
