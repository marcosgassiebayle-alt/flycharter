import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { AircraftDetailClient } from "./AircraftDetailClient";

async function getAircraft(id: string) {
  const aircraft = await prisma.aircraft.findUnique({
    where: { id, isActive: true },
    include: {
      operator: {
        select: { id: true, name: true, companyName: true, verified: true, description: true, profileImage: true },
      },
      blockedDates: { orderBy: { date: "asc" } },
      locations: { orderBy: { date: "asc" } },
      offers: {
        where: { status: "ACTIVE" },
        select: {
          id: true, slug: true, category: true, vehicleType: true,
          origin: true, originCode: true, destination: true, destinationCode: true,
          departureAt: true, basePrice: true, minPrice: true, isEmptyLeg: true,
          isLastMinute: true, isSharedFlight: true, availableSeats: true, pricePerSeat: true,
          originalPrice: true, discountLabel: true, urgencyLevel: true, expiresAt: true,
          featured: true, aircraft: { select: { model: true, capacity: true, images: true } },
          operator: { select: { name: true, companyName: true, verified: true } },
        },
      },
    },
  });
  return aircraft;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const aircraft = await getAircraft(id);
  if (!aircraft) return { title: "Aeronave no encontrada" };
  return {
    title: `${aircraft.model} — FlyCharter`,
    description: `${aircraft.model} disponible para charter privado desde ${aircraft.baseAirportName}. $${aircraft.hourlyRate}/hora.`,
  };
}

export default async function AircraftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const aircraft = await getAircraft(id);
  if (!aircraft) notFound();

  // Serialize dates for client
  const serialized = {
    ...aircraft,
    createdAt: aircraft.createdAt.toISOString(),
    updatedAt: aircraft.updatedAt.toISOString(),
    blockedDates: aircraft.blockedDates.map((bd) => ({
      ...bd,
      date: bd.date.toISOString(),
      createdAt: bd.createdAt.toISOString(),
    })),
    locations: aircraft.locations.map((loc) => ({
      ...loc,
      date: loc.date.toISOString(),
      createdAt: loc.createdAt.toISOString(),
    })),
    offers: aircraft.offers.map((o) => ({
      ...o,
      departureAt: o.departureAt.toISOString(),
      expiresAt: o.expiresAt?.toISOString() ?? null,
    })),
  };

  return <AircraftDetailClient aircraft={serialized} />;
}
