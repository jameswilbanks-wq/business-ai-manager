"use client";

import { useActionState } from "react";
import { MessageCircle } from "lucide-react";
import { connectWhatsAppChannelAction } from "@/features/settings/api/channel-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/features/identity/components/field-error";

export function ConnectWhatsAppForm() {
  const [state, formAction, isPending] = useActionState(connectWhatsAppChannelAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Conecta un número de WhatsApp a través de Twilio. Necesitas un Account SID, un Auth Token
        y el número de WhatsApp habilitado en tu cuenta de Twilio.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="accountSid">Account SID</Label>
          <Input id="accountSid" name="accountSid" placeholder="ACxxxxxxxxxxxxxxxx" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="authToken">Auth Token</Label>
          <Input id="authToken" name="authToken" type="password" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="whatsappNumber">Número de WhatsApp</Label>
          <Input id="whatsappNumber" name="whatsappNumber" placeholder="+14155238886" required />
        </div>
      </div>
      {state?.status === "error" && <FieldError errorKey={state.message} />}
      {state?.status === "success" && (
        <p className="text-sm text-success-foreground">
          Conectado. Configura el webhook de Twilio para que apunte a esta URL:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            {typeof window !== "undefined" ? window.location.origin : ""}
            /api/webhooks/twilio-whatsapp
          </code>
        </p>
      )}
      <Button type="submit" loading={isPending} className="self-start">
        <MessageCircle /> Conectar y verificar
      </Button>
    </form>
  );
}
