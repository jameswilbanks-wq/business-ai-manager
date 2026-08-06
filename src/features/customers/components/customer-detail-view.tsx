import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Mail, MessageCircle, Package, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { formatCurrency } from "@/features/orders/components/format-currency";
import {
  ConversationPriorityBadge,
  ConversationStatusBadge,
} from "@/features/communication/components/conversation-badges";
import type { CustomerDetail } from "@/features/customers/types/customer";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export function CustomerDetailView({ customer }: { customer: CustomerDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href="/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <Avatar className="size-10">
          <AvatarFallback className={customer.isVip ? "bg-primary/15 text-primary" : undefined}>
            {initials(customer.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            {customer.name}
            {customer.isVip && <Badge variant="secondary">VIP</Badge>}
          </h1>
          <p className="text-xs text-muted-foreground">
            Cliente desde {format(new Date(customer.createdAt), "MMMM yyyy", { locale: es })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-sm">
              {customer.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4 shrink-0" />
                  <a href={`tel:${customer.phone}`} className="hover:text-foreground">
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4 shrink-0" />
                  <a href={`mailto:${customer.email}`} className="hover:text-foreground">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total gastado</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(customer.totalSpent, customer.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pedidos</span>
                <span className="tabular-nums">{customer.orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conversaciones</span>
                <span className="tabular-nums">{customer.conversations.length}</span>
              </div>
            </CardContent>
          </Card>

          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{customer.notes}</CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {customer.orders.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={<Package />} title="Sin pedidos aún" className="border-none py-6" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {customer.orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-accent/50"
                    >
                      <div>
                        <p className="text-sm font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium tabular-nums">
                          {formatCurrency(order.total, order.currency)}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversaciones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {customer.conversations.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={<MessageCircle />}
                    title="Sin conversaciones aún"
                    className="border-none py-6"
                  />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {customer.conversations.map((conv) => (
                    <Link
                      key={conv.id}
                      href={`/communication/${conv.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          {conv.aiSummary ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(conv.lastMessageAt), "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <ConversationStatusBadge status={conv.status} />
                        <ConversationPriorityBadge priority={conv.priority} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
