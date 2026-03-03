import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { Flame, ArrowRight } from "lucide-react";
import { SpecialOfferCard, type SpecialOffer } from "@/components/offers/SpecialOfferCard";

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
      OR: [{ isEmptyLeg: true }, { isLastMinute: true }, { isSharedFlight: true }],
    },
    include: {
      aircraft: { select: { model: true, capacity: true, images: true } },
      operator: { select: { name: true, companyName: true, verified: true } },
    },
    orderBy: { departureAt: "asc" },
    take: 6,
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

export async function SpecialOffersSection() {
  const t = await getTranslations("specialOffers");
  const offers = await getSpecialOffers();

  if (offers.length === 0) return null;

  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="size-5 text-brand-primary" />
              <span className="text-sm font-semibold text-brand-primary uppercase tracking-wide">
                {t("badge")}
              </span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-brand-secondary">{t("homeTitle")}</h2>
            <p className="text-muted-foreground mt-1">{t("homeSubtitle")}</p>
          </div>
          <Link
            href="/ofertas"
            className="hidden md:flex items-center gap-1.5 text-brand-primary font-semibold text-sm hover:underline"
          >
            {t("viewAll")}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0">
          {offers.map((offer) => (
            <div key={offer.id} className="shrink-0 w-[280px] snap-start md:w-auto">
              <SpecialOfferCard offer={offer} />
            </div>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link href="/ofertas" className="inline-flex items-center gap-1.5 text-brand-primary font-semibold text-sm">
            {t("viewAll")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
