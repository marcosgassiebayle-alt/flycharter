"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ChevronRight } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MessagesPage() {
  const t = useTranslations("chat");
  const { data, isLoading } = useSWR("/api/chat", fetcher);
  const rooms = data?.rooms || [];

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl mb-6">{t("title")}</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-card" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card className="rounded-card">
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-lg mb-2">
              {t("noRooms")}
            </h3>
            <p className="text-muted-foreground text-sm">{t("noRoomsDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rooms.map(
            (room: {
              id: string;
              customerName: string;
              flightInfo: string;
              unreadCount: number;
            }) => (
              <Link key={room.id} href={`/panel/mensajes/${room.id}`}>
                <Card className="rounded-card hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-white font-semibold">
                        {room.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-heading font-semibold">
                          {room.customerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {room.flightInfo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {room.unreadCount > 0 && (
                        <Badge className="bg-brand-primary text-white">
                          {room.unreadCount} {t("unread")}
                        </Badge>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
