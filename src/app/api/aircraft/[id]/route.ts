import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const aircraft = await prisma.aircraft.findUnique({
      where: { id },
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
            originalPrice: true, discountLabel: true, urgencyLevel: true, expiresAt: true, featured: true,
          },
        },
      },
    });

    if (!aircraft) {
      return NextResponse.json({ error: "Aircraft not found" }, { status: 404 });
    }

    return NextResponse.json({ aircraft });
  } catch (error) {
    console.error("Error fetching aircraft:", error);
    return NextResponse.json({ error: "Error fetching aircraft" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const operatorId = (session.user as { id: string }).id;

    const aircraft = await prisma.aircraft.findUnique({ where: { id } });
    if (!aircraft || aircraft.operatorId !== operatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.aircraft.update({
      where: { id },
      data: {
        hourlyRate: body.hourlyRate,
        baseAirport: body.baseAirport,
        baseAirportName: body.baseAirportName,
        cruiseSpeedKmh: body.cruiseSpeedKmh,
        minBookingHours: body.minBookingHours,
        isActive: body.isActive,
        description: body.description,
        images: body.images,
        amenities: body.amenities,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating aircraft:", error);
    return NextResponse.json({ error: "Error updating aircraft" }, { status: 500 });
  }
}
