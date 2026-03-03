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

    const { date, airportCode, airportName, lat, lng } = await request.json();
    const dateObj = new Date(date);

    const location = await prisma.aircraftLocation.upsert({
      where: { aircraftId_date: { aircraftId: id, date: dateObj } },
      create: { aircraftId: id, date: dateObj, airportCode, airportName, lat, lng },
      update: { airportCode, airportName, lat, lng },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json({ error: "Error updating location" }, { status: 500 });
  }
}
