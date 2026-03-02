import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CreateBidSchema } from "@/lib/validators";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bids = await prisma.bid.findMany({
      where: { requestId: id },
      include: {
        operator: {
          select: { id: true, name: true, companyName: true, verified: true },
        },
        aircraft: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bids });
  } catch (error) {
    console.error("Error fetching bids:", error);
    return NextResponse.json(
      { error: "Error fetching bids" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = CreateBidSchema.parse({ ...body, requestId: id });
    const operatorId = (session.user as { id: string }).id;

    // Check no duplicate bid
    const existing = await prisma.bid.findUnique({
      where: {
        requestId_operatorId: {
          requestId: id,
          operatorId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya enviaste una oferta para esta solicitud" },
        { status: 400 }
      );
    }

    const bid = await prisma.bid.create({
      data: {
        requestId: id,
        operatorId,
        aircraftId: validated.aircraftId,
        price: validated.price,
        message: validated.message,
        departureAt: new Date(validated.departureAt),
        returnAt: validated.returnAt ? new Date(validated.returnAt) : null,
      },
      include: {
        operator: {
          select: { id: true, name: true, companyName: true, verified: true },
        },
        aircraft: true,
      },
    });

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error },
        { status: 400 }
      );
    }
    console.error("Error creating bid:", error);
    return NextResponse.json(
      { error: "Error creating bid" },
      { status: 500 }
    );
  }
}
