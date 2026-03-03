import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { AircraftCard, type AircraftPreview } from "@/components/aircraft/AircraftCard";
import { Plane } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("helicoptersTitle"), description: t("helicoptersDescription") };
}

async function getHelicopters(): Promise<AircraftPreview[]> {
  const aircraft = await prisma.aircraft.findMany({
    where: { isActive: true, type: "HELICOPTER" },
    include: {
      operator: {
        select: { id: true, name: true, companyName: true, verified: true },
      },
    },
    orderBy: { hourlyRate: "asc" },
  });

  return aircraft.map((ac) => ({
    id: ac.id,
    type: ac.type as "PLANE" | "HELICOPTER",
    model: ac.model,
    capacity: ac.capacity,
    images: ac.images,
    hourlyRate: ac.hourlyRate,
    baseAirport: ac.baseAirport,
    baseAirportName: ac.baseAirportName,
    cruiseSpeedKmh: ac.cruiseSpeedKmh,
    amenities: ac.amenities,
    operator: {
      name: ac.operator.name,
      companyName: ac.operator.companyName,
      verified: ac.operator.verified,
    },
  }));
}

export default async function HelicopterosPage() {
  const t = await getTranslations("aircraft");
  const aircraft = await getHelicopters();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-secondary mb-2">
          {t("helicoptersTitle")}
        </h1>
        <p className="text-muted-foreground text-lg">{t("helicoptersSubtitle")}</p>
      </div>

      {/* Grid */}
      {aircraft.length === 0 ? (
        <div className="text-center py-20">
          <Plane className="size-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-muted-foreground">{t("noAircraft")}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {aircraft.map((ac) => (
            <AircraftCard key={ac.id} aircraft={ac} />
          ))}
        </div>
      )}
    </div>
  );
}
