import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const operatorId = (session.user as { id: string }).id;

    const bids = await prisma.bid.findMany({
      where: { operatorId },
      include: {
        request: true,
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
