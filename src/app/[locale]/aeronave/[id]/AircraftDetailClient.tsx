"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { searchAirports, type Airport } from "@/lib/airports";
import {
  MapPin, Users, Zap, Clock, Shield, ArrowLeft, Plane, Plus, X,
  ChevronLeft, ChevronRight, Calendar, Star
} from "lucide-react";
import { SpecialOfferCard, type SpecialOffer } from "@/components/offers/SpecialOfferCard";
import { format } from "date-fns";

type AircraftDetail = {
  id: string;
  type: string;
  model: string;
  description: string | null;
  capacity: number;
  images: string[];
  yearBuilt: number | null;
  registration: string | null;
  amenities: string[];
  hourlyRate: number;
  baseAirport: string;
  baseAirportName: string;
  cruiseSpeedKmh: number;
  minBookingHours: number;
  createdAt: string;
  updatedAt: string;
  operator: {
    id: string;
    name: string;
    companyName: string | null;
    verified: boolean;
    description: string | null;
    profileImage: string | null;
  };
  blockedDates: Array<{ id: string; date: string; reason: string | null; createdAt: string }>;
  locations: Array<{ id: string; date: string; airportCode: string; airportName: string }>;
  offers: SpecialOffer[];
};

// Image gallery
function ImageGallery({ images, model }: { images: string[]; model: string }) {
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  if (images.length === 0 || Object.keys(imgError).length === images.length) {
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
                <button key={i} onClick={() => setCurrent(i)}
                  className={cn("w-2 h-2 rounded-full transition-all", i === current ? "bg-white w-4" : "bg-white/50")}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={cn("shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all",
                i === current ? "border-brand-primary" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img src={src} alt="" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Leg type for the route calculator
type CalcLeg = {
  origin: Airport | null;
  destination: Airport | null;
  date: Date | undefined;
  originQuery: string;
  destinationQuery: string;
  originOpen: boolean;
  destinationOpen: boolean;
  dateOpen: boolean;
};

type PriceResult = {
  legs: Array<{ originCode?: string; destCode?: string; distanceKm: number; durationMin: number; price: number }>;
  totalPrice: number;
  platformFee: number;
  grandTotal: number;
};

interface BookingSidebarProps {
  aircraft: AircraftDetail;
}

function BookingSidebar({ aircraft }: BookingSidebarProps) {
  const t = useTranslations("aircraft");
  const [legs, setLegs] = useState<CalcLeg[]>([{
    origin: null, destination: null, date: undefined,
    originQuery: "", destinationQuery: "", originOpen: false, destinationOpen: false, dateOpen: false,
  }]);
  const [passengers, setPassengers] = useState(1);
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  const updateLeg = (index: number, patch: Partial<CalcLeg>) => {
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, ...patch } : leg)));
  };

  const addLeg = () => {
    const prevDest = legs[legs.length - 1]?.destination;
    setLegs((prev) => [...prev, {
      origin: prevDest ?? null, destination: null, date: undefined,
      originQuery: "", destinationQuery: "", originOpen: false, destinationOpen: false, dateOpen: false,
    }]);
  };

  const removeLeg = (index: number) => {
    setLegs((prev) => prev.filter((_, i) => i !== index));
  };

  const calculatePrice = useCallback(async () => {
    const validLegs = legs.filter((l) => l.origin && l.destination);
    if (validLegs.length === 0) { setPriceResult(null); return; }

    setCalculating(true);
    try {
      const res = await fetch("/api/calculate-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aircraftId: aircraft.id,
          legs: validLegs.map((l) => ({ originCode: l.origin!.code, destCode: l.destination!.code })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPriceResult(data);
      }
    } catch {
      // ignore errors
    } finally {
      setCalculating(false);
    }
  }, [legs, aircraft.id]);

  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  return (
    <Card className="rounded-card border-surface-border shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="font-heading text-brand-secondary">{t("planYourFlight")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          <span className="text-2xl font-bold font-mono text-brand-primary">{formatCurrency(aircraft.hourlyRate)}</span>
          <span className="text-muted-foreground"> /hora</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legs */}
        <div className="space-y-3">
          {legs.map((leg, index) => {
            const originResults = leg.originQuery.length > 0 ? searchAirports(leg.originQuery) : [];
            const destResults = leg.destinationQuery.length > 0 ? searchAirports(leg.destinationQuery) : [];
            return (
              <div key={index} className="border border-surface-border rounded-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t("leg")} {index + 1}
                  </span>
                  {legs.length > 1 && (
                    <button onClick={() => removeLeg(index)} className="text-muted-foreground hover:text-brand-error transition-colors">
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
                {/* Origin */}
                <Popover open={leg.originOpen} onOpenChange={(o) => updateLeg(index, { originOpen: o })}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-sm rounded-button", !leg.origin && "text-muted-foreground")}>
                      <MapPin className="size-3.5 text-brand-primary shrink-0 mr-1" />
                      <span className="truncate">{leg.origin ? `${leg.origin.city} (${leg.origin.code})` : t("selectOrigin")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder={t("searchAirport")} value={leg.originQuery} onValueChange={(v) => updateLeg(index, { originQuery: v })} />
                      <CommandList>
                        <CommandEmpty>{t("noResults")}</CommandEmpty>
                        <CommandGroup>
                          {originResults.map((ap) => (
                            <CommandItem key={ap.code} value={ap.code} onSelect={() => updateLeg(index, { origin: ap, originOpen: false, originQuery: "" })}>
                              <MapPin className="size-3.5 text-muted-foreground mr-2" />
                              <div>
                                <p className="text-sm font-medium">{ap.city} ({ap.code})</p>
                                <p className="text-xs text-muted-foreground">{ap.name}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {/* Destination */}
                <Popover open={leg.destinationOpen} onOpenChange={(o) => updateLeg(index, { destinationOpen: o })}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-sm rounded-button", !leg.destination && "text-muted-foreground")}>
                      <MapPin className="size-3.5 text-brand-secondary shrink-0 mr-1" />
                      <span className="truncate">{leg.destination ? `${leg.destination.city} (${leg.destination.code})` : t("selectDestination")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder={t("searchAirport")} value={leg.destinationQuery} onValueChange={(v) => updateLeg(index, { destinationQuery: v })} />
                      <CommandList>
                        <CommandEmpty>{t("noResults")}</CommandEmpty>
                        <CommandGroup>
                          {destResults.map((ap) => (
                            <CommandItem key={ap.code} value={ap.code} onSelect={() => updateLeg(index, { destination: ap, destinationOpen: false, destinationQuery: "" })}>
                              <MapPin className="size-3.5 text-muted-foreground mr-2" />
                              <div>
                                <p className="text-sm font-medium">{ap.city} ({ap.code})</p>
                                <p className="text-xs text-muted-foreground">{ap.name}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {/* Date */}
                <Popover open={leg.dateOpen} onOpenChange={(o) => updateLeg(index, { dateOpen: o })}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-sm rounded-button", !leg.date && "text-muted-foreground")}>
                      <Calendar className="size-3.5 text-brand-accent shrink-0 mr-1" />
                      <span className="truncate">{leg.date ? format(leg.date, "dd/MM/yyyy") : t("selectDate")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={leg.date}
                      onSelect={(d) => updateLeg(index, { date: d, dateOpen: false })}
                      disabled={(d) => {
                        if (d < new Date()) return true;
                        const dateStr = d.toISOString().split("T")[0];
                        return aircraft.blockedDates.some(
                          (bd) => new Date(bd.date).toISOString().split("T")[0] === dateStr
                        );
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            );
          })}

          <button
            onClick={addLeg}
            className="flex items-center gap-1.5 text-sm text-brand-primary hover:opacity-80 transition-opacity font-medium"
          >
            <Plus className="size-4" />
            {t("addLeg")}
          </button>
        </div>

        {/* Passengers */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("passengers")}</span>
          <div className="flex items-center gap-2 border border-input rounded-button">
            <button onClick={() => setPassengers((p) => Math.max(1, p - 1))} disabled={passengers <= 1}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-surface-alt disabled:opacity-40 transition-colors rounded-l-button">
              <span>&minus;</span>
            </button>
            <span className="text-sm font-medium w-6 text-center tabular-nums">{passengers}</span>
            <button onClick={() => setPassengers((p) => Math.min(aircraft.capacity, p + 1))} disabled={passengers >= aircraft.capacity}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-surface-alt disabled:opacity-40 transition-colors rounded-r-button">
              <span>+</span>
            </button>
          </div>
        </div>

        {/* Price breakdown */}
        {calculating && (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-surface-alt rounded w-full" />
            <div className="h-4 bg-surface-alt rounded w-3/4" />
          </div>
        )}

        {priceResult && !calculating && (
          <div className="bg-surface-base rounded-card p-3 space-y-2 text-sm">
            {priceResult.legs.map((leg, i) => (
              <div key={i} className="flex justify-between text-muted-foreground">
                <span>{leg.originCode} → {leg.destCode}</span>
                <div className="text-right">
                  <span className="text-xs">{leg.distanceKm} km · {Math.floor(leg.durationMin / 60)}h {leg.durationMin % 60}m</span>
                  <span className="ml-2 font-medium text-foreground">{formatCurrency(leg.price)}</span>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-muted-foreground">
              <span>{t("platformFee")} (8%)</span>
              <span>{formatCurrency(priceResult.platformFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-brand-secondary text-base">
              <span>{t("total")}</span>
              <span className="font-mono">{formatCurrency(priceResult.grandTotal)}</span>
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div className="space-y-2 pt-1">
          <Link
            href={`/solicitar?aircraft=${aircraft.id}`}
            className="block"
          >
            <Button
              className="w-full bg-gradient-primary text-white font-heading font-semibold rounded-button h-12 text-base hover:opacity-90 transition-opacity"
            >
              <Plane className="size-5 mr-2" />
              {t("bookFlight")}
            </Button>
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            <Link href="/solicitar" className="text-brand-primary hover:underline">
              {t("needQuote")} →
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Availability calendar
function AvailabilityCalendar({ aircraft }: { aircraft: AircraftDetail }) {
  const t = useTranslations("aircraft");
  const now = new Date();
  const blockedSet = new Set(
    aircraft.blockedDates.map((bd) => new Date(bd.date).toISOString().split("T")[0])
  );

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-semibold text-brand-secondary">{t("availability")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1].map((monthOffset) => {
          const date = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
          const year = date.getFullYear();
          const month = date.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const firstDay = new Date(year, month, 1).getDay();
          const monthName = date.toLocaleString("es-AR", { month: "long", year: "numeric" });

          return (
            <div key={monthOffset} className="border border-surface-border rounded-card p-4">
              <p className="font-heading font-semibold text-sm text-center mb-3 capitalize">{monthName}</p>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
                {["D", "L", "M", "X", "J", "V", "S"].map((d) => (
                  <span key={d} className="font-medium">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: firstDay }).map((_, i) => <span key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayDate = new Date(year, month, i + 1);
                  const dateStr = dayDate.toISOString().split("T")[0];
                  const isPast = dayDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const isBlocked = blockedSet.has(dateStr);

                  return (
                    <span
                      key={i}
                      className={cn(
                        "flex items-center justify-center h-7 w-7 mx-auto rounded-full text-xs",
                        isPast && "text-muted-foreground/40",
                        isBlocked && !isPast && "bg-muted text-muted-foreground line-through",
                        !isPast && !isBlocked && "hover:bg-brand-primary/10 text-foreground cursor-default",
                      )}
                    >
                      {i + 1}
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground justify-center">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-muted inline-block" /> Bloqueado</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-brand-primary/20 inline-block" /> Disponible</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AircraftDetailClientProps {
  aircraft: AircraftDetail;
}

export function AircraftDetailClient({ aircraft }: AircraftDetailClientProps) {
  const t = useTranslations("aircraft");

  const specs = [
    { label: t("capacity"), value: `Hasta ${aircraft.capacity} pasajeros`, icon: Users },
    { label: t("cruiseSpeed"), value: `${aircraft.cruiseSpeedKmh} km/h`, icon: Zap },
    { label: t("hourlyRate"), value: `${formatCurrency(aircraft.hourlyRate)}/hora`, icon: Star },
    { label: t("minHours"), value: `${aircraft.minBookingHours} hora${aircraft.minBookingHours !== 1 ? "s" : ""} mín.`, icon: Clock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-28 lg:pb-10">
      {/* Back link */}
      <Link href="/aviones" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-primary transition-colors mb-4">
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          {/* Gallery */}
          <ImageGallery images={aircraft.images} model={aircraft.model} />

          {/* Title & Operator */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-heading text-3xl font-bold text-brand-secondary">{aircraft.model}</h1>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                  <MapPin className="size-4 text-brand-primary" />
                  <span>{aircraft.baseAirportName} ({aircraft.baseAirport})</span>
                </div>
              </div>
              <Badge variant="outline" className="text-sm shrink-0">
                {aircraft.type === "PLANE" ? "✈ Avión" : "🚁 Helicóptero"}
              </Badge>
            </div>

            {/* Operator */}
            <div className="flex items-center gap-3 p-3 bg-surface-base rounded-card border border-surface-border">
              <div className="w-10 h-10 rounded-full bg-brand-secondary/10 flex items-center justify-center shrink-0">
                <Plane className="size-5 text-brand-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {aircraft.operator.companyName || aircraft.operator.name}
                </p>
                <p className="text-xs text-muted-foreground">{aircraft.operator.name}</p>
              </div>
              {aircraft.operator.verified && (
                <Badge className="bg-brand-success text-white border-0 text-xs gap-1 shrink-0">
                  <Shield className="size-3" />
                  Verificado
                </Badge>
              )}
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3">
            {specs.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-white border border-surface-border rounded-card">
                <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="size-4 text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-semibold text-sm text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Amenities */}
          {aircraft.amenities.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-heading text-xl font-semibold text-brand-secondary">{t("amenities")}</h2>
              <div className="flex flex-wrap gap-2">
                {aircraft.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="text-sm px-3 py-1">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {aircraft.description && (
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-semibold text-brand-secondary">{t("about")}</h2>
              <p className="text-muted-foreground leading-relaxed">{aircraft.description}</p>
            </div>
          )}

          {/* Operator description */}
          {aircraft.operator.description && (
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-semibold text-brand-secondary">{t("aboutOperator")}</h2>
              <p className="text-muted-foreground leading-relaxed">{aircraft.operator.description}</p>
            </div>
          )}

          {/* Availability calendar */}
          <AvailabilityCalendar aircraft={aircraft} />

          {/* Special offers */}
          {aircraft.offers.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-brand-secondary">{t("specialOffers")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aircraft.offers.slice(0, 4).map((offer) => (
                  <SpecialOfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Booking sidebar (sticky on desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <BookingSidebar aircraft={aircraft} />
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-surface-border p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xl font-bold font-mono text-brand-primary">{formatCurrency(aircraft.hourlyRate)}<span className="text-sm font-normal text-muted-foreground">/hora</span></p>
          <p className="text-xs text-muted-foreground">{aircraft.model}</p>
        </div>
        <Link href={`/solicitar?aircraft=${aircraft.id}`}>
          <Button className="bg-gradient-primary text-white font-heading font-semibold rounded-button hover:opacity-90 transition-opacity">
            <Plane className="size-4 mr-1" />
            {t("bookFlight")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
