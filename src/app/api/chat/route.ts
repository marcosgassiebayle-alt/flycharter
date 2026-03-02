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

    const rooms = await prisma.chatRoom.findMany({
      where: {
        booking: {
          OR: [
            { offer: { operatorId } },
            { bid: { operatorId } },
          ],
        },
      },
      include: {
        booking: {
          include: {
            offer: true,
            bid: { include: { request: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                senderType: "customer",
                readAt: null,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedRooms = rooms.map((room) => {
      const booking = room.booking;
      const offer = booking.offer;
      const request = booking.bid?.request;
      const origin = offer?.origin || request?.origin || "";
      const destination = offer?.destination || request?.destination || "";

      return {
        id: room.id,
        customerName: booking.customerName,
        flightInfo: destination ? `${origin} → ${destination}` : origin,
        unreadCount: room._count.messages,
        lastMessage: room.messages[0]?.content || "",
      };
    });

    return NextResponse.json({ rooms: formattedRooms });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json(
      { error: "Error fetching chat rooms" },
      { status: 500 }
    );
  }
}
