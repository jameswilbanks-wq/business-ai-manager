import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, MessageCircle, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { formatCurrency } from "@/features/orders/components/format-currency";
import type { OrderDetail } from "@/features/orders/types/order";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export function OrderDetailView({ order }: { order: OrderDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold tracking-tight">{order.orderNumber}</h1>
          <p className="text-xs text-muted-foreground">
            Creado el {format(new Date(order.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-4 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Artículos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {item.quantity}× {item.productName}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatCurrency(item.lineTotal, order.currency)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex flex-col gap-1.5 px-5 py-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Descuento</span>
                    <span className="tabular-nums">
                      −{formatCurrency(order.discount, order.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(order.total, order.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{order.notes}</CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials(order.customer.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{order.customer.name}</p>
                {order.customer.isVip && (
                  <Badge variant="secondary" className="mt-0.5 text-[10px]">
                    VIP
                  </Badge>
                )}
              </div>
              {order.conversationId && (
                <Link href={`/communication/${order.conversationId}`}>
                  <Button variant="outline" size="icon">
                    <MessageCircle />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entrega</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {order.deliveryDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4 shrink-0" />
                  {format(new Date(order.deliveryDate + "T00:00:00"), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </div>
              )}
              {order.deliveryAddress && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  {order.deliveryAddress}
                </div>
              )}
              {!order.deliveryDate && !order.deliveryAddress && (
                <p className="text-muted-foreground">Sin información de entrega aún.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
