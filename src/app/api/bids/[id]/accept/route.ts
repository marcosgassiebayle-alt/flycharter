import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bid = await prisma.bid.findUnique({
      where: { id },
      include: {
        request: true,
        operator: true,
        aircraft: true,
      },
    });

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    if (bid.status !== "PENDING") {
      return NextResponse.json(
        { error: "Bid is no longer available" },
        { status: 400 }
      );
    }

    const platformFee = bid.price * 0.08;
    const operatorAmount = bid.price - platformFee;
    const totalAmount = bid.price + platformFee;

    // Update bid status
    await prisma.bid.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    // Reject other bids
    await prisma.bid.updateMany({
      where: {
        requestId: bid.requestId,
        id: { not: id },
        status: "PENDING",
      },
      data: { status: "REJECTED" },
    });

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bidId: id,
        customerEmail: bid.request.customerEmail,
        customerName: bid.request.customerName,
        customerPhone: bid.request.customerPhone,
        passengersCount: bid.request.passengersCount,
        totalAmount,
        platformFee,
        operatorAmount,
      },
    });

    // Update request status
    await prisma.flightRequest.update({
      where: { id: bid.requestId },
      data: { status: "BOOKED" },
    });

    return NextResponse.json({
      booking,
      checkoutUrl: `/checkout/bid/${id}`,
    });
  } catch (error) {
    console.error("Error accepting bid:", error);
    return NextResponse.json(
      { error: "Error accepting bid" },
      { status: 500 }
    );
  }
}
