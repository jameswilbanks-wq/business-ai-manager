"use client";

import * as React from "react";
import { Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateGatekeeperSettingsAction } from "@/features/settings/api/channel-actions";
import type { AiSettings } from "@/features/settings/api/get-channels";

/**
 * "AI would basically function as a gatekeeper — if a message is not
 * business related or coming from one of the customers, don't take it
 * in." The setting is real and saved for real. What's NOT real yet: it
 * has nothing to actually filter until a live channel is connected and
 * sending inbound messages through the webhook — the classification
 * logic's home is already wired into that webhook handler, waiting on
 * this toggle.
 */
export function AiGatekeeperSettings({ settings }: { settings: AiSettings }) {
  const [enabled, setEnabled] = React.useState(settings.gatekeeperEnabled);
  const [instructions, setInstructions] = React.useState(settings.gatekeeperInstructions ?? "");
  const [isPending, startTransition] = React.useTransition();
  const [saved, setSaved] = React.useState(false);

  function save(nextEnabled: boolean, nextInstructions: string) {
    startTransition(async () => {
      await updateGatekeeperSettingsAction(nextEnabled, nextInstructions);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Shield className="size-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="gatekeeper" className="text-sm font-medium">
              Filtrar mensajes no relacionados con el negocio
            </Label>
            <Switch
              id="gatekeeper"
              checked={enabled}
              onCheckedChange={(checked) => {
                setEnabled(checked);
                save(checked, instructions);
              }}
              disabled={isPending}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Cuando esté activo, la IA revisará cada mensaje entrante de un canal conectado y
            descartará los que no parezcan relacionados con el negocio o no vengan de un cliente
            conocido, antes de que aparezcan en tu bandeja de entrada.
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-11 flex flex-col gap-2">
          <Label htmlFor="gatekeeperInstructions" className="text-xs text-muted-foreground">
            Instrucciones adicionales para la IA (opcional)
          </Label>
          <Textarea
            id="gatekeeperInstructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ej: acepta también mensajes de proveedores conocidos aunque no sean clientes."
            className="min-h-16"
          />
          <Button
            size="sm"
            variant="outline"
            className="self-start"
            disabled={isPending}
            onClick={() => save(enabled, instructions)}
          >
            {saved ? "Guardado" : "Guardar instrucciones"}
          </Button>
        </div>
      )}
    </div>
  );
}
