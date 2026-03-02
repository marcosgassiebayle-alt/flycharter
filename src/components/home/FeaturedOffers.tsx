"use client";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/routing";
import { OfferCard } from "@/components/offers/OfferCard";
import { Plane, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const sampleOffers: OfferPreview[] = [
  // Planes
  {
    id: "p1",
    slug: "buenos-aires-bariloche-2026-03-15-a1b2",
    vehicleType: "PLANE",
    category: "ONE_WAY",
    origin: "Buenos Aires",
    originCode: "AEP",
    destination: "San Carlos de Bariloche",
    destinationCode: "BRC",
    departureAt: "2026-03-15T10:00:00Z",
    basePrice: 12500,
    minPrice: 8500,
    isEmptyLeg: true,
    featured: true,
    aircraft: {
      model: "Beechcraft King Air 350",
      capacity: 8,
      images: ["/images/aircraft/king-air-350.jpg"],
    },
    operator: {
      name: "Carlos Menendez",
      companyName: "Andes Aviation",
      verified: true,
    },
  },
  {
    id: "p2",
    slug: "buenos-aires-mendoza-2026-03-20-c3d4",
    vehicleType: "PLANE",
    category: "ROUND_TRIP",
    origin: "Buenos Aires",
    originCode: "AEP",
    destination: "Mendoza",
    destinationCode: "MDZ",
    departureAt: "2026-03-20T08:30:00Z",
    basePrice: 15000,
    minPrice: 15000,
    isEmptyLeg: false,
    featured: true,
    aircraft: {
      model: "Learjet 45",
      capacity: 6,
      images: ["/images/aircraft/learjet-45.jpg"],
    },
    operator: {
      name: "Diego Ferraro",
      companyName: "Pampas Jets",
      verified: true,
    },
  },
  {
    id: "p3",
    slug: "cordoba-iguazu-2026-04-02-e5f6",
    vehicleType: "PLANE",
    category: "ONE_WAY",
    origin: "Cordoba",
    originCode: "COR",
    destination: "Puerto Iguazu",
    destinationCode: "IGR",
    departureAt: "2026-04-02T14:00:00Z",
    basePrice: 9800,
    minPrice: 6500,
    isEmptyLeg: true,
    featured: false,
    aircraft: {
      model: "Cessna Citation CJ3",
      capacity: 7,
      images: ["/images/aircraft/citation-cj3.jpg"],
    },
    operator: {
      name: "Martin Lopez",
      companyName: "Patagonia Air",
      verified: true,
    },
  },
  // Helicopters
  {
    id: "h1",
    slug: "buenos-aires-tigre-2026-03-18-g7h8",
    vehicleType: "HELICOPTER",
    category: "TOUR",
    origin: "Buenos Aires",
    originCode: "HBA",
    destination: null,
    destinationCode: null,
    departureAt: "2026-03-18T11:00:00Z",
    basePrice: 3200,
    minPrice: 3200,
    isEmptyLeg: false,
    featured: true,
    aircraft: {
      model: "Airbus H125",
      capacity: 5,
      images: ["/images/aircraft/h125.jpg"],
    },
    operator: {
      name: "Laura Gomez",
      companyName: "HeliBA",
      verified: true,
    },
  },
  {
    id: "h2",
    slug: "san-fernando-punta-del-este-2026-03-22-i9j0",
    vehicleType: "HELICOPTER",
    category: "ONE_WAY",
    origin: "San Fernando",
    originCode: "SFN",
    destination: "Puerto Madero",
    destinationCode: "HPR",
    departureAt: "2026-03-22T16:00:00Z",
    basePrice: 2800,
    minPrice: 1900,
    isEmptyLeg: true,
    featured: true,
    aircraft: {
      model: "Bell 407",
      capacity: 6,
      images: ["/images/aircraft/bell-407.jpg"],
    },
    operator: {
      name: "Ricardo Ortiz",
      companyName: "Sky Transfer AR",
      verified: true,
    },
  },
  {
    id: "h3",
    slug: "buenos-aires-city-tour-2026-04-05-k1l2",
    vehicleType: "HELICOPTER",
    category: "TOUR",
    origin: "Puerto Madero",
    originCode: "HPR",
    destination: null,
    destinationCode: null,
    departureAt: "2026-04-05T09:30:00Z",
    basePrice: 4500,
    minPrice: 4500,
    isEmptyLeg: false,
    featured: false,
    aircraft: {
      model: "Robinson R66",
      capacity: 4,
      images: ["/images/aircraft/r66.jpg"],
    },
    operator: {
      name: "Laura Gomez",
      companyName: "HeliBA",
      verified: true,
    },
  },
];

export function FeaturedOffers() {
  const t = useTranslations("offers");
  const tCommon = useTranslations("common");

  const planeOffers = sampleOffers.filter((o) => o.vehicleType === "PLANE");
  const helicopterOffers = sampleOffers.filter((o) => o.vehicleType === "HELICOPTER");

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-secondary">
            {t("title")}
          </h2>
        </div>

        <Tabs defaultValue="planes" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="h-11 p-1 bg-surface-alt rounded-full">
              <TabsTrigger
                value="planes"
                className="rounded-full px-6 data-[state=active]:bg-brand-secondary data-[state=active]:text-white"
              >
                <Plane className="size-4 mr-1.5" />
                {tCommon("plane")}
              </TabsTrigger>
              <TabsTrigger
                value="helicopters"
                className="rounded-full px-6 data-[state=active]:bg-brand-secondary data-[state=active]:text-white"
              >
                <CircleDot className="size-4 mr-1.5" />
                {tCommon("helicopter")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="planes">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {planeOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-button"
              >
                <Link href="/aviones">
                  {t("viewAll")} &rarr;
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="helicopters">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {helicopterOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-button"
              >
                <Link href="/helicopteros">
                  {t("viewAll")} &rarr;
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
