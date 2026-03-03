import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { SpecialOfferCard, type SpecialOffer } from "@/components/offers/SpecialOfferCard";
import { Flame } from "lucide-react";

function computeUrgency(departureAt: Date): string | null {
  const diffHours = (departureAt.getTime() - Date.now()) / 3600000;
  if (diffHours <= 0) return null;
  if (diffHours <= 24) return "high";
  if (diffHours <= 48) return "medium";
  if (diffHours <= 72) return "low";
  return null;
}

async function getSpecialOffers(): Promise<SpecialOffer[]> {
  const offers = await prisma.offer.findMany({
    where: {
      status: "ACTIVE",
      departureAt: { gte: new Date() },
      OR: [
        { isEmptyLeg: true },
        { isLastMinute: true },
        { isSharedFlight: true },
      ],
    },
    include: {
      aircraft: { select: { model: true, capacity: true, images: true } },
      operator: { select: { name: true, companyName: true, verified: true } },
    },
    orderBy: { departureAt: "asc" },
  });

  return offers.map((o) => ({
    id: o.id,
    slug: o.slug,
    vehicleType: o.vehicleType as "PLANE" | "HELICOPTER",
    origin: o.origin,
    originCode: o.originCode,
    destination: o.destination,
    destinationCode: o.destinationCode,
    departureAt: o.departureAt.toISOString(),
    basePrice: o.basePrice,
    minPrice: o.minPrice,
    originalPrice: o.originalPrice,
    discountLabel: o.discountLabel,
    isEmptyLeg: o.isEmptyLeg,
    isLastMinute: o.isLastMinute,
    isSharedFlight: o.isSharedFlight,
    availableSeats: o.availableSeats,
    pricePerSeat: o.pricePerSeat,
    urgencyLevel: computeUrgency(o.departureAt),
    expiresAt: o.expiresAt?.toISOString() ?? null,
    aircraft: o.aircraft,
    operator: o.operator,
    featured: o.featured,
  }));
}

export async function generateMetadata() {
  return {
    title: "Ofertas Especiales — FlyCharter",
    description: "Empty legs, vuelos de último minuto y asientos compartidos a precios únicos.",
  };
}

export default async function OfertasPage() {
  const t = await getTranslations("specialOffers");
  const offers = await getSpecialOffers();

  const emptyLegs = offers.filter((o) => o.isEmptyLeg);
  const lastMinute = offers.filter((o) => o.isLastMinute);
  const shared = offers.filter((o) => o.isSharedFlight);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-secondary to-[#0d2d3f] py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Flame className="size-4 text-brand-accent" />
            <span className="text-sm font-medium">{t("badge")}</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">{t("title")}</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">{t("subtitle")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-12">
        {offers.length === 0 ? (
          <div className="text-center py-20">
            <Flame className="size-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold text-muted-foreground">{t("noOffers")}</h3>
            <p className="text-muted-foreground mt-2">{t("noOffersDesc")}</p>
          </div>
        ) : (
          <>
            {emptyLegs.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-bold text-brand-secondary mb-6">{t("emptyLegs")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {emptyLegs.map((offer) => <SpecialOfferCard key={offer.id} offer={offer} />)}
                </div>
              </section>
            )}
            {lastMinute.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-bold text-brand-secondary mb-6">{t("lastMinute")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {lastMinute.map((offer) => <SpecialOfferCard key={offer.id} offer={offer} />)}
                </div>
              </section>
            )}
            {shared.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-bold text-brand-secondary mb-6">{t("sharedFlights")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {shared.map((offer) => <SpecialOfferCard key={offer.id} offer={offer} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
