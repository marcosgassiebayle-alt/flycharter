"use client";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/routing";
import { OfferCard } from "@/components/offers/OfferCard";
import { Plane, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import type { OfferPreview } from "@/components/offers/OfferCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function OfferSkeletons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-card border border-surface-border overflow-hidden">
          <Skeleton className="h-52 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="border-t border-surface-border pt-3 flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeaturedOffers() {
  const t = useTranslations("offers");
  const tCommon = useTranslations("common");

  const { data, isLoading } = useSWR<{ offers: OfferPreview[] }>(
    "/api/offers?limit=10",
    fetcher
  );

  const allOffers = data?.offers ?? [];
  const planeOffers = allOffers.filter((o) => o.vehicleType === "PLANE").slice(0, 3);
  const helicopterOffers = allOffers.filter((o) => o.vehicleType === "HELICOPTER").slice(0, 3);

  return (
    <section className="py-16 md:py-24 bg-surface-base">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-secondary mb-3">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {tCommon("requestCtaDesc")}
          </p>
        </div>

        <Tabs defaultValue="planes" className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="h-12 p-1.5 bg-surface-alt rounded-full shadow-sm">
              <TabsTrigger
                value="planes"
                className="rounded-full px-6 h-9 data-[state=active]:bg-brand-secondary data-[state=active]:text-white font-heading font-semibold gap-2"
              >
                <Plane className="size-4" />
                {tCommon("plane")}
              </TabsTrigger>
              <TabsTrigger
                value="helicopters"
                className="rounded-full px-6 h-9 data-[state=active]:bg-brand-secondary data-[state=active]:text-white font-heading font-semibold gap-2"
              >
                <CircleDot className="size-4" />
                {tCommon("helicopter")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="planes">
            {isLoading ? (
              <OfferSkeletons />
            ) : planeOffers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {planeOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Plane className="size-12 mx-auto mb-3 opacity-30" />
                <p>{t("noOffers")}</p>
              </div>
            )}
            <div className="flex justify-center mt-10">
              <Button asChild variant="outline" size="lg" className="rounded-button font-semibold px-8">
                <Link href="/aviones">{t("viewAll")} →</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="helicopters">
            {isLoading ? (
              <OfferSkeletons />
            ) : helicopterOffers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {helicopterOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CircleDot className="size-12 mx-auto mb-3 opacity-30" />
                <p>{t("noOffers")}</p>
              </div>
            )}
            <div className="flex justify-center mt-10">
              <Button asChild variant="outline" size="lg" className="rounded-button font-semibold px-8">
                <Link href="/helicopteros">{t("viewAll")} →</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
