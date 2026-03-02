import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateRequestSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const email = url.searchParams.get("email");
    const vehicleType = url.searchParams.get("vehicleType");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    else where.status = "OPEN";
    if (email) {
      where.customerEmail = email;
      delete where.status;
    }
    if (vehicleType) where.vehicleType = vehicleType;

    const requests = await prisma.flightRequest.findMany({
      where,
      include: {
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Error fetching requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CreateRequestSchema.parse(body);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const flightRequest = await prisma.flightRequest.create({
      data: {
        customerEmail: validated.customerEmail,
        customerName: validated.customerName,
        customerPhone: validated.customerPhone,
        vehicleType: validated.vehicleType as "PLANE" | "HELICOPTER" | undefined,
        category: validated.category as "TOUR" | "ROUND_TRIP" | "ONE_WAY" | "RETURN",
        origin: validated.origin,
        originCode: validated.originCode,
        destination: validated.destination,
        destinationCode: validated.destinationCode,
        departureDate: new Date(validated.departureDate),
        returnDate: validated.returnDate
          ? new Date(validated.returnDate)
          : null,
        passengersCount: validated.passengersCount,
        budgetMin: validated.budgetMin,
        budgetMax: validated.budgetMax,
        notes: validated.notes,
        expiresAt,
      },
    });

    return NextResponse.json(flightRequest, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error },
        { status: 400 }
      );
    }
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Error creating request" },
      { status: 500 }
    );
  }
}
