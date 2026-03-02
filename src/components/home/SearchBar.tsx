"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { format } from "date-fns";
import { searchAirports, type Airport } from "@/lib/airports";
import { Search, MapPin, Calendar, Users, Plane, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type VehicleType = "PLANE" | "HELICOPTER";

export function SearchBar() {
  const t = useTranslations("search");
  const router = useRouter();

  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [vehicleType, setVehicleType] = useState<VehicleType>("PLANE");
  const [passengers, setPassengers] = useState(1);

  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");

  const originResults = originQuery.length > 0 ? searchAirports(originQuery) : [];
  const destinationResults = destinationQuery.length > 0 ? searchAirports(destinationQuery) : [];

  function handleSubmit() {
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin.code);
    if (destination) params.set("destination", destination.code);
    if (date) params.set("date", format(date, "yyyy-MM-dd"));
    if (passengers > 1) params.set("passengers", String(passengers));

    const basePath = vehicleType === "PLANE" ? "/aviones" : "/helicopteros";
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-container shadow-2xl p-4 md:p-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-2">
        {/* Origin */}
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("origin")}
          </label>
          <Popover open={originOpen} onOpenChange={setOriginOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10 rounded-button",
                  !origin && "text-muted-foreground"
                )}
              >
                <MapPin className="size-4 text-brand-primary shrink-0" />
                <span className="truncate">
                  {origin
                    ? `${origin.city} (${origin.code})`
                    : t("selectOrigin")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={t("searchAirport")}
                  value={originQuery}
                  onValueChange={setOriginQuery}
                />
                <CommandList>
                  <CommandEmpty>{t("noResults")}</CommandEmpty>
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
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("destination")}
          </label>
          <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10 rounded-button",
                  !destination && "text-muted-foreground"
                )}
              >
                <MapPin className="size-4 text-brand-secondary shrink-0" />
                <span className="truncate">
                  {destination
                    ? `${destination.city} (${destination.code})`
                    : t("selectDestination")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={t("searchAirport")}
                  value={destinationQuery}
                  onValueChange={setDestinationQuery}
                />
                <CommandList>
                  <CommandEmpty>{t("noResults")}</CommandEmpty>
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

        {/* Date */}
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("date")}
          </label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10 rounded-button",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar className="size-4 text-brand-accent shrink-0" />
                <span className="truncate">
                  {date
                    ? format(date, "dd/MM/yyyy")
                    : t("selectDate")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(day) => {
                  setDate(day);
                  setDateOpen(false);
                }}
                disabled={(day) => day < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Vehicle Type Pills */}
        <div className="flex-shrink-0">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("type")}
          </label>
          <div className="flex h-10 rounded-button border border-input overflow-hidden">
            <button
              type="button"
              onClick={() => setVehicleType("PLANE")}
              className={cn(
                "flex items-center gap-1.5 px-3 text-sm font-medium transition-colors",
                vehicleType === "PLANE"
                  ? "bg-brand-secondary text-white"
                  : "bg-white text-foreground hover:bg-surface-alt"
              )}
            >
              <Plane className="size-4" />
              {t("plane")}
            </button>
            <button
              type="button"
              onClick={() => setVehicleType("HELICOPTER")}
              className={cn(
                "flex items-center gap-1.5 px-3 text-sm font-medium transition-colors",
                vehicleType === "HELICOPTER"
                  ? "bg-brand-secondary text-white"
                  : "bg-white text-foreground hover:bg-surface-alt"
              )}
            >
              <CircleDot className="size-4" />
              {t("helicopter")}
            </button>
          </div>
        </div>

        {/* Passengers */}
        <div className="flex-shrink-0">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("passengers")}
          </label>
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
        <div className="flex-shrink-0 w-full md:w-auto">
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
