import { OfferCard, type OfferPreview } from "./OfferCard";

export function OfferGrid({ offers }: { offers: OfferPreview[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
