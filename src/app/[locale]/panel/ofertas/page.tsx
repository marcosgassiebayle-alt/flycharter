"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import useSWR from "swr";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  MapPin,
  Calendar,
  Pause,
  Play,
  Trash2,
  Edit,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusColors: Record<string, string> = {
  ACTIVE: "bg-brand-success text-white",
  PAUSED: "bg-brand-warning text-gray-900",
  DRAFT: "bg-surface-alt text-gray-700",
  COMPLETED: "bg-brand-secondary text-white",
  CANCELLED: "bg-brand-error text-white",
};

export default function MyOffersPage() {
  const t = useTranslations("offers");
  const tOp = useTranslations("operator");
  const { data, isLoading, mutate } = useSWR("/api/offers?mine=true", fetcher);
  const offers = data?.offers || [];

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await fetch(`/api/offers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    mutate();
  };

  const deleteOffer = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/offers/${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl">{tOp("myOffers")}</h1>
        <Link href="/panel/publicar">
          <Button className="bg-gradient-primary text-white font-heading font-semibold rounded-button">
            <PlusCircle className="h-4 w-4 mr-2" /> {tOp("publish")}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-card" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <Card className="rounded-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t("noOffers")}</p>
            <Link href="/panel/publicar">
              <Button className="bg-gradient-primary text-white rounded-button">
                {tOp("publish")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {offers.map((offer: Record<string, unknown>) => (
            <Card key={offer.id as string} className="rounded-card hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        className={
                          statusColors[offer.status as string] || "bg-gray-100"
                        }
                      >
                        {t(
                          (offer.status as string).toLowerCase() as
                            | "active"
                            | "paused"
                            | "draft"
                            | "completed"
                            | "cancelled"
                        )}
                      </Badge>
                      {(offer.isEmptyLeg as boolean) && (
                        <Badge className="bg-brand-primary text-white">
                          Empty Leg
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-lg font-heading font-bold">
                      <MapPin className="h-4 w-4 text-brand-primary shrink-0" />
                      <span className="truncate">
                        {offer.origin as string}
                        {offer.destination
                          ? ` → ${offer.destination}`
                          : " · Paseo"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(
                          new Date(offer.departureAt as string),
                          "d MMM yyyy",
                          { locale: es }
                        )}
                      </span>
                      <span className="font-mono font-semibold text-brand-primary">
                        {formatCurrency(offer.basePrice as number)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        toggleStatus(offer.id as string, offer.status as string)
                      }
                      title={
                        offer.status === "ACTIVE"
                          ? t("pause")
                          : t("activate")
                      }
                    >
                      {offer.status === "ACTIVE" ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteOffer(offer.id as string)}
                    >
                      <Trash2 className="h-4 w-4 text-brand-error" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
