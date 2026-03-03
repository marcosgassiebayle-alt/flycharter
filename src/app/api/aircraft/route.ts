import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // PLANE | HELICOPTER
    const minCapacity = url.searchParams.get("minCapacity");
    const baseAirport = url.searchParams.get("baseAirport");
    const availableDate = url.searchParams.get("availableDate"); // YYYY-MM-DD
    const maxHourlyRate = url.searchParams.get("maxHourlyRate");

    const where: Record<string, unknown> = { isActive: true };
    if (type) where.type = type;
    if (minCapacity) where.capacity = { gte: parseInt(minCapacity) };
    if (baseAirport) where.baseAirport = baseAirport;
    if (maxHourlyRate) where.hourlyRate = { lte: parseFloat(maxHourlyRate) };

    let aircraft = await prisma.aircraft.findMany({
      where,
      include: {
        operator: {
          select: { id: true, name: true, companyName: true, verified: true, profileImage: true },
        },
        blockedDates: true,
      },
      orderBy: { hourlyRate: "asc" },
    });

    // Filter by available date (not blocked)
    if (availableDate) {
      const checkDate = new Date(availableDate);
      aircraft = aircraft.filter((ac) => {
        return !ac.blockedDates.some((bd) => {
          const bdDate = new Date(bd.date);
          return bdDate.toDateString() === checkDate.toDateString();
        });
      });
    }

    return NextResponse.json({ aircraft });
  } catch (error) {
    console.error("Error fetching aircraft:", error);
    return NextResponse.json({ error: "Error fetching aircraft" }, { status: 500 });
  }
}
