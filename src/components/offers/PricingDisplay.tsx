"use client";

import { useTranslations } from "next-intl";
import { calculateCurrentPrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { EmptyLegBadge } from "./EmptyLegBadge";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Tag } from "lucide-react";

interface PricingDisplayProps {
  basePrice: number;
  minPrice: number;
  departureAt: Date;
  discountRules: unknown;
  isEmptyLeg: boolean;
  discountType: string | null;
}

export function PricingDisplay({
  basePrice,
  minPrice,
  departureAt,
  discountRules,
  isEmptyLeg,
  discountType,
}: PricingDisplayProps) {
  const t = useTranslations("pricing");
  const tOffers = useTranslations("offers");

  const pricing = calculateCurrentPrice(
    basePrice,
    minPrice,
    departureAt,
    discountRules as Parameters<typeof calculateCurrentPrice>[3],
    isEmptyLeg
  );

  return (
    <div className="space-y-4">
      {/* Empty leg badge */}
      {isEmptyLeg && pricing.isDiscounted && (
        <EmptyLegBadge discountPercent={pricing.discountPercent} />
      )}

      {/* Price display */}
      <div className="space-y-1">
        {pricing.isDiscounted && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(pricing.originalPrice)}
            </span>
            <Badge className="bg-brand-success text-white border-0 text-xs">
              -{pricing.discountPercent}% {t("discount")}
            </Badge>
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-brand-primary font-heading">
            {formatCurrency(pricing.currentPrice)}
          </span>
          <span className="text-sm text-muted-foreground">USD</span>
        </div>
      </div>

      {/* Full charter label */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Tag className="size-3.5" />
        <span>{tOffers("fullCharter")}</span>
      </div>

      {/* Price drop message */}
      {pricing.message && (
        <div className="flex items-start gap-2 bg-brand-success/10 rounded-button p-3">
          <TrendingDown className="size-4 text-brand-success shrink-0 mt-0.5" />
          <p className="text-sm text-brand-success font-medium">
            {pricing.message}
          </p>
        </div>
      )}

      {/* Price drops info */}
      {isEmptyLeg && discountType && (
        <p className="text-xs text-muted-foreground">
          {t("priceDrops")} &middot; {t("minPrice")}: {formatCurrency(pricing.minPossiblePrice)}
        </p>
      )}
    </div>
  );
}
