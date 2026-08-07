"use client";

import * as React from "react";
import { Mail, MessageCircle, AtSign, Phone, MessageSquare, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ConnectWhatsAppForm } from "@/features/settings/components/connect-whatsapp-form";
import { disconnectChannelAction } from "@/features/settings/api/channel-actions";
import type { ChannelItem } from "@/features/settings/api/get-channels";

const CHANNEL_META: Record<string, { icon: React.ElementType; label: string }> = {
  whatsapp: { icon: MessageCircle, label: "WhatsApp" },
  email: { icon: Mail, label: "Correo electrónico" },
  instagram: { icon: AtSign, label: "Instagram" },
  sms: { icon: MessageSquare, label: "SMS" },
  voice: { icon: Phone, label: "Voz" },
};

function ChannelRow({ channel }: { channel: ChannelItem }) {
  const [isPending, startTransition] = React.useTransition();
  const meta = CHANNEL_META[channel.channelType];
  const Icon = meta?.icon ?? MessageCircle;
  const isConnected = channel.status === "connected";

  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{meta?.label ?? channel.channelType}</p>
        {channel.identifier && (
          <p className="text-xs text-muted-foreground">{channel.identifier}</p>
        )}
      </div>
      <Badge variant={isConnected ? "success" : "secondary"}>
        {isConnected ? "Conectado" : "No conectado"}
      </Badge>
      {isConnected && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={isPending}
          onClick={() => startTransition(async () => disconnectChannelAction(channel.id))}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

export function CommunicationChannelsSection({ channels }: { channels: ChannelItem[] }) {
  const whatsappChannel = channels.find((c) => c.channelType === "whatsapp");
  const isWhatsAppConnected = whatsappChannel?.status === "connected";

  return (
    <div className="flex flex-col gap-0">
      {channels.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<MessageCircle />}
            title="Ningún canal conectado todavía"
            className="border-none py-6"
          />
        </div>
      ) : (
        <div className="divide-y divide-border border-b border-border">
          {channels.map((c) => (
            <ChannelRow key={c.id} channel={c} />
          ))}
        </div>
      )}

      {!isWhatsAppConnected && (
        <div className="p-5">
          <ConnectWhatsAppForm />
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-border p-5 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Otros canales</p>
        <p>
          Correo electrónico (bandeja de entrada real, no solo envío), Instagram Direct, SMS y
          notas de voz transcritas son parte del diseño de esta sección — aún no implementados.
          Requieren cada uno su propia integración externa (OAuth de correo, Meta para Instagram,
          un proveedor de voz-a-texto para audio).
        </p>
      </div>
    </div>
  );
}
