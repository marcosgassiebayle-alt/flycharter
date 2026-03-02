"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PricingDisplay } from "@/components/offers/PricingDisplay";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function ImageGallery({ images, model }: { images: string[]; model: string }) {
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const validImages = images.filter((_, i) => !imgError[i]);

  if (validImages.length === 0 || images.length === 0) {
    return (
      <div className="relative w-full rounded-card overflow-hidden bg-gradient-to-br from-brand-secondary via-brand-secondary-light to-brand-primary flex items-center justify-center" style={{ paddingBottom: "56.25%" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Plane className="size-24 text-white/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full rounded-card overflow-hidden bg-gradient-to-br from-brand-secondary to-brand-secondary-light" style={{ paddingBottom: "56.25%" }}>
        <div className="absolute inset-0">
          <img
            src={images[current]}
            alt={`${model} - ${current + 1}`}
            className="h-full w-full object-cover"
            onError={() => setImgError((prev) => ({ ...prev, [current]: true }))}
          />
          {imgError[current] && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-secondary via-brand-secondary-light to-brand-primary">
              <Plane className="size-24 text-white/20" />
            </div>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === current ? "bg-white w-4" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all",
                i === current ? "border-brand-primary" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              {!imgError[i] ? (
                <img
                  src={src}
                  alt={`${model} thumb ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => setImgError((prev) => ({ ...prev, [i]: true }))}
                />
              ) : (
                <div className="w-full h-full bg-surface-alt flex items-center justify-center">
                  <Plane className="size-5 text-muted-foreground/40" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function OfferDetailClient({ offer }: OfferDetailClientProps) {
  const t = useTranslations("offers");
  const tPricing = useTranslations("pricing");
  const tCheckout = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "es-AR";

  const [passengers, setPassengers] = useState(1);

  const departureDate = new Date(offer.departureAt);
  const formattedDate = departureDate.toLocaleDateString(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = departureDate.toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const returnDate = offer.returnAt ? new Date(offer.returnAt) : null;
  const formattedReturnDate = returnDate
    ? returnDate.toLocaleDateString(dateLocale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const formattedReturnTime = returnDate
    ? returnDate.toLocaleTimeString(dateLocale, {
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

  const aircraftLabels = {
    model: locale === "en" ? "Model" : "Modelo",
    capacity: locale === "en" ? "Capacity" : "Capacidad",
    year: locale === "en" ? "Year" : "Año",
    registration: locale === "en" ? "Registration" : "Matrícula",
    cancellationTitle: locale === "en" ? "Cancellation policy" : "Política de cancelación",
    bookNow: locale === "en" ? "Book now" : "Reservar ahora",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 pb-28 lg:pb-8">
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
          {/* Gallery */}
          <ImageGallery images={offer.aircraft.images} model={offer.aircraft.model} />

          {/* Badges + route header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
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
              <Badge variant="outline" className="bg-surface-alt border-surface-border">
                {t(CATEGORY_LABELS[offer.category])}
              </Badge>
            </div>

            <h1 className="font-heading text-2xl md:text-4xl font-bold text-brand-secondary leading-tight">
              {offer.originCode ?? offer.origin}
              {offer.destination && offer.destinationCode && (
                <span className="text-muted-foreground font-normal"> → {offer.destinationCode}</span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              {offer.origin}
              {offer.destination && ` → ${offer.destination}`}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {offer.aircraft.model} · {t("capacity", { count: offer.aircraft.capacity })}
            </p>
          </div>

          {/* Flight details */}
          <Card className="rounded-card border-surface-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading text-brand-secondary flex items-center gap-2">
                <Calendar className="size-4 text-brand-primary" />
                {t("departure")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    {t("departure")}
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-brand-primary shrink-0" />
                    <p className="font-medium text-sm">
                      {offer.origin} {offer.originCode && `(${offer.originCode})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pl-6">
                    <Clock className="size-3.5 shrink-0" />
                    <span>{formattedDate}, {formattedTime}</span>
                  </div>
                </div>

                {offer.destination && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      {tCommon("to")}
                    </p>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-brand-secondary shrink-0" />
                      <p className="font-medium text-sm">
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
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      {t("returnDate")}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-3.5 shrink-0" />
                      <span>{formattedReturnDate}, {formattedReturnTime}</span>
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

          {/* Aircraft */}
          <Card className="rounded-card border-surface-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading text-brand-secondary flex items-center gap-2">
                <Plane className="size-4 text-brand-primary" />
                {t("aircraft")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{aircraftLabels.model}</p>
                  <p className="font-medium text-sm">{offer.aircraft.model}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{aircraftLabels.capacity}</p>
                  <p className="font-medium text-sm flex items-center gap-1">
                    <Users className="size-3.5" />
                    {offer.aircraft.capacity}
                  </p>
                </div>
                {offer.aircraft.yearBuilt && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{aircraftLabels.year}</p>
                    <p className="font-medium text-sm">{offer.aircraft.yearBuilt}</p>
                  </div>
                )}
                {offer.aircraft.registration && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{aircraftLabels.registration}</p>
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

          {/* Cancellation policy */}
          {offer.cancellationPolicy && (
            <Card className="rounded-card border-surface-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading text-brand-secondary flex items-center gap-2">
                  <Briefcase className="size-4 text-brand-primary" />
                  {aircraftLabels.cancellationTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {offer.cancellationPolicy}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Operator */}
          <Card className="rounded-card border-surface-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading text-brand-secondary flex items-center gap-2">
                <Star className="size-4 text-brand-accent" />
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

        {/* Right column — sticky pricing */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <Card className="rounded-card border-surface-border shadow-[0_4px_24px_rgba(27,73,101,0.12)]">
              <CardContent className="pt-6 space-y-5">
                <PricingDisplay
                  basePrice={offer.basePrice}
                  minPrice={offer.minPrice}
                  departureAt={departureDate}
                  discountRules={offer.discountRules}
                  isEmptyLeg={offer.isEmptyLeg}
                  discountType={offer.discountType}
                />

                <Separator />

                {/* Passengers */}
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
                      <span className="text-xs text-muted-foreground">/ {offer.aircraft.capacity}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPassengers((p) => Math.min(offer.aircraft.capacity, p + 1))}
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
                    <span className="font-semibold text-sm">{tPricing("total")}</span>
                    <span className="text-2xl font-bold text-brand-primary font-mono">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tPricing("pricePerFlight")}</p>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="w-full bg-gradient-to-r from-brand-primary to-brand-accent text-white font-heading font-semibold rounded-button hover:opacity-90 transition-opacity text-base h-12 shadow-[0_4px_14px_rgba(232,93,38,0.35)]"
                >
                  <Link href={`/checkout/${offer.slug}?passengers=${passengers}`}>
                    {aircraftLabels.bookNow}
                  </Link>
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" />
                  <span>{tPricing("securePayment")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{tPricing("total")}</p>
          <p className="text-xl font-bold text-brand-primary font-mono leading-none">
            {formatCurrency(totalPrice)}
          </p>
          <p className="text-xs text-muted-foreground">{tPricing("pricePerFlight")}</p>
        </div>
        <Button
          asChild
          className="shrink-0 bg-gradient-to-r from-brand-primary to-brand-accent text-white font-heading font-semibold rounded-button hover:opacity-90 transition-opacity h-12 px-6 shadow-[0_4px_14px_rgba(232,93,38,0.35)]"
        >
          <Link href={`/checkout/${offer.slug}?passengers=${passengers}`}>
            {aircraftLabels.bookNow}
          </Link>
        </Button>
      </div>
    </div>
  );
}
