import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const operatorId = (session.user as { id: string }).id;
    const aircraft = await prisma.aircraft.findUnique({ where: { id } });
    if (!aircraft || aircraft.operatorId !== operatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { date, reason, unblock } = await request.json();
    const dateObj = new Date(date);

    if (unblock) {
      await prisma.aircraftBlockedDate.deleteMany({
        where: { aircraftId: id, date: dateObj },
      });
      return NextResponse.json({ unblocked: true });
    }

    const blocked = await prisma.aircraftBlockedDate.upsert({
      where: { aircraftId_date: { aircraftId: id, date: dateObj } },
      create: { aircraftId: id, date: dateObj, reason },
      update: { reason },
    });

    return NextResponse.json(blocked);
  } catch (error) {
    console.error("Error managing blocked date:", error);
    return NextResponse.json({ error: "Error managing blocked date" }, { status: 500 });
  }
}
