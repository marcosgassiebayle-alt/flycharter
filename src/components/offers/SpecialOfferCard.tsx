"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Plane, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type SpecialOffer = {
  id: string;
  slug: string;
  vehicleType: "PLANE" | "HELICOPTER";
  origin: string;
  originCode: string | null;
  destination: string | null;
  destinationCode: string | null;
  departureAt: string;
  basePrice: number;
  minPrice: number;
  originalPrice: number | null;
  discountLabel: string | null;
  isEmptyLeg: boolean;
  isLastMinute: boolean;
  isSharedFlight: boolean;
  availableSeats: number | null;
  pricePerSeat: number | null;
  urgencyLevel: string | null;
  expiresAt: string | null;
  featured: boolean;
  aircraft: {
    model: string;
    capacity: number;
    images: string[];
  };
  operator: {
    name: string;
    companyName: string | null;
    verified: boolean;
  };
};

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expirado"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return <span className="font-mono tabular-nums">{timeLeft}</span>;
}

interface SpecialOfferCardProps {
  offer: SpecialOffer;
  className?: string;
}

export function SpecialOfferCard({ offer, className }: SpecialOfferCardProps) {
  const urgency = offer.urgencyLevel;
  const departureDate = new Date(offer.departureAt);
  const hasDiscount = offer.originalPrice && offer.originalPrice > offer.minPrice;

  const urgencyBorderClass = urgency === "high"
    ? "border-l-4 border-l-red-500"
    : urgency === "medium"
    ? "border-l-4 border-l-orange-500"
    : urgency === "low"
    ? "border-l-4 border-l-yellow-500"
    : "";

  const urgencyBadge = urgency === "high"
    ? <Badge className="bg-red-500 text-white border-0 text-xs animate-pulse">¡Últimas horas!</Badge>
    : urgency === "medium"
    ? <Badge className="bg-orange-500 text-white border-0 text-xs">Expira pronto</Badge>
    : urgency === "low"
    ? <Badge className="bg-yellow-500 text-white border-0 text-xs">Tiempo limitado</Badge>
    : null;

  const typeLabel = offer.isEmptyLeg ? "Empty Leg"
    : offer.isLastMinute ? "Último Minuto"
    : offer.isSharedFlight ? "Asientos Compartidos"
    : "Oferta";

  const typeBadgeClass = offer.isEmptyLeg ? "bg-brand-success/90"
    : offer.isLastMinute ? "bg-brand-primary/90"
    : "bg-brand-secondary/90";

  return (
    <Link href={`/oferta/${offer.slug}`} className="block group">
      <Card
        className={cn(
          "overflow-hidden rounded-card bg-white cursor-pointer",
          "transition-all duration-200 ease-out",
          "hover:shadow-[0_12px_40px_rgba(27,73,101,0.15)] hover:-translate-y-1",
          urgencyBorderClass,
          className
        )}
      >
        {/* Image */}
        <div
          className="relative w-full overflow-hidden bg-gradient-to-br from-brand-secondary via-brand-secondary-light to-brand-primary"
          style={{ paddingBottom: "62.5%" }}
        >
          <div className="absolute inset-0">
            {offer.aircraft.images.length > 0 ? (
              <img
                src={offer.aircraft.images[0]}
                alt={offer.aircraft.model}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Plane className="size-14 text-white/20" />
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge className={cn("backdrop-blur-sm text-white border-0 text-xs font-semibold", typeBadgeClass)}>
              {typeLabel}
            </Badge>
            {offer.discountLabel && (
              <Badge className="bg-brand-accent/90 backdrop-blur-sm text-white border-0 text-xs font-bold">
                {offer.discountLabel}
              </Badge>
            )}
          </div>

          {/* Route overlay */}
          <div className="absolute bottom-3 left-3">
            <p className="text-white font-heading font-bold text-xl leading-none drop-shadow-md">
              {offer.originCode}
              {offer.destinationCode && <span className="text-white/80"> → {offer.destinationCode}</span>}
            </p>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Route full names */}
          <div>
            <p className="font-semibold text-sm text-foreground truncate">
              {offer.origin}
              {offer.destination && ` → ${offer.destination}`}
            </p>
          </div>

          {/* Date & Aircraft */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {departureDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
            </span>
            <span className="flex items-center gap-1">
              <Plane className="size-3" />
              {offer.aircraft.model}
            </span>
          </div>

          {/* Shared flight progress bar */}
          {offer.isSharedFlight && offer.availableSeats !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="size-3" />
                  {offer.availableSeats} de {offer.aircraft.capacity} disponibles
                </span>
              </div>
              <div className="w-full bg-surface-alt rounded-full h-1.5">
                <div
                  className="bg-brand-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${((offer.aircraft.capacity - (offer.availableSeats ?? 0)) / offer.aircraft.capacity) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end justify-between border-t border-surface-border pt-2.5">
            <div className="space-y-0.5">
              {hasDiscount && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatCurrency(offer.originalPrice!)}
                </p>
              )}
              {offer.isSharedFlight && offer.pricePerSeat ? (
                <>
                  <p className="text-xl font-bold text-brand-primary font-mono leading-none">
                    {formatCurrency(offer.pricePerSeat)}
                  </p>
                  <p className="text-xs text-muted-foreground">/asiento</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-brand-primary font-mono leading-none">
                    {formatCurrency(offer.minPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground">vuelo completo</p>
                </>
              )}
            </div>

            {/* Urgency */}
            <div className="flex flex-col items-end gap-1">
              {urgencyBadge}
              {urgency === "high" && offer.departureAt && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <Clock className="size-3" />
                  <CountdownTimer expiresAt={offer.departureAt} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
