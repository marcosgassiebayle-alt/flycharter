"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { searchAirports, type Airport } from "@/lib/airports";
import { calculateCurrentPrice } from "@/lib/pricing";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plane,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AircraftForm = {
  type: "PLANE" | "HELICOPTER";
  model: string;
  capacity: number;
  yearBuilt: number;
  registration: string;
  description: string;
  images: string[];
  amenities: string[];
};

type TierRow = { daysBeforeDeparture: number; discountPercent: number };

const AMENITY_OPTIONS = [
  "WiFi",
  "Catering",
  "Bar",
  "TV",
  "Aire acondicionado",
  "Baño",
  "Asientos reclinables",
  "USB",
];

export default function PublishPage() {
  const t = useTranslations("operator");
  const tSearch = useTranslations("search");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — Aircraft
  const [addingNew, setAddingNew] = useState(true);
  const [aircraft, setAircraft] = useState<AircraftForm>({
    type: "PLANE",
    model: "",
    capacity: 6,
    yearBuilt: 2020,
    registration: "",
    description: "",
    images: [""],
    amenities: [],
  });

  // Step 2 — Flight
  const [category, setCategory] = useState<string>("ONE_WAY");
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureAt, setDepartureAt] = useState("");
  const [returnAt, setReturnAt] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [notes, setNotes] = useState("");
  const [originOpen, setOriginOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [originQuery, setOriginQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");

  type FlightLegForm = { origin: Airport | null; destination: Airport | null; departureAt: string; originOpen: boolean; destOpen: boolean; originQuery: string; destQuery: string };
  const [legs, setLegs] = useState<FlightLegForm[]>([{ origin: null, destination: null, departureAt: "", originOpen: false, destOpen: false, originQuery: "", destQuery: "" }]);

  function updateFlightLeg(index: number, patch: Partial<FlightLegForm>) {
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, ...patch } : leg)));
  }

  function addFlightLeg() {
    const prevLeg = legs[legs.length - 1];
    setLegs((prev) => [...prev, { origin: prevLeg?.destination ?? null, destination: null, departureAt: "", originOpen: false, destOpen: false, originQuery: "", destQuery: "" }]);
  }

  function removeFlightLeg(index: number) {
    setLegs((prev) => prev.filter((_, i) => i !== index));
  }

  // Step 3 — Pricing
  const [basePrice, setBasePrice] = useState<number>(0);
  const [isEmptyLeg, setIsEmptyLeg] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [discountType, setDiscountType] = useState<string>("TIERED");
  const [tiers, setTiers] = useState<TierRow[]>([
    { daysBeforeDeparture: 14, discountPercent: 10 },
    { daysBeforeDeparture: 7, discountPercent: 25 },
    { daysBeforeDeparture: 3, discountPercent: 40 },
    { daysBeforeDeparture: 1, discountPercent: 55 },
  ]);
  const [maxDiscount, setMaxDiscount] = useState(50);
  const [startDaysBefore, setStartDaysBefore] = useState(14);
  const [curveExponent, setCurveExponent] = useState(2);

  const toggleAmenity = (amenity: string) => {
    setAircraft((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const discountRules =
        discountType === "TIERED"
          ? tiers
          : discountType === "LINEAR"
            ? { maxDiscountPercent: maxDiscount, startDaysBefore }
            : {
                maxDiscountPercent: maxDiscount,
                startDaysBefore,
                curve: curveExponent,
              };

      const firstLeg = legs[0];
      const legsPayload = legs.length > 1 ? legs.map((leg, i) => ({
        legOrder: i + 1,
        origin: leg.origin?.name || "",
        originCode: leg.origin?.code || null,
        destination: leg.destination?.name || "",
        destinationCode: leg.destination?.code || null,
        departureAt: leg.departureAt,
      })) : undefined;

      const body = {
        aircraft,
        category,
        vehicleType: aircraft.type,
        origin: firstLeg?.origin?.name || "",
        originCode: firstLeg?.origin?.code,
        originLat: firstLeg?.origin?.lat,
        originLng: firstLeg?.origin?.lng,
        destination: firstLeg?.destination?.name,
        destinationCode: firstLeg?.destination?.code,
        destinationLat: firstLeg?.destination?.lat,
        destinationLng: firstLeg?.destination?.lng,
        departureAt: firstLeg?.departureAt,
        returnAt: returnAt || undefined,
        basePrice,
        minPrice: isEmptyLeg ? minPrice : basePrice,
        isEmptyLeg,
        discountType: isEmptyLeg ? discountType : undefined,
        discountRules: isEmptyLeg ? discountRules : undefined,
        cancellationPolicy,
        notes,
        legs: legsPayload,
      };

      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/panel/ofertas");
      }
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  };

  const getPricePreview = () => {
    if (!isEmptyLeg || !basePrice) return [];
    const departure = legs[0]?.departureAt
      ? new Date(legs[0].departureAt)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const rules =
      discountType === "TIERED"
        ? tiers
        : discountType === "LINEAR"
          ? { maxDiscountPercent: maxDiscount, startDaysBefore }
          : {
              maxDiscountPercent: maxDiscount,
              startDaysBefore,
              curve: curveExponent,
            };

    const days = [14, 10, 7, 5, 3, 1];
    return days.map((d) => {
      const fakeNow = new Date(
        departure.getTime() - d * 24 * 60 * 60 * 1000
      );
      const result = calculateCurrentPrice(
        basePrice,
        minPrice,
        departure,
        rules,
        true,
        fakeNow
      );
      return { days: d, price: result.currentPrice, discount: result.discountPercent };
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-heading font-bold text-2xl mb-6">{t("publish")}</h1>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                s === step
                  ? "bg-brand-primary text-white"
                  : s < step
                    ? "bg-brand-success text-white"
                    : "bg-surface-alt text-muted-foreground"
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            <span className="text-sm font-medium hidden sm:block">
              {s === 1 ? t("step1") : s === 2 ? t("step2") : t("step3")}
            </span>
            {s < 3 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Aircraft */}
      {step === 1 && (
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="font-heading">{t("step1")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              {(["PLANE", "HELICOPTER"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setAircraft((prev) => ({ ...prev, type }))
                  }
                  className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                    aircraft.type === type
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                      : "border-surface-border hover:border-brand-primary/50"
                  }`}
                >
                  {type === "PLANE" ? "✈️ " + tSearch("plane") : "🚁 " + tSearch("helicopter")}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t("aircraftModel")}</Label>
                <Input
                  value={aircraft.model}
                  onChange={(e) =>
                    setAircraft((prev) => ({ ...prev, model: e.target.value }))
                  }
                  placeholder="Cessna Citation CJ3"
                />
              </div>
              <div>
                <Label>{t("aircraftCapacity")}</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={aircraft.capacity}
                  onChange={(e) =>
                    setAircraft((prev) => ({
                      ...prev,
                      capacity: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div>
                <Label>{t("aircraftYear")}</Label>
                <Input
                  type="number"
                  min={1990}
                  max={2026}
                  value={aircraft.yearBuilt}
                  onChange={(e) =>
                    setAircraft((prev) => ({
                      ...prev,
                      yearBuilt: parseInt(e.target.value) || 2020,
                    }))
                  }
                />
              </div>
              <div>
                <Label>{t("aircraftRegistration")}</Label>
                <Input
                  value={aircraft.registration}
                  onChange={(e) =>
                    setAircraft((prev) => ({
                      ...prev,
                      registration: e.target.value,
                    }))
                  }
                  placeholder="LV-ABC"
                />
              </div>
            </div>

            <div>
              <Label>{t("aircraftDescription")}</Label>
              <Textarea
                value={aircraft.description}
                onChange={(e) =>
                  setAircraft((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div>
              <Label>{t("aircraftImages")}</Label>
              <div className="space-y-2">
                {aircraft.images.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={url}
                      onChange={(e) => {
                        const imgs = [...aircraft.images];
                        imgs[i] = e.target.value;
                        setAircraft((prev) => ({ ...prev, images: imgs }));
                      }}
                      placeholder="https://..."
                    />
                    {aircraft.images.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const imgs = aircraft.images.filter(
                            (_, idx) => idx !== i
                          );
                          setAircraft((prev) => ({ ...prev, images: imgs }));
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-brand-error" />
                      </Button>
                    )}
                  </div>
                ))}
                {aircraft.images.length < 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setAircraft((prev) => ({
                        ...prev,
                        images: [...prev.images, ""],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> {t("addImage")}
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label>{t("aircraftAmenities")}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AMENITY_OPTIONS.map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      aircraft.amenities.includes(amenity)
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-white text-gray-700 border-surface-border hover:border-brand-primary/50"
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Flight */}
      {step === 2 && (
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="font-heading">{t("step2")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>{t("flightCategory")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TOUR">Paseo</SelectItem>
                  <SelectItem value="ONE_WAY">Solo ida</SelectItem>
                  <SelectItem value="ROUND_TRIP">Ida y vuelta</SelectItem>
                  <SelectItem value="RETURN">Vuelta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Multi-leg rows */}
            <div className="space-y-4">
              {legs.map((leg, index) => (
                <div key={index} className="border border-surface-border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    {legs.length > 1 && (
                      <span className="text-xs font-semibold text-brand-primary">
                        Tramo {index + 1}
                      </span>
                    )}
                    {legs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFlightLeg(index)}
                        className="text-muted-foreground hover:text-brand-error transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>{t("origin")}</Label>
                      <Popover open={leg.originOpen} onOpenChange={(o) => updateFlightLeg(index, { originOpen: o })}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <MapPin className="h-4 w-4 mr-2 shrink-0" />
                            {leg.origin
                              ? `${leg.origin.city} (${leg.origin.code})`
                              : tSearch("selectOrigin")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-72">
                          <Command>
                            <CommandInput
                              placeholder={tSearch("searchAirport")}
                              value={leg.originQuery}
                              onValueChange={(v) => updateFlightLeg(index, { originQuery: v })}
                            />
                            <CommandList>
                              <CommandEmpty>{tSearch("noResults")}</CommandEmpty>
                              <CommandGroup>
                                {searchAirports(leg.originQuery || "").map((ap) => (
                                  <CommandItem
                                    key={ap.code}
                                    value={`${ap.code} ${ap.city} ${ap.name}`}
                                    onSelect={() => updateFlightLeg(index, { origin: ap, originOpen: false })}
                                  >
                                    <span className="font-semibold mr-2">{ap.code}</span>
                                    {ap.city}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {category !== "TOUR" && (
                      <div>
                        <Label>{t("destination")}</Label>
                        <Popover open={leg.destOpen} onOpenChange={(o) => updateFlightLeg(index, { destOpen: o })}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <MapPin className="h-4 w-4 mr-2 shrink-0" />
                              {leg.destination
                                ? `${leg.destination.city} (${leg.destination.code})`
                                : tSearch("selectDestination")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-72">
                            <Command>
                              <CommandInput
                                placeholder={tSearch("searchAirport")}
                                value={leg.destQuery}
                                onValueChange={(v) => updateFlightLeg(index, { destQuery: v })}
                              />
                              <CommandList>
                                <CommandEmpty>{tSearch("noResults")}</CommandEmpty>
                                <CommandGroup>
                                  {searchAirports(leg.destQuery || "").map((ap) => (
                                    <CommandItem
                                      key={ap.code}
                                      value={`${ap.code} ${ap.city} ${ap.name}`}
                                      onSelect={() => updateFlightLeg(index, { destination: ap, destOpen: false })}
                                    >
                                      <span className="font-semibold mr-2">{ap.code}</span>
                                      {ap.city}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>{t("departureDateTime")}</Label>
                    <Input
                      type="datetime-local"
                      value={leg.departureAt}
                      onChange={(e) => updateFlightLeg(index, { departureAt: e.target.value })}
                    />
                  </div>
                </div>
              ))}

              {legs.length < 5 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addFlightLeg}
                  className={cn("text-brand-primary hover:text-brand-primary font-medium gap-1.5")}
                >
                  <Plus className="h-4 w-4" />
                  Agregar tramo
                </Button>
              )}
            </div>

            {category === "ROUND_TRIP" && (
              <div>
                <Label>{t("returnDateTime")}</Label>
                <Input
                  type="datetime-local"
                  value={returnAt}
                  onChange={(e) => setReturnAt(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label>{t("cancellationPolicy")}</Label>
              <Textarea
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Label>{t("additionalNotes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Pricing */}
      {step === 3 && (
        <div className="space-y-6">
          <Card className="rounded-card">
            <CardHeader>
              <CardTitle className="font-heading">{t("step3")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>{t("basePrice")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={basePrice || ""}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  placeholder="10000"
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={isEmptyLeg}
                  onCheckedChange={setIsEmptyLeg}
                />
                <Label>{t("isEmptyLeg")}</Label>
              </div>

              {isEmptyLeg && (
                <>
                  <div>
                    <Label>{t("minPrice")}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={minPrice || ""}
                      onChange={(e) =>
                        setMinPrice(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div>
                    <Label>{t("discountType")}</Label>
                    <Select
                      value={discountType}
                      onValueChange={setDiscountType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIERED">{t("tiered")}</SelectItem>
                        <SelectItem value="LINEAR">{t("linear")}</SelectItem>
                        <SelectItem value="EXPONENTIAL">
                          {t("exponential")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {discountType === "TIERED" && (
                    <div>
                      <div className="space-y-2">
                        {tiers.map((tier, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Input
                                type="number"
                                min={0}
                                value={tier.daysBeforeDeparture}
                                onChange={(e) => {
                                  const newTiers = [...tiers];
                                  newTiers[i] = {
                                    ...newTiers[i],
                                    daysBeforeDeparture:
                                      parseInt(e.target.value) || 0,
                                  };
                                  setTiers(newTiers);
                                }}
                                placeholder={t("daysBeforeDeparture")}
                              />
                            </div>
                            <div className="flex-1">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={tier.discountPercent}
                                onChange={(e) => {
                                  const newTiers = [...tiers];
                                  newTiers[i] = {
                                    ...newTiers[i],
                                    discountPercent:
                                      parseInt(e.target.value) || 0,
                                  };
                                  setTiers(newTiers);
                                }}
                                placeholder={t("discountPercent")}
                              />
                            </div>
                            <span className="text-muted-foreground">%</span>
                            {tiers.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setTiers(tiers.filter((_, idx) => idx !== i))
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setTiers([
                              ...tiers,
                              { daysBeforeDeparture: 0, discountPercent: 0 },
                            ])
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" /> {t("addTier")}
                        </Button>
                      </div>
                    </div>
                  )}

                  {(discountType === "LINEAR" ||
                    discountType === "EXPONENTIAL") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>{t("maxDiscount")}</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={maxDiscount}
                          onChange={(e) =>
                            setMaxDiscount(parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div>
                        <Label>{t("startDaysBefore")}</Label>
                        <Input
                          type="number"
                          min={1}
                          value={startDaysBefore}
                          onChange={(e) =>
                            setStartDaysBefore(parseInt(e.target.value) || 1)
                          }
                        />
                      </div>
                      {discountType === "EXPONENTIAL" && (
                        <div>
                          <Label>{t("curveExponent")}</Label>
                          <Input
                            type="number"
                            min={0.1}
                            step={0.1}
                            value={curveExponent}
                            onChange={(e) =>
                              setCurveExponent(
                                parseFloat(e.target.value) || 2
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Price Preview */}
          {isEmptyLeg && basePrice > 0 && (
            <Card className="rounded-card">
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  {t("pricePreview")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">
                          {t("daysBeforeDeparture")}
                        </th>
                        <th className="text-right py-2 px-3">
                          {t("discountPercent")}
                        </th>
                        <th className="text-right py-2 px-3">
                          {t("basePrice")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPricePreview().map((row) => (
                        <tr key={row.days} className="border-b last:border-0">
                          <td className="py-2 px-3">{row.days} {t("days")}</td>
                          <td className="py-2 px-3 text-right">
                            {row.discount > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-brand-primary/10 text-brand-primary"
                              >
                                -{row.discount}%
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold">
                            {formatCurrency(row.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="rounded-button"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> {t("previous")}
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            className="bg-gradient-primary text-white rounded-button font-heading font-semibold"
          >
            {t("next")} <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-primary text-white rounded-button font-heading font-semibold"
          >
            {loading ? "..." : t("publishOffer")}
          </Button>
        )}
      </div>
    </div>
  );
}
