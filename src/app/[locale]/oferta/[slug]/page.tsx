import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { OfferDetailClient } from "./OfferDetailClient";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const mockOffer = {
  id: "p1",
  slug: "buenos-aires-bariloche-2026-03-15-a1b2",
  vehicleType: "PLANE" as const,
  category: "ONE_WAY" as const,
  status: "ACTIVE" as const,
  origin: "Buenos Aires",
  originCode: "AEP",
  destination: "San Carlos de Bariloche",
  destinationCode: "BRC",
  departureAt: "2026-03-15T10:00:00Z",
  returnAt: null,
  basePrice: 12500,
  minPrice: 8500,
  isEmptyLeg: true,
  discountType: "linear",
  discountRules: {
    maxDiscountPercent: 32,
    startDaysBefore: 30,
  },
  featured: true,
  cancellationPolicy:
    "Cancelacion gratuita hasta 72 horas antes de la salida. Despues de ese plazo, se retiene el 50% del monto total.",
  notes: "Vuelo de reposicion. Posibilidad de flexibilidad horaria. Equipaje limitado a 20kg por pasajero.",
  aircraft: {
    id: "ac1",
    model: "Beechcraft King Air 350",
    type: "PLANE" as const,
    capacity: 8,
    yearBuilt: 2019,
    registration: "LV-ABC",
    description:
      "Turbohelice bimotor presurizado con cabina amplia y confortable. Ideal para vuelos regionales de hasta 4 horas.",
    images: [],
    amenities: [
      "WiFi a bordo",
      "Asientos de cuero reclinables",
      "Aire acondicionado",
      "Toilette privado",
      "Catering disponible",
    ],
  },
  operator: {
    id: "op1",
    name: "Carlos Menendez",
    companyName: "Andes Aviation",
    verified: true,
    description:
      "Operador con mas de 15 anos de experiencia en vuelos charter por toda Argentina. Flota moderna y mantenimiento certificado.",
    profileImage: null,
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${mockOffer.origin} - ${mockOffer.destination || "Tour"} | FlyCharter`,
    description: `Vuelo privado de ${mockOffer.origin} a ${mockOffer.destination || "tour"} en ${mockOffer.aircraft.model}. Desde $${mockOffer.minPrice} USD.`,
  };
}

export default async function OfferDetailPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("offers");
  const tPricing = await getTranslations("pricing");

  return <OfferDetailClient offer={mockOffer} />;
}
