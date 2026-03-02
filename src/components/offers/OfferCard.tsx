"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Users, Plane, Shield } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type OfferPreview = {
  id: string;
  slug: string;
  vehicleType: "PLANE" | "HELICOPTER";
  category: string;
  origin: string;
  originCode: string;
  destination: string | null;
  destinationCode: string | null;
  departureAt: string;
  basePrice: number;
  minPrice: number;
  isEmptyLeg: boolean;
  featured: boolean;
  legs?: Array<{
    legOrder: number;
    originCode: string | null;
    destinationCode: string | null;
  }>;
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

interface OfferCardProps {
  offer: OfferPreview;
  className?: string;
}

export function OfferCard({ offer, className }: OfferCardProps) {
  const t = useTranslations("offers");
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "es-AR";

  const departureDate = new Date(offer.departureAt);
  const formattedDate = departureDate.toLocaleDateString(dateLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const formattedTime = departureDate.toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasDiscount = offer.minPrice < offer.basePrice;

  const categoryLabel =
    offer.category === "ONE_WAY"
      ? t("oneWay")
      : offer.category === "ROUND_TRIP"
      ? t("roundTrip")
      : offer.category === "TOUR"
      ? t("tour")
      : t("return");

  return (
    <Link href={`/oferta/${offer.slug}`} className="block group">
      <Card
        className={cn(
          "overflow-hidden rounded-card border-surface-border bg-white cursor-pointer",
          "transition-all duration-300 ease-out",
          "hover:shadow-[0_12px_40px_rgba(27,73,101,0.15)] hover:-translate-y-1",
          className
        )}
      >
        {/* Image — 16:10 aspect ratio */}
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-brand-secondary via-brand-secondary-light to-brand-primary" style={{ paddingBottom: "62.5%" }}>
          <div className="absolute inset-0">
            {offer.aircraft.images.length > 0 ? (
              <img
                src={offer.aircraft.images[0]}
                alt={offer.aircraft.model}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Plane className="size-14 text-white/20" />
              </div>
            )}
          </div>

          {/* Gradient overlay at bottom for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Top-left badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {offer.isEmptyLeg && (
              <Badge className="bg-brand-success/90 backdrop-blur-sm text-white border-0 text-xs font-semibold">
                {t("emptyLeg")}
              </Badge>
            )}
            {offer.featured && (
              <Badge className="bg-brand-accent/90 backdrop-blur-sm text-white border-0 text-xs font-semibold">
                {t("featured")}
              </Badge>
            )}
          </div>

          {/* Top-right badge */}
          <div className="absolute right-3 top-3">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-0 text-xs font-medium">
              {categoryLabel}
            </Badge>
          </div>

          {/* Bottom-left: route codes overlay */}
          <div className="absolute bottom-3 left-3">
            <p className="text-white font-heading font-bold text-lg leading-none drop-shadow-md">
              {offer.legs && offer.legs.length > 1 ? (
                offer.legs
                  .slice()
                  .sort((a, b) => a.legOrder - b.legOrder)
                  .map((leg, i) => (
                    <span key={i}>
                      {i === 0 && leg.originCode}
                      {leg.destinationCode && (
                        <span className="text-white/80"> → {leg.destinationCode}</span>
                      )}
                    </span>
                  ))
              ) : (
                <>
                  {offer.originCode}
                  {offer.destination && offer.destinationCode && (
                    <span className="text-white/80"> → {offer.destinationCode}</span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Route full names */}
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <MapPin className="size-3.5 text-brand-primary shrink-0" />
            <span className="truncate">
              {offer.legs && offer.legs.length > 1 ? (
                offer.legs
                  .slice()
                  .sort((a, b) => a.legOrder - b.legOrder)
                  .map((leg, i) => (
                    <span key={i}>
                      {i === 0 && leg.originCode}
                      {leg.destinationCode && (
                        <>
                          <span className="text-muted-foreground mx-1">→</span>
                          {leg.destinationCode}
                        </>
                      )}
                    </span>
                  ))
              ) : (
                <>
                  {offer.origin}
                  {offer.destination && (
                    <>
                      <span className="text-muted-foreground mx-1">→</span>
                      {offer.destination}
                    </>
                  )}
                </>
              )}
            </span>
          </div>

          {/* Aircraft model */}
          <p className="text-xs text-muted-foreground">{offer.aircraft.model}</p>

          {/* Date & Capacity */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formattedDate} {formattedTime}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {t("capacity", { count: offer.aircraft.capacity })}
            </span>
          </div>

          {/* Price & Operator */}
          <div className="flex items-end justify-between border-t border-surface-border pt-3 mt-1">
            <div className="space-y-0.5">
              {hasDiscount && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatCurrency(offer.basePrice)}
                </p>
              )}
              <p className="text-xl font-bold text-brand-primary font-mono leading-none">
                {formatCurrency(hasDiscount ? offer.minPrice : offer.basePrice)}
              </p>
              <p className="text-xs text-muted-foreground">{t("perFlight")}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {offer.operator.verified && (
                <Shield className="size-3.5 text-brand-success shrink-0" />
              )}
              <span className="truncate max-w-[100px]">
                {offer.operator.companyName || offer.operator.name}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export type { OfferPreview };
