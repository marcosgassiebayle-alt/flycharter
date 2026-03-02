"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PricingDisplay } from "@/components/offers/PricingDisplay";
import { EmptyLegBadge } from "@/components/offers/EmptyLegBadge";
import { formatCurrency } from "@/lib/utils";
import { calculateCurrentPrice } from "@/lib/pricing";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Plane,
  Shield,
  ArrowLeft,
  Minus,
  Plus,
  Lock,
  Info,
  Briefcase,
  Star,
  CheckCircle2,
} from "lucide-react";

type OfferDetail = {
  id: string;
  slug: string;
  vehicleType: "PLANE" | "HELICOPTER";
  category: "TOUR" | "ONE_WAY" | "ROUND_TRIP" | "RETURN";
  status: string;
  origin: string;
  originCode: string | null;
  destination: string | null;
  destinationCode: string | null;
  departureAt: string;
  returnAt: string | null;
  basePrice: number;
  minPrice: number;
  isEmptyLeg: boolean;
  discountType: string | null;
  discountRules: unknown;
  featured: boolean;
  cancellationPolicy: string | null;
  notes: string | null;
  aircraft: {
    id: string;
    model: string;
    type: string;
    capacity: number;
    yearBuilt: number | null;
    registration: string | null;
    description: string | null;
    images: string[];
    amenities: string[];
  };
  operator: {
    id: string;
    name: string;
    companyName: string | null;
    verified: boolean;
    description: string | null;
    profileImage: string | null;
  };
};

interface OfferDetailClientProps {
  offer: OfferDetail;
}

const CATEGORY_LABELS: Record<string, string> = {
  TOUR: "tour",
  ONE_WAY: "oneWay",
  ROUND_TRIP: "roundTrip",
  RETURN: "return",
};

