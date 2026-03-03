import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateTripPrice } from "@/lib/flight-calculator";

export async function POST(request: Request) {
  try {
    const { aircraftId, legs } = await request.json();
    // legs: Array<{ originCode: string, destCode: string }>

    if (!aircraftId || !legs?.length) {
      return NextResponse.json({ error: "aircraftId and legs required" }, { status: 400 });
    }

    const aircraft = await prisma.aircraft.findUnique({ where: { id: aircraftId } });
    if (!aircraft) return NextResponse.json({ error: "Aircraft not found" }, { status: 404 });

    // Import airports to get coordinates
    const { searchAirports } = await import("@/lib/airports");

    const resolvedLegs: { originLat: number; originLng: number; destLat: number; destLng: number; originCode: string; destCode: string }[] = [];

    for (const leg of legs) {
      const originResults = searchAirports(leg.originCode);
      const destResults = searchAirports(leg.destCode);
      const origin = originResults.find((a) => a.code === leg.originCode);
      const dest = destResults.find((a) => a.code === leg.destCode);

      if (!origin?.lat || !origin?.lng || !dest?.lat || !dest?.lng) {
        return NextResponse.json({ error: `Unknown airport: ${!origin ? leg.originCode : leg.destCode}` }, { status: 400 });
      }

      resolvedLegs.push({
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: dest.lat,
        destLng: dest.lng,
        originCode: leg.originCode,
        destCode: leg.destCode,
      });
    }

    const result = calculateTripPrice(
      resolvedLegs,
      aircraft.cruiseSpeedKmh,
      aircraft.hourlyRate,
      aircraft.minBookingHours
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error calculating trip:", error);
    return NextResponse.json({ error: "Error calculating trip" }, { status: 500 });
  }
}
