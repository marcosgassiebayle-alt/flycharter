import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createConnectAccount, createAccountLink } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const operatorId = (session.user as { id: string }).id;
    const operator = await prisma.operator.findUnique({
      where: { id: operatorId },
    });

    if (!operator) {
      return NextResponse.json({ error: "Operator not found" }, { status: 404 });
    }

    let stripeAccountId = operator.stripeAccountId;

    if (!stripeAccountId) {
      const account = await createConnectAccount(operator.email);
      stripeAccountId = account.id;
      await prisma.operator.update({
        where: { id: operatorId },
        data: { stripeAccountId },
      });
    }

    const accountLink = await createAccountLink(stripeAccountId);

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error connecting Stripe:", error);
    return NextResponse.json(
      { error: "Error connecting Stripe" },
      { status: 500 }
    );
  }
}
