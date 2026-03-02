import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { calculateCurrentPrice } from "@/lib/pricing";
import { CreateBookingSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CreateBookingSchema.parse(body);

    let charterPrice: number;
    let operatorStripeAccountId: string;
    let description: string;
    let offerId: string | undefined;
    let bidId: string | undefined;

    if (validated.offerId) {
      const offer = await prisma.offer.findUnique({
        where: { id: validated.offerId },
        include: { operator: true, aircraft: true },
      });

      if (!offer || offer.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "Offer not available" },
          { status: 400 }
        );
      }

      if (!offer.operator.stripeAccountId) {
        return NextResponse.json(
          { error: "Operator not set up for payments" },
          { status: 400 }
        );
      }

      const pricing = calculateCurrentPrice(
        offer.basePrice,
        offer.minPrice,
        offer.departureAt,
        offer.discountRules as Parameters<typeof calculateCurrentPrice>[3],
        offer.isEmptyLeg
      );

      charterPrice = pricing.currentPrice;
      operatorStripeAccountId = offer.operator.stripeAccountId;
      description = `FlyCharter: ${offer.origin}${offer.destination ? ` → ${offer.destination}` : ""} - ${offer.aircraft.model}`;
      offerId = offer.id;
    } else if (validated.bidId) {
      const bid = await prisma.bid.findUnique({
        where: { id: validated.bidId },
        include: { operator: true, aircraft: true, request: true },
      });

      if (!bid || bid.status !== "ACCEPTED") {
        return NextResponse.json(
          { error: "Bid not available" },
          { status: 400 }
        );
      }

      if (!bid.operator.stripeAccountId) {
        return NextResponse.json(
          { error: "Operator not set up for payments" },
          { status: 400 }
        );
      }

      charterPrice = bid.price;
      operatorStripeAccountId = bid.operator.stripeAccountId;
      description = `FlyCharter: ${bid.request.origin}${bid.request.destination ? ` → ${bid.request.destination}` : ""} - ${bid.aircraft.model}`;
      bidId = bid.id;
    } else {
      return NextResponse.json(
        { error: "Must provide offerId or bidId" },
        { status: 400 }
      );
    }

    const platformFee = charterPrice * 0.08;
    const operatorAmount = charterPrice - platformFee;
    const totalAmount = charterPrice + platformFee;

    const booking = await prisma.booking.create({
      data: {
        offerId,
        bidId,
        customerEmail: validated.customerEmail,
        customerName: validated.customerName,
        customerPhone: validated.customerPhone,
        passengersCount: validated.passengersCount,
        totalAmount,
        platformFee,
        operatorAmount,
      },
    });

    const session = await createCheckoutSession({
      offerId,
      bidId,
      bookingId: booking.id,
      amount: totalAmount,
      platformFee,
      operatorStripeAccountId,
      customerEmail: validated.customerEmail,
      description,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/confirmacion/${booking.id}`,
      cancelUrl: offerId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/oferta/${offerId}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/solicitudes`,
    });

    return NextResponse.json({ url: session.url, bookingId: booking.id });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Error creating checkout" },
      { status: 500 }
    );
  }
}
