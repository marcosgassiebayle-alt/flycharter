"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import useSWR from "swr";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Send, MapPin, Calendar, Users, DollarSign } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const bidStatusColors: Record<string, string> = {
  PENDING: "bg-brand-warning text-gray-900",
  ACCEPTED: "bg-brand-success text-white",
  REJECTED: "bg-brand-error text-white",
  WITHDRAWN: "bg-surface-alt text-gray-700",
};

export default function BidsPage() {
  const t = useTranslations("operator");
  const tReq = useTranslations("requests");
  const { data: requestsData, isLoading: reqLoading } = useSWR(
    "/api/requests?status=OPEN",
    fetcher
  );
  const { data: bidsData, isLoading: bidsLoading } = useSWR(
    "/api/bids?mine=true",
    fetcher
  );

  const requests = requestsData?.requests || [];
  const bids = bidsData?.bids || [];

  return (
    <div className="space-y-8">
      {/* Open Requests */}
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">
          {t("openRequests")}
        </h2>
        {reqLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-card" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Card className="rounded-card">
            <CardContent className="py-8 text-center text-muted-foreground">
              {tReq("noBids")}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req: { id: string; vehicleType?: string; origin: string; destination?: string; departureDate: string; passengersCount: number; budgetMin?: number; budgetMax?: number }) => (
              <Card key={req.id} className="rounded-card hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-brand-success text-white">
                      {tReq("open")}
                    </Badge>
                    {req.vehicleType && (
                      <Badge variant="outline">
                        {req.vehicleType === "PLANE" ? "✈️" : "🚁"}{" "}
                        {req.vehicleType === "PLANE" ? "Avión" : "Helicóptero"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-heading font-bold text-lg mb-2">
                    <MapPin className="h-4 w-4 text-brand-primary" />
                    {req.origin}
                    {req.destination && ` → ${req.destination}`}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(req.departureDate), "d MMM yyyy", {
                        locale: es,
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {req.passengersCount} pax
                    </span>
                    {(req.budgetMin || req.budgetMax) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {req.budgetMin
                          ? formatCurrency(req.budgetMin)
                          : "?"}{" "}
                        -{" "}
                        {req.budgetMax
                          ? formatCurrency(req.budgetMax)
                          : "?"}
                      </span>
                    )}
                  </div>
                  <Link href={`/solicitud/${req.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-button"
                    >
                      <Send className="h-4 w-4 mr-2" /> {tReq("bidOnRequest")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* My Bids */}
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">
          {t("myBids")}
        </h2>
        {bidsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-card" />
            ))}
          </div>
        ) : bids.length === 0 ? (
          <Card className="rounded-card">
            <CardContent className="py-8 text-center text-muted-foreground">
              {tReq("noBids")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bids.map((bid: { id: string; status: string; price: number; departureAt: string }) => (
              <Card key={bid.id} className="rounded-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={
                          bidStatusColors[bid.status] || "bg-gray-100"
                        }
                      >
                        {bid.status}
                      </Badge>
                    </div>
                    <p className="font-heading font-semibold">
                      {formatCurrency(bid.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(bid.departureAt), "d MMM yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
