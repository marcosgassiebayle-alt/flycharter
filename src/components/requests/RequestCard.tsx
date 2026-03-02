"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, MessageSquare, ArrowRight, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export type FlightRequestPreview = {
  id: string;
  status: "OPEN" | "BOOKED" | "EXPIRED" | "CANCELLED";
  origin: string;
  originCode: string | null;
  destination: string | null;
  destinationCode: string | null;
  departureDate: string;
  passengersCount: number;
  budgetMin: number | null;
  budgetMax: number | null;
  bidsCount: number;
  customerName: string;
  legs?: Array<{
    legOrder: number;
    originCode: string | null;
    destinationCode: string | null;
  }>;
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-brand-success text-white border-0",
  BOOKED: "bg-brand-secondary text-white border-0",
  EXPIRED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-brand-error text-white border-0",
};

interface RequestCardProps {
  request: FlightRequestPreview;
}

export function RequestCard({ request }: RequestCardProps) {
  const t = useTranslations("requests");

  const departureDate = new Date(request.departureDate);
  const formattedDate = departureDate.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const statusKey = request.status.toLowerCase() as "open" | "booked" | "expired" | "cancelled";

  return (
    <Card className="overflow-hidden rounded-card border-surface-border hover:shadow-lg transition-all duration-300">
      <CardContent className="space-y-4 pt-5 pb-5">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <Badge className={STATUS_STYLES[request.status] || ""}>
            {t(statusKey)}
          </Badge>
          {request.bidsCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-brand-primary font-medium">
              <MessageSquare className="size-3.5" />
              {request.bidsCount} {t("bids")}
            </div>
          )}
          {request.bidsCount === 0 && (
            <span className="text-xs text-muted-foreground">{t("noBids")}</span>
          )}
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 text-brand-primary shrink-0" />
          <span className="font-medium truncate">
            {request.legs && request.legs.length > 1 ? (
              request.legs
                .slice()
                .sort((a, b) => a.legOrder - b.legOrder)
                .map((leg, i) => (
                  <span key={i}>
                    {i === 0 && leg.originCode}
                    {leg.destinationCode && (
                      <span> &rarr; {leg.destinationCode}</span>
                    )}
                  </span>
                ))
            ) : (
              <>
                {request.origin}
                {request.originCode && ` (${request.originCode})`}
                {request.destination && (
                  <>
                    <span className="text-muted-foreground"> &rarr; </span>
                    {request.destination}
                    {request.destinationCode && ` (${request.destinationCode})`}
                  </>
                )}
              </>
            )}
          </span>
        </div>

        {/* Date & Passengers */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {request.passengersCount}
          </span>
        </div>

        {/* Budget range */}
        {(request.budgetMin || request.budgetMax) && (
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="size-3.5 text-brand-accent shrink-0" />
            <span className="text-muted-foreground">{t("budget")}:</span>
            <span className="font-medium">
              {request.budgetMin && request.budgetMax
                ? `${formatCurrency(request.budgetMin)} - ${formatCurrency(request.budgetMax)}`
                : request.budgetMin
                  ? `${formatCurrency(request.budgetMin)}+`
                  : request.budgetMax
                    ? `${formatCurrency(request.budgetMax)}`
                    : ""}
            </span>
          </div>
        )}

        {/* View details link */}
        <div className="border-t border-surface-border pt-3">
          <Link
            href={`/solicitud/${request.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary-dark transition-colors"
          >
            {t("viewDetails")}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
