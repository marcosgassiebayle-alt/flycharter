import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
});

export async function createConnectAccount(email: string) {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  return account;
}

export async function createAccountLink(accountId: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/panel/pagos?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/panel/pagos?success=true`,
    type: "account_onboarding",
  });
  return accountLink;
}

export async function createCheckoutSession(params: {
  offerId?: string;
  bidId?: string;
  bookingId: string;
  amount: number;
  platformFee: number;
  operatorStripeAccountId: string;
  customerEmail: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: params.description,
          },
          unit_amount: Math.round(params.amount * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: Math.round(params.platformFee * 100),
      transfer_data: {
        destination: params.operatorStripeAccountId,
      },
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      bookingId: params.bookingId,
      offerId: params.offerId ?? "",
      bidId: params.bidId ?? "",
    },
  });
  return session;
}
