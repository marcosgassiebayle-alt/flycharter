import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;

        if (bookingId) {
          // Update booking
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: "CONFIRMED",
              stripeSessionId: session.id,
              stripePaymentIntentId: session.payment_intent as string,
            },
          });

          // Get booking with offer
          const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { offer: true },
          });

          // Create chat room
          await prisma.chatRoom.create({
            data: { bookingId },
          });

          // Update offer if applicable
          if (booking?.offerId) {
            await prisma.offer.update({
              where: { id: booking.offerId },
              data: { status: "COMPLETED" },
            });
          }
        }
        break;
      }
      case "account.updated": {
        const account = event.data.object;
        if (account.charges_enabled) {
          await prisma.operator.updateMany({
            where: { stripeAccountId: account.id },
            data: { stripeOnboarded: true },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 400 }
    );
  }
}