export function OfferDetailClient({ offer }: OfferDetailClientProps) {
  const t = useTranslations("offers");
  const tPricing = useTranslations("pricing");
  const tCommon = useTranslations("common");
  const tCheckout = useTranslations("checkout");

  const [passengers, setPassengers] = useState(1);

  const departureDate = new Date(offer.departureAt);
  const formattedDate = departureDate.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = departureDate.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const returnDate = offer.returnAt ? new Date(offer.returnAt) : null;
  const formattedReturnDate = returnDate
    ? returnDate.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const formattedReturnTime = returnDate
    ? returnDate.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const pricing = calculateCurrentPrice(
    offer.basePrice,
    offer.minPrice,
    departureDate,
    offer.discountRules as Parameters<typeof calculateCurrentPrice>[3],
    offer.isEmptyLeg
  );

  const platformFee = Math.round(pricing.currentPrice * 0.08 * 100) / 100;
  const totalPrice = pricing.currentPrice + platformFee;

  const backPath = offer.vehicleType === "PLANE" ? "/aviones" : "/helicopteros";

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
      {/* Back link */}
      <Link
        href={backPath}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-primary transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        {tCommon("back")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image placeholder */}
          <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-card">
            {offer.aircraft.images.length > 0 ? (
              <img
                src={offer.aircraft.images[0]}
                alt={offer.aircraft.model}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-brand-secondary via-brand-secondary-light to-brand-primary flex items-center justify-center">
                <Plane className="size-20 text-white/30" />
              </div>
            )}

            {/* Badges overlay */}
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {offer.isEmptyLeg && (
                <Badge className="bg-brand-success text-white border-0">
                  {t("emptyLeg")}
                </Badge>
              )}
              {offer.featured && (
                <Badge className="bg-brand-accent text-white border-0">
                  {t("featured")}
                </Badge>
              )}
            </div>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-0">
                {t(CATEGORY_LABELS[offer.category])}
              </Badge>
            </div>
          </div>

          {/* Header: Route + badges */}
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-secondary">
                {offer.origin}
                {offer.originCode && (
                  <span className="text-muted-foreground font-normal text-xl ml-1">
                    ({offer.originCode})
                  </span>
                )}
              </h2>
              {offer.destination && (
                <>
                  <span className="text-muted-foreground text-xl">&rarr;</span>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-secondary">
                    {offer.destination}
                    {offer.destinationCode && (
                      <span className="text-muted-foreground font-normal text-xl ml-1">
                        ({offer.destinationCode})
                      </span>
                    )}
                  </h2>
                </>
              )}
            </div>
            <p className="text-muted-foreground">
              {offer.aircraft.model} &middot;{" "}
              {t("capacity", { count: offer.aircraft.capacity })}
            </p>
          </div>

          {/* Flight details card */}
          <Card className="rounded-card border-surface-border">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-brand-secondary flex items-center gap-2">
                <Calendar className="size-5 text-brand-primary" />
                {t("departure")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t("departure")}
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-brand-primary shrink-0" />
                    <p className="font-medium">
                      {offer.origin} {offer.originCode && `(${offer.originCode})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-3.5 shrink-0" />
                    <span>{formattedDate}</span>
                    <span className="font-medium text-foreground">{formattedTime}</span>
                  </div>
                </div>

                {offer.destination && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {tCommon("to")}
                    </p>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-brand-secondary shrink-0" />
                      <p className="font-medium">
                        {offer.destination} {offer.destinationCode && `(${offer.destinationCode})`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {returnDate && formattedReturnDate && formattedReturnTime && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {t("returnDate")}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-3.5 shrink-0" />
                      <span>{formattedReturnDate}</span>
                      <span className="font-medium text-foreground">{formattedReturnTime}</span>
                    </div>
                  </div>
                </>
              )}

              {offer.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <Info className="size-4 text-brand-accent shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{offer.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Aircraft card */}
          <Card className="rounded-card border-surface-border">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-brand-secondary flex items-center gap-2">
                <Plane className="size-5 text-brand-primary" />
                {t("aircraft")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Modelo</p>
                  <p className="font-medium text-sm">{offer.aircraft.model}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Capacidad</p>
                  <p className="font-medium text-sm flex items-center gap-1">
                    <Users className="size-3.5" />
                    {offer.aircraft.capacity}
                  </p>
                </div>
                {offer.aircraft.yearBuilt && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Ano</p>
                    <p className="font-medium text-sm">{offer.aircraft.yearBuilt}</p>
                  </div>
                )}
                {offer.aircraft.registration && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Matricula</p>
                    <p className="font-medium text-sm font-mono">{offer.aircraft.registration}</p>
                  </div>
                )}
              </div>

              {offer.aircraft.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {offer.aircraft.description}
                </p>
              )}

              {offer.aircraft.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {offer.aircraft.amenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="outline"
                      className="bg-surface-alt border-surface-border text-xs"
                    >
                      <CheckCircle2 className="size-3 text-brand-success mr-1" />
                      {amenity}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cancellation policy card */}
          {offer.cancellationPolicy && (
            <Card className="rounded-card border-surface-border">
              <CardHeader>
                <CardTitle className="text-lg font-heading text-brand-secondary flex items-center gap-2">
                  <Briefcase className="size-5 text-brand-primary" />
                  Politica de cancelacion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {offer.cancellationPolicy}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Operator card */}
          <Card className="rounded-card border-surface-border">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-brand-secondary flex items-center gap-2">
                <Star className="size-5 text-brand-accent" />
                {t("operator")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-secondary text-white font-heading font-bold text-lg shrink-0">
                  {(offer.operator.companyName || offer.operator.name).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      {offer.operator.companyName || offer.operator.name}
                    </p>
                    {offer.operator.verified && (
                      <Shield className="size-4 text-brand-success" />
                    )}
                  </div>
                  {offer.operator.companyName && (
                    <p className="text-sm text-muted-foreground">{offer.operator.name}</p>
                  )}
                  {offer.operator.verified && (
                    <span className="text-xs text-brand-success font-medium">
                      {t("verified")}
                    </span>
                  )}
                </div>
              </div>
              {offer.operator.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {offer.operator.description}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - sticky pricing panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="rounded-card border-surface-border shadow-lg">
              <CardContent className="pt-6 space-y-6">
                {/* Pricing display */}
                <PricingDisplay
                  basePrice={offer.basePrice}
                  minPrice={offer.minPrice}
                  departureAt={departureDate}
                  discountRules={offer.discountRules}
                  isEmptyLeg={offer.isEmptyLeg}
                  discountType={offer.discountType}
                />

                <Separator />

                {/* Passenger counter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {tCheckout("passengers")}
                  </label>
                  <div className="flex items-center h-10 rounded-button border border-input bg-white w-full">
                    <button
                      type="button"
                      onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                      disabled={passengers <= 1}
                      className="flex items-center justify-center w-10 h-full text-foreground hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-button"
                    >
                      <Minus className="size-4" />
                    </button>
                    <div className="flex items-center gap-1.5 flex-1 justify-center">
                      <Users className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium tabular-nums">{passengers}</span>
                      <span className="text-xs text-muted-foreground">
                        / {offer.aircraft.capacity}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPassengers((p) => Math.min(offer.aircraft.capacity, p + 1))
                      }
                      disabled={passengers >= offer.aircraft.capacity}
                      className="flex items-center justify-center w-10 h-full text-foreground hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-r-button"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Price breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{tPricing("charterPrice")}</span>
                    <span className="font-medium">{formatCurrency(pricing.currentPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{tPricing("platformFee")}</span>
                    <span className="font-medium">{formatCurrency(platformFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{tPricing("total")}</span>
                    <span className="text-xl font-bold text-brand-primary font-heading">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tPricing("pricePerFlight")}</p>
                </div>

                {/* Book button */}
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-gradient-primary text-white font-heading font-semibold rounded-button hover:opacity-90 transition-opacity text-base h-12"
                >
                  <Link
                    href={`/checkout/${offer.slug}?passengers=${passengers}`}
                  >
                    Reservar ahora
                  </Link>
                </Button>

                {/* Secure payment note */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" />
                  <span>{tPricing("securePayment")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
