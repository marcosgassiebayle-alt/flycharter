"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { format } from "date-fns";
import { searchAirports, type Airport } from "@/lib/airports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Calendar } from "@/components/ui/calendar";
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
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Send,
  DollarSign,
  MessageSquare,
  User,
  CheckCircle,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type VehicleType = "PLANE" | "HELICOPTER" | "ANY";
type Category = "TOUR" | "ONE_WAY" | "ROUND_TRIP" | "RETURN";

export default function SolicitarPage() {
  const t = useTranslations("requestForm");
  const router = useRouter();

  // Form state
  const [vehicleType, setVehicleType] = useState<VehicleType>("ANY");
  const [category, setCategory] = useState<Category | "">("");
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [passengers, setPassengers] = useState(1);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [notes, setNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // UI state
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [departureDateOpen, setDepartureDateOpen] = useState(false);
  const [returnDateOpen, setReturnDateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const originResults =
    originQuery.length > 0 ? searchAirports(originQuery) : [];
  const destinationResults =
    destinationQuery.length > 0 ? searchAirports(destinationQuery) : [];

  const showDestination = category !== "TOUR";
  const showReturnDate = category === "ROUND_TRIP";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const payload = {
      vehicleType,
      category,
      originCode: origin?.code ?? null,
      origin: origin ? `${origin.city} (${origin.code})` : "",
      destinationCode: destination?.code ?? null,
      destination: destination
        ? `${destination.city} (${destination.code})`
        : null,
      departureDate: departureDate?.toISOString() ?? null,
      returnDate: returnDate?.toISOString() ?? null,
      passengersCount: passengers,
      budgetMin: budgetMin ? Number(budgetMin) : null,
      budgetMax: budgetMax ? Number(budgetMax) : null,
      notes: notes || null,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit request");
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage(t("errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-16">
        <Card className="rounded-container border-surface-border shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-brand-success to-brand-success/80 p-8 text-center text-white">
            <CheckCircle className="size-16 mx-auto mb-4" />
            <h1 className="font-heading text-3xl font-bold mb-2">
              {t("successTitle")}
            </h1>
            <p className="text-white/90 text-lg max-w-md mx-auto">
              {t("successMessage")}
            </p>
          </div>
          <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => router.push("/mis-solicitudes")}
              className="bg-brand-secondary text-white rounded-button font-semibold hover:bg-brand-secondary-light transition-colors"
            >
              {t("viewRequests")}
              <ArrowRight className="size-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setVehicleType("ANY");
                setCategory("");
                setOrigin(null);
                setDestination(null);
                setDepartureDate(undefined);
                setReturnDate(undefined);
                setPassengers(1);
                setBudgetMin("");
                setBudgetMax("");
                setNotes("");
                setCustomerName("");
                setCustomerEmail("");
                setCustomerPhone("");
              }}
              className="rounded-button font-semibold"
            >
              {t("newRequest")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
      {/* Page header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-primary/10 mb-4">
          <Send className="size-7 text-brand-primary" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-secondary mb-2">
          {t("pageTitle")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t("pageSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Type */}
        <Card className="rounded-card border-surface-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-lg text-brand-secondary flex items-center gap-2">
              <Plane className="size-5 text-brand-primary" />
              {t("vehicleSection")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { value: "PLANE", label: t("plane"), icon: "airplane" },
                  {
                    value: "HELICOPTER",
                    label: t("helicopter"),
                    icon: "helicopter",
                  },
                  { value: "ANY", label: t("any"), icon: "any" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVehicleType(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-card border-2 transition-all duration-200",
                    vehicleType === option.value
                      ? "border-brand-primary bg-brand-primary/5 shadow-sm"
                      : "border-surface-border hover:border-brand-primary/30 bg-white"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                      vehicleType === option.value
                        ? "bg-brand-primary text-white"
                        : "bg-surface-alt text-muted-foreground"
                    )}
                  >
                    <Plane className="size-5" />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      vehicleType === option.value
                        ? "text-brand-primary"
                        : "text-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Flight Details */}
        <Card className="rounded-card border-surface-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-lg text-brand-secondary flex items-center gap-2">
              <MapPin className="size-5 text-brand-primary" />
              {t("flightSection")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("category")}</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as Category)}
              >
                <SelectTrigger className="rounded-button">
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TOUR">{t("tour")}</SelectItem>
                  <SelectItem value="ONE_WAY">{t("oneWay")}</SelectItem>
                  <SelectItem value="ROUND_TRIP">{t("roundTrip")}</SelectItem>
                  <SelectItem value="RETURN">{t("returnOnly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Origin */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("origin")}</Label>
              <Popover open={originOpen} onOpenChange={setOriginOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-button h-10",
                      !origin && "text-muted-foreground"
                    )}
                  >
                    <MapPin className="size-4 text-brand-primary shrink-0" />
                    <span className="truncate">
                      {origin
                        ? `${origin.city} (${origin.code}) - ${origin.name}`
                        : t("selectOrigin")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder={t("searchAirport")}
                      value={originQuery}
                      onValueChange={setOriginQuery}
                    />
                    <CommandList>
                      <CommandEmpty>{t("noAirportResults")}</CommandEmpty>
                      <CommandGroup>
                        {originResults.map((airport) => (
                          <CommandItem
                            key={airport.code}
                            value={airport.code}
                            onSelect={() => {
                              setOrigin(airport);
                              setOriginOpen(false);
                              setOriginQuery("");
                            }}
                          >
                            <MapPin className="size-4 text-muted-foreground shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {airport.city} ({airport.code})
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {airport.name}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Destination */}
            {showDestination && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("destination")}
                </Label>
                <Popover
                  open={destinationOpen}
                  onOpenChange={setDestinationOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-button h-10",
                        !destination && "text-muted-foreground"
                      )}
                    >
                      <MapPin className="size-4 text-brand-secondary shrink-0" />
                      <span className="truncate">
                        {destination
                          ? `${destination.city} (${destination.code}) - ${destination.name}`
                          : t("selectDestination")}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder={t("searchAirport")}
                        value={destinationQuery}
                        onValueChange={setDestinationQuery}
                      />
                      <CommandList>
                        <CommandEmpty>{t("noAirportResults")}</CommandEmpty>
                        <CommandGroup>
                          {destinationResults.map((airport) => (
                            <CommandItem
                              key={airport.code}
                              value={airport.code}
                              onSelect={() => {
                                setDestination(airport);
                                setDestinationOpen(false);
                                setDestinationQuery("");
                              }}
                            >
                              <MapPin className="size-4 text-muted-foreground shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {airport.city} ({airport.code})
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {airport.name}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Dates row */}
            <div
              className={cn(
                "grid gap-4",
                showReturnDate ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
              )}
            >
              {/* Departure Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("departureDate")}
                </Label>
                <Popover
                  open={departureDateOpen}
                  onOpenChange={setDepartureDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-button h-10",
                        !departureDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="size-4 text-brand-primary shrink-0" />
                      {departureDate
                        ? format(departureDate, "PPP")
                        : t("selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={departureDate}
                      onSelect={(date) => {
                        setDepartureDate(date);
                        setDepartureDateOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Return Date */}
              {showReturnDate && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("returnDate")}
                  </Label>
                  <Popover
                    open={returnDateOpen}
                    onOpenChange={setReturnDateOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal rounded-button h-10",
                          !returnDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="size-4 text-brand-secondary shrink-0" />
                        {returnDate
                          ? format(returnDate, "PPP")
                          : t("selectDate")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={(date) => {
                          setReturnDate(date);
                          setReturnDateOpen(false);
                        }}
                        disabled={(date) =>
                          date < (departureDate ?? new Date())
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Passengers */}
        <Card className="rounded-card border-surface-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-lg text-brand-secondary flex items-center gap-2">
              <Users className="size-5 text-brand-primary" />
              {t("passengersSection")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("passengers")}</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full size-10 shrink-0"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  disabled={passengers <= 1}
                >
                  <Minus className="size-4" />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-bold text-brand-secondary">
                    {passengers}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full size-10 shrink-0"
                  onClick={() => setPassengers(Math.min(20, passengers + 1))}
                  disabled={passengers >= 20}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>20</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card className="rounded-card border-surface-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-lg text-brand-secondary flex items-center gap-2">
              <DollarSign className="size-5 text-brand-primary" />
              {t("budgetSection")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("budgetMin")}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="pl-9 rounded-button"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("budgetMax")}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="pl-9 rounded-button"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="rounded-card border-surface-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-lg text-brand-secondary flex items-center gap-2">
              <MessageSquare className="size-5 text-brand-primary" />
              {t("notesSection")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={t("notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="rounded-button resize-none"
            />
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="rounded-card border-surface-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-lg text-brand-secondary flex items-center gap-2">
              <User className="size-5 text-brand-primary" />
              {t("contactSection")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("customerName")}
              </Label>
              <Input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t("customerNamePlaceholder")}
                className="rounded-button"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("customerEmail")}
                </Label>
                <Input
                  required
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t("customerEmailPlaceholder")}
                  className="rounded-button"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("customerPhone")}
                </Label>
                <Input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t("customerPhonePlaceholder")}
                  className="rounded-button"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error message */}
        {errorMessage && (
          <div className="bg-brand-error/10 border border-brand-error/20 rounded-card p-4 text-brand-error text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || !customerName || !customerEmail}
          className="w-full h-12 bg-gradient-primary text-white rounded-button font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {t("submitting")}
            </>
          ) : (
            <>
              <Send className="size-5 mr-2" />
              {t("submit")}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
