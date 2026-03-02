"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { format } from "date-fns";
import { searchAirports, type Airport } from "@/lib/airports";
import { Search, MapPin, Calendar, Users, Plane, CircleDot, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type VehicleType = "PLANE" | "HELICOPTER";

type Leg = {
  origin: Airport | null;
  destination: Airport | null;
  date: Date | undefined;
  originQuery: string;
  destinationQuery: string;
  originOpen: boolean;
  destinationOpen: boolean;
  dateOpen: boolean;
};

function newLeg(prefillOrigin?: Airport | null): Leg {
  return {
    origin: prefillOrigin ?? null,
    destination: null,
    date: undefined,
    originQuery: "",
    destinationQuery: "",
    originOpen: false,
    destinationOpen: false,
    dateOpen: false,
  };
}

export function SearchBar() {
  const t = useTranslations("search");
  const router = useRouter();

  const [legs, setLegs] = useState<Leg[]>([newLeg()]);
  const [vehicleType, setVehicleType] = useState<VehicleType>("PLANE");
  const [passengers, setPassengers] = useState(1);

  function updateLeg(index: number, patch: Partial<Leg>) {
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, ...patch } : leg)));
  }

  function addLeg() {
    const prevLeg = legs[legs.length - 1];
    setLegs((prev) => [...prev, newLeg(prevLeg?.destination)]);
  }

  function removeLeg(index: number) {
    setLegs((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const first = legs[0];
    const params = new URLSearchParams();
    if (first?.origin) params.set("origin", first.origin.code);
    if (first?.destination) params.set("destination", first.destination.code);
    if (first?.date) params.set("date", format(first.date, "yyyy-MM-dd"));
    if (passengers > 1) params.set("passengers", String(passengers));

    const basePath = vehicleType === "PLANE" ? "/aviones" : "/helicopteros";
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-container shadow-2xl p-4 md:p-6 w-full max-w-5xl mx-auto">
      {/* Legs */}
      <div className="space-y-3 mb-4">
        {legs.map((leg, index) => {
          const originResults = leg.originQuery.length > 0 ? searchAirports(leg.originQuery) : [];
          const destinationResults = leg.destinationQuery.length > 0 ? searchAirports(leg.destinationQuery) : [];

          return (
            <div key={index} className="flex flex-col md:flex-row md:items-center gap-2">
              {/* Leg number badge */}
              {legs.length > 1 && (
                <div className="flex items-center gap-2 md:gap-0 shrink-0">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                </div>
              )}

              {/* Origin */}
              <div className="flex-1 min-w-0">
                {index === 0 && (
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("origin")}</label>
                )}
                <Popover open={leg.originOpen} onOpenChange={(o) => updateLeg(index, { originOpen: o })}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal h-10 rounded-button", !leg.origin && "text-muted-foreground")}
                    >
                      <MapPin className="size-4 text-brand-primary shrink-0" />
                      <span className="truncate">{leg.origin ? `${leg.origin.city} (${leg.origin.code})` : t("selectOrigin")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder={t("searchAirport")} value={leg.originQuery} onValueChange={(v) => updateLeg(index, { originQuery: v })} />
                      <CommandList>
                        <CommandEmpty>{t("noResults")}</CommandEmpty>
                        <CommandGroup>
                          {originResults.map((airport) => (
                            <CommandItem key={airport.code} value={airport.code} onSelect={() => updateLeg(index, { origin: airport, originOpen: false, originQuery: "" })}>
                              <MapPin className="size-4 text-muted-foreground shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{airport.city} ({airport.code})</span>
                                <span className="text-xs text-muted-foreground">{airport.name}</span>
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
              <div className="flex-1 min-w-0">
                {index === 0 && (
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("destination")}</label>
                )}
                <Popover open={leg.destinationOpen} onOpenChange={(o) => updateLeg(index, { destinationOpen: o })}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal h-10 rounded-button", !leg.destination && "text-muted-foreground")}
                    >
                      <MapPin className="size-4 text-brand-secondary shrink-0" />
                      <span className="truncate">{leg.destination ? `${leg.destination.city} (${leg.destination.code})` : t("selectDestination")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder={t("searchAirport")} value={leg.destinationQuery} onValueChange={(v) => updateLeg(index, { destinationQuery: v })} />
                      <CommandList>
                        <CommandEmpty>{t("noResults")}</CommandEmpty>
                        <CommandGroup>
                          {destinationResults.map((airport) => (
                            <CommandItem key={airport.code} value={airport.code} onSelect={() => updateLeg(index, { destination: airport, destinationOpen: false, destinationQuery: "" })}>
                              <MapPin className="size-4 text-muted-foreground shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{airport.city} ({airport.code})</span>
                                <span className="text-xs text-muted-foreground">{airport.name}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date */}
              <div className="flex-1 min-w-0">
                {index === 0 && (
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("date")}</label>
                )}
                <Popover open={leg.dateOpen} onOpenChange={(o) => updateLeg(index, { dateOpen: o })}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal h-10 rounded-button", !leg.date && "text-muted-foreground")}
                    >
                      <Calendar className="size-4 text-brand-accent shrink-0" />
                      <span className="truncate">{leg.date ? format(leg.date, "dd/MM/yyyy") : t("selectDate")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={leg.date}
                      onSelect={(day) => updateLeg(index, { date: day, dateOpen: false })}
                      disabled={(day) => day < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Remove leg button */}
              {legs.length > 1 && (
                <div className={index === 0 ? "mt-5" : ""}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLeg(index)}
                    className="h-10 w-10 text-muted-foreground hover:text-brand-error shrink-0"
                    aria-label={t("removeLeg")}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add leg button */}
        {legs.length < 5 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLeg}
            className="text-brand-primary hover:text-brand-primary font-medium gap-1.5"
          >
            <Plus className="size-4" />
            {t("addLeg")}
          </Button>
        )}
      </div>

      {/* Global controls row */}
      <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-2 border-t border-surface-border pt-4">
        {/* Vehicle Type Pills */}
        <div className="flex-shrink-0">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("type")}</label>
          <div className="flex h-10 rounded-button border border-input overflow-hidden">
            <button
              type="button"
              onClick={() => setVehicleType("PLANE")}
              className={cn("flex items-center gap-1.5 px-3 text-sm font-medium transition-colors", vehicleType === "PLANE" ? "bg-brand-secondary text-white" : "bg-white text-foreground hover:bg-surface-alt")}
            >
              <Plane className="size-4" />
              {t("plane")}
            </button>
            <button
              type="button"
              onClick={() => setVehicleType("HELICOPTER")}
              className={cn("flex items-center gap-1.5 px-3 text-sm font-medium transition-colors", vehicleType === "HELICOPTER" ? "bg-brand-secondary text-white" : "bg-white text-foreground hover:bg-surface-alt")}
            >
              <CircleDot className="size-4" />
              {t("helicopter")}
            </button>
          </div>
        </div>

        {/* Passengers */}
        <div className="flex-shrink-0">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("passengers")}</label>
          <div className="flex items-center h-10 rounded-button border border-input bg-white">
            <button
              type="button"
              onClick={() => setPassengers((p) => Math.max(1, p - 1))}
              disabled={passengers <= 1}
              className="flex items-center justify-center w-9 h-full text-foreground hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-button"
            >
              <span className="text-lg leading-none">&minus;</span>
            </button>
            <div className="flex items-center gap-1 px-2 min-w-[3rem] justify-center">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium tabular-nums">{passengers}</span>
            </div>
            <button
              type="button"
              onClick={() => setPassengers((p) => Math.min(20, p + 1))}
              disabled={passengers >= 20}
              className="flex items-center justify-center w-9 h-full text-foreground hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-r-button"
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex-shrink-0 flex-1 md:flex-initial">
          <Button
            onClick={handleSubmit}
            size="lg"
            className="bg-gradient-primary text-white w-full md:w-auto h-10 rounded-button font-semibold hover:opacity-90 transition-opacity"
          >
            <Search className="size-4" />
            {t("search")}
          </Button>
        </div>
      </div>
    </div>
  );
}
