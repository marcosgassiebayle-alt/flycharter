import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { OfferDetailClient } from "./OfferDetailClient";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

async function getOffer(slug: string) {
  try {
    const offer = await prisma.offer.findUnique({
      where: { slug },
      include: {
        aircraft: true,
        operator: {
          select: {
            id: true,
            name: true,
            companyName: true,
            verified: true,
            description: true,
            profileImage: true,
          },
        },
      },
    });
    return offer;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const offer = await getOffer(slug);
  if (!offer) {
    return { title: "Vuelo no encontrado | FlyCharter" };
  }
  return {
    title: `${offer.originCode ?? offer.origin} → ${offer.destinationCode ?? offer.destination ?? "Tour"} | FlyCharter`,
    description: `Vuelo privado en ${offer.aircraft.model}. Desde $${offer.minPrice} USD.`,
  };
}

export default async function OfferDetailPage({ params }: Props) {
  const { slug } = await params;
  const offer = await getOffer(slug);

  if (!offer) {
    notFound();
  }

  const offerData = {
    ...offer,
    departureAt: offer.departureAt.toISOString(),
    returnAt: offer.returnAt ? offer.returnAt.toISOString() : null,
    originCode: offer.originCode ?? null,
    aircraft: {
      ...offer.aircraft,
      yearBuilt: offer.aircraft.yearBuilt ?? null,
      registration: offer.aircraft.registration ?? null,
      description: offer.aircraft.description ?? null,
    },
    operator: {
      ...offer.operator,
      companyName: offer.operator.companyName ?? null,
      description: offer.operator.description ?? null,
      profileImage: offer.operator.profileImage ?? null,
    },
  };

  return <OfferDetailClient offer={offerData} />;
}
