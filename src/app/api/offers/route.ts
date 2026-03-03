import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const vehicleType = url.searchParams.get("vehicleType");
    const mine = url.searchParams.get("mine");
    const status = url.searchParams.get("status");
    const category = url.searchParams.get("category");
    const emptyLeg = url.searchParams.get("emptyLeg");
    const featured = url.searchParams.get("featured");
    const limit = url.searchParams.get("limit");
    const sortBy = url.searchParams.get("sortBy");
    const type = url.searchParams.get("type"); // emptyLeg | lastMinute | shared
    const special = url.searchParams.get("special"); // "true" = any special offer

    const where: Record<string, unknown> = {};

    if (mine === "true") {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      where.operatorId = (session.user as { id: string }).id;
    } else {
      where.status = status || "ACTIVE";
    }

    if (vehicleType) where.vehicleType = vehicleType;
    if (category) where.category = category;
    if (emptyLeg === "true") where.isEmptyLeg = true;
    if (featured === "true") where.featured = true;

    // Special offer type filters
    if (type === "emptyLeg") where.isEmptyLeg = true;
    else if (type === "lastMinute") where.isLastMinute = true;
    else if (type === "shared") where.isSharedFlight = true;

    // Special = any of the special offer types
    if (special === "true") {
      where.OR = [
        { isEmptyLeg: true },
        { isLastMinute: true },
        { isSharedFlight: true },
      ];
    }

    let orderBy: Record<string, string> = { departureAt: "asc" };
    if (sortBy === "price_asc") orderBy = { basePrice: "asc" };
    if (sortBy === "price_desc") orderBy = { basePrice: "desc" };
    if (sortBy === "date_asc") orderBy = { departureAt: "asc" };
    if (sortBy === "date_desc") orderBy = { departureAt: "desc" };
    if (sortBy === "newest") orderBy = { createdAt: "desc" };
    if (sortBy === "urgent") orderBy = { departureAt: "asc" };
    // Default for special offers: sort by soonest departure
    if (special === "true" && !sortBy) orderBy = { departureAt: "asc" };

    const offers = await prisma.offer.findMany({
      where,
      include: {
        aircraft: {
          select: { id: true, model: true, capacity: true, images: true, hourlyRate: true },
        },
        operator: {
          select: {
            id: true,
            name: true,
            companyName: true,
            verified: true,
            profileImage: true,
          },
        },
        _count: { select: { bookings: true } },
      },
      orderBy,
      take: limit ? parseInt(limit) : undefined,
    });

    // Calculate urgency dynamically based on departureAt
    const now = Date.now();
    const offersWithUrgency = offers.map((offer) => {
      const diffHours = (offer.departureAt.getTime() - now) / 3600000;
      let dynamicUrgency: string | null = null;
      if (diffHours > 0) {
        if (diffHours <= 24) dynamicUrgency = "high";
        else if (diffHours <= 48) dynamicUrgency = "medium";
        else if (diffHours <= 72) dynamicUrgency = "low";
      }
      return {
        ...offer,
        urgencyLevel: dynamicUrgency ?? offer.urgencyLevel,
      };
    });

    return NextResponse.json({ offers: offersWithUrgency });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Error fetching offers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { aircraft: aircraftData, ...offerData } = body;

    const operatorId = (session.user as { id: string }).id;

    // Create aircraft if new
    let aircraftId = offerData.aircraftId;
    if (!aircraftId && aircraftData) {
      const newAircraft = await prisma.aircraft.create({
        data: {
          operatorId,
          type: aircraftData.type,
          model: aircraftData.model,
          capacity: aircraftData.capacity,
          yearBuilt: aircraftData.yearBuilt,
          registration: aircraftData.registration,
          description: aircraftData.description,
          images: aircraftData.images?.filter((i: string) => i) || [],
          amenities: aircraftData.amenities || [],
        },
      });
      aircraftId = newAircraft.id;
    }

    const slug = generateSlug(
      offerData.originCode || offerData.origin,
      offerData.destinationCode || offerData.destination,
      new Date(offerData.departureAt)
    );

    const offer = await prisma.offer.create({
      data: {
        operatorId,
        aircraftId,
        category: offerData.category,
        vehicleType: offerData.vehicleType,
        origin: offerData.origin,
        originCode: offerData.originCode,
        originLat: offerData.originLat,
        originLng: offerData.originLng,
        destination: offerData.destination,
        destinationCode: offerData.destinationCode,
        destinationLat: offerData.destinationLat,
        destinationLng: offerData.destinationLng,
        departureAt: new Date(offerData.departureAt),
        returnAt: offerData.returnAt ? new Date(offerData.returnAt) : null,
        basePrice: offerData.basePrice,
        minPrice: offerData.minPrice || offerData.basePrice,
        isEmptyLeg: offerData.isEmptyLeg || false,
        isLastMinute: offerData.isLastMinute || false,
        isSharedFlight: offerData.isSharedFlight || false,
        availableSeats: offerData.availableSeats ?? null,
        pricePerSeat: offerData.pricePerSeat ?? null,
        originalPrice: offerData.originalPrice ?? null,
        discountLabel: offerData.discountLabel ?? null,
        expiresAt: offerData.expiresAt ? new Date(offerData.expiresAt) : null,
        discountType: offerData.discountType,
        discountRules: offerData.discountRules,
        cancellationPolicy: offerData.cancellationPolicy,
        notes: offerData.notes,
        slug,
      },
      include: {
        aircraft: true,
        operator: {
          select: { id: true, name: true, companyName: true, verified: true },
        },
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Error creating offer" },
      { status: 500 }
    );
  }
}
