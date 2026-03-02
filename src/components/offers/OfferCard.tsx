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
  const tCommon = useTranslations("common");
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

  const linkPath = `/oferta/${offer.slug}`;

  const hasDiscount = offer.minPrice < offer.basePrice;

  return (
    <Link href={linkPath}>
      <Card
        className={cn(
          "group overflow-hidden rounded-card border-surface-border hover:shadow-lg transition-all duration-300 cursor-pointer",
          className
        )}
      >
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-surface-alt">
          {offer.aircraft.images.length > 0 ? (
            <img
              src={offer.aircraft.images[0]}
              alt={offer.aircraft.model}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Plane className="size-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {offer.isEmptyLeg && (
              <Badge className="bg-brand-success text-white border-0 text-xs">
                {t("emptyLeg")}
              </Badge>
            )}
            {offer.featured && (
              <Badge className="bg-brand-accent text-white border-0 text-xs">
                {t("featured")}
              </Badge>
            )}
          </div>

          {/* Category badge */}
          <div className="absolute right-3 top-3">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-0 text-xs">
              {offer.category === "ONE_WAY"
                ? t("oneWay")
                : offer.category === "ROUND_TRIP"
                ? t("roundTrip")
                : offer.category === "TOUR"
                ? t("tour")
                : offer.category}
            </Badge>
          </div>
        </div>

        <CardContent className="space-y-3 pt-4 pb-5">
          {/* Route */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-brand-primary shrink-0" />
            <span className="font-medium truncate">
              {offer.origin} ({offer.originCode})
            </span>
            {offer.destination && (
              <>
                <span className="text-muted-foreground">&rarr;</span>
                <span className="font-medium truncate">
                  {offer.destination} ({offer.destinationCode})
                </span>
              </>
            )}
          </div>

          {/* Aircraft */}
          <p className="text-sm text-muted-foreground">
            {offer.aircraft.model}
          </p>

          {/* Date & Capacity */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formattedDate} {formattedTime}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {t("capacity", { count: offer.aircraft.capacity })}
            </span>
          </div>

          {/* Price & Operator */}
          <div className="flex items-end justify-between border-t border-surface-border pt-3">
            <div>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through mr-2">
                  {formatCurrency(offer.basePrice)}
                </span>
              )}
              <span className="text-lg font-bold text-brand-primary">
                {formatCurrency(hasDiscount ? offer.minPrice : offer.basePrice)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {offer.operator.verified && (
                <Shield className="size-3.5 text-brand-success" />
              )}
              <span>{offer.operator.companyName || offer.operator.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export type { OfferPreview };
