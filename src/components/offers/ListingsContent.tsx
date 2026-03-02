"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { searchAirports, type Airport } from "@/lib/airports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { OfferGrid } from "./OfferGrid";
import { OfferFilters } from "./OfferFilters";
import { RequestCard, type FlightRequestPreview } from "@/components/requests/RequestCard";
import type { OfferPreview } from "./OfferCard";
import {
  Search,
  MapPin,
  ListFilter,
  FileText,
  Plane,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ListingsContentProps {
  vehicleType: "PLANE" | "HELICOPTER";
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function OfferSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-card border border-surface-border overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="border-t border-surface-border pt-3 flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RequestSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-card border border-surface-border p-5 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

function CompactSearchBar({ vehicleType }: { vehicleType: "PLANE" | "HELICOPTER" }) {
  const t = useTranslations("search");
  const router = useRouter();
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");

  const originResults = originQuery.length > 0 ? searchAirports(originQuery) : [];
  const destinationResults = destinationQuery.length > 0 ? searchAirports(destinationQuery) : [];

  function handleSearch() {
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin.code);
    if (destination) params.set("destination", destination.code);
    const basePath = vehicleType === "PLANE" ? "/aviones" : "/helicopteros";
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
  }

  return (
    <div className="bg-white rounded-card border border-surface-border shadow-sm p-3 md:p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Origin */}
        <Popover open={originOpen} onOpenChange={setOriginOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal h-9 rounded-button",
                !origin && "text-muted-foreground"
              )}
            >
              <MapPin className="size-4 text-brand-primary shrink-0" />
              <span className="truncate">
                {origin ? `${origin.city} (${origin.code})` : t("selectOrigin")}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
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

        {/* Destination */}
        <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal h-9 rounded-button",
                !destination && "text-muted-foreground"
              )}
            >
              <MapPin className="size-4 text-brand-secondary shrink-0" />
              <span className="truncate">
                {destination ? `${destination.city} (${destination.code})` : t("selectDestination")}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
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

        {/* Search button */}
        <Button
          onClick={handleSearch}
          className="bg-gradient-primary text-white rounded-button font-semibold hover:opacity-90 transition-opacity h-9 px-5"
        >
          <Search className="size-4" />
          {t("search")}
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  const t = useTranslations("offers");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-alt mb-5">
        <Plane className="size-7 text-muted-foreground/50" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-brand-secondary mb-2">
        {t("noOffers")}
      </h3>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        {t("noOffersDesc")}
      </p>
      <Button asChild className="bg-gradient-primary text-white rounded-button font-semibold hover:opacity-90 transition-opacity">
        <Link href="/solicitar">
          <PlusCircle className="size-4" />
          {t("createRequest")}
        </Link>
      </Button>
    </div>
  );
}

function RequestsEmptyState() {
  const t = useTranslations("offers");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-alt mb-5">
        <FileText className="size-7 text-muted-foreground/50" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-brand-secondary mb-2">
        {t("noOffers")}
      </h3>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        {t("noOffersDesc")}
      </p>
      <Button asChild className="bg-gradient-primary text-white rounded-button font-semibold hover:opacity-90 transition-opacity">
        <Link href="/solicitar">
          <PlusCircle className="size-4" />
          {t("createRequest")}
        </Link>
      </Button>
    </div>
  );
}

export function ListingsContent({ vehicleType }: ListingsContentProps) {
  const t = useTranslations("offers");
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const offersUrl = `/api/offers?vehicleType=${vehicleType}${queryString ? `&${queryString}` : ""}`;
  const requestsUrl = `/api/requests?vehicleType=${vehicleType}`;

  const {
    data: offersData,
    isLoading: offersLoading,
  } = useSWR<{ offers: OfferPreview[] }>(offersUrl, fetcher);

  const {
    data: requestsData,
    isLoading: requestsLoading,
  } = useSWR<{ requests: FlightRequestPreview[] }>(requestsUrl, fetcher);

  const offers = offersData?.offers ?? [];
  const requests = requestsData?.requests ?? [];

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div>
      {/* Compact search bar */}
      <CompactSearchBar vehicleType={vehicleType} />

      <Tabs defaultValue="offers" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="h-11 p-1 bg-surface-alt rounded-full">
            <TabsTrigger
              value="offers"
              className="rounded-full px-5 data-[state=active]:bg-brand-secondary data-[state=active]:text-white"
            >
              <ListFilter className="size-4 mr-1.5" />
              {t("published")}
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="rounded-full px-5 data-[state=active]:bg-brand-secondary data-[state=active]:text-white"
            >
              <FileText className="size-4 mr-1.5" />
              {t("openRequests")}
            </TabsTrigger>
          </TabsList>

          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden rounded-button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <ListFilter className="size-4" />
          </Button>
        </div>

        {/* Offers tab */}
        <TabsContent value="offers">
          <div className="flex gap-8">
            {/* Sidebar filters - desktop */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-white rounded-card border border-surface-border p-5">
                <OfferFilters />
              </div>
            </div>

            {/* Mobile filters */}
            {showMobileFilters && (
              <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setShowMobileFilters(false)}>
                <div
                  className="absolute right-0 top-0 h-full w-80 bg-white p-5 overflow-y-auto shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold text-brand-secondary">Filtros</h3>
                    <Button variant="ghost" size="icon-xs" onClick={() => setShowMobileFilters(false)}>
                      <span className="text-lg">&times;</span>
                    </Button>
                  </div>
                  <OfferFilters />
                </div>
              </div>
            )}

            {/* Offer grid */}
            <div className="flex-1 min-w-0">
              {offersLoading ? (
                <OfferSkeletonGrid />
              ) : offers.length > 0 ? (
                <OfferGrid offers={offers} />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </TabsContent>

        {/* Requests tab */}
        <TabsContent value="requests">
          {requestsLoading ? (
            <RequestSkeletonGrid />
          ) : requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <RequestsEmptyState />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
