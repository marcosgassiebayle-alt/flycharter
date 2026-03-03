import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7); // YYYY-MM

    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // last day of month

    const aircraft = await prisma.aircraft.findUnique({
      where: { id },
      include: {
        blockedDates: {
          where: { date: { gte: startDate, lte: endDate } },
        },
        locations: {
          where: { date: { gte: startDate, lte: endDate } },
        },
      },
    });

    if (!aircraft) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Build day-by-day calendar
    const days: Array<{
      date: string;
      status: "available" | "blocked";
      location: string;
      locationCode: string;
    }> = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const isBlocked = aircraft.blockedDates.some(
        (bd) => new Date(bd.date).toISOString().split("T")[0] === dateStr
      );
      const locationOverride = aircraft.locations.find(
        (loc) => new Date(loc.date).toISOString().split("T")[0] === dateStr
      );

      days.push({
        date: dateStr,
        status: isBlocked ? "blocked" : "available",
        location: locationOverride?.airportName ?? aircraft.baseAirportName,
        locationCode: locationOverride?.airportCode ?? aircraft.baseAirport,
      });
    }

    return NextResponse.json({ days, baseAirport: aircraft.baseAirport, baseAirportName: aircraft.baseAirportName });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Error fetching availability" }, { status: 500 });
  }
}
