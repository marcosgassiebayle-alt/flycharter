import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TieredRule {
  daysBeforeDeparture: number;
  discountPercent: number;
}

interface LinearRules {
  maxDiscountPercent: number;
  startDaysBefore: number;
}

interface ExponentialRules {
  maxDiscountPercent: number;
  startDaysBefore: number;
  curve: number;
}

type DiscountRules = TieredRule[] | LinearRules | ExponentialRules;

export interface PricingResult {
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  isDiscounted: boolean;
  nextDropPrice: number | null;
  nextDropDate: Date | null;
  minPossiblePrice: number;
  message: string | null;
}

export function calculateCurrentPrice(
  basePrice: number,
  minPrice: number,
  departureAt: Date,
  discountRules: DiscountRules | null,
  isEmptyLeg: boolean,
  now?: Date
): PricingResult {
  const currentTime = now ?? new Date();
  const msUntilDeparture = departureAt.getTime() - currentTime.getTime();
  const daysUntilDeparture = msUntilDeparture / (1000 * 60 * 60 * 24);

  if (!isEmptyLeg || !discountRules || daysUntilDeparture <= 0) {
    return {
      currentPrice: basePrice,
      originalPrice: basePrice,
      discountPercent: 0,
      isDiscounted: false,
      nextDropPrice: null,
      nextDropDate: null,
      minPossiblePrice: isEmptyLeg ? minPrice : basePrice,
      message: null,
    };
  }

  let discountPercent = 0;
  let nextDropPrice: number | null = null;
  let nextDropDate: Date | null = null;

  if (Array.isArray(discountRules)) {
    // TIERED discount
    const tiers = [...discountRules].sort(
      (a, b) => b.daysBeforeDeparture - a.daysBeforeDeparture
    );

    let lowerTier: TieredRule | null = null;
    let upperTier: TieredRule | null = null;

    for (let i = 0; i < tiers.length; i++) {
      if (daysUntilDeparture <= tiers[i].daysBeforeDeparture) {
        lowerTier = tiers[i];
        upperTier = i > 0 ? tiers[i - 1] : null;
      }
    }

    if (lowerTier) {
      if (upperTier) {
        const totalDaysBetween =
          upperTier.daysBeforeDeparture - lowerTier.daysBeforeDeparture;
        const daysIntoTier =
          upperTier.daysBeforeDeparture - daysUntilDeparture;
        const progress =
          totalDaysBetween > 0 ? daysIntoTier / totalDaysBetween : 1;
        discountPercent =
          upperTier.discountPercent +
          (lowerTier.discountPercent - upperTier.discountPercent) * progress;
      } else {
        const firstTier = tiers[0];
        if (daysUntilDeparture >= firstTier.daysBeforeDeparture) {
          discountPercent = 0;
        } else {
          discountPercent = lowerTier.discountPercent;
        }
      }

      // Find next tier for nextDropPrice
      const currentTierIndex = tiers.findIndex(
        (t) => t.daysBeforeDeparture < daysUntilDeparture
      );
      if (currentTierIndex >= 0) {
        const nextTier = tiers[currentTierIndex];
        const nextPrice = Math.max(
          basePrice * (1 - nextTier.discountPercent / 100),
          minPrice
        );
        nextDropPrice = Math.round(nextPrice * 100) / 100;
        const daysFromNow = daysUntilDeparture - nextTier.daysBeforeDeparture;
        nextDropDate = new Date(
          currentTime.getTime() + daysFromNow * 24 * 60 * 60 * 1000
        );
      }
    }
  } else if ("curve" in discountRules) {
    // EXPONENTIAL discount
    const { maxDiscountPercent, startDaysBefore, curve } = discountRules;
    if (daysUntilDeparture < startDaysBefore) {
      const progress = 1 - daysUntilDeparture / startDaysBefore;
      discountPercent = maxDiscountPercent * Math.pow(progress, curve);
    }

    // Next drop: price in 24 hours
    const tomorrowDays = Math.max(daysUntilDeparture - 1, 0);
    if (tomorrowDays > 0) {
      const tomorrowProgress = 1 - tomorrowDays / startDaysBefore;
      const tomorrowDiscount =
        maxDiscountPercent * Math.pow(Math.max(tomorrowProgress, 0), curve);
      const tomorrowPrice = Math.max(
        basePrice * (1 - tomorrowDiscount / 100),
        minPrice
      );
      nextDropPrice = Math.round(tomorrowPrice * 100) / 100;
      nextDropDate = new Date(
        currentTime.getTime() + 24 * 60 * 60 * 1000
      );
    }
  } else {
    // LINEAR discount
    const { maxDiscountPercent, startDaysBefore } = discountRules;
    if (daysUntilDeparture < startDaysBefore) {
      const progress = 1 - daysUntilDeparture / startDaysBefore;
      discountPercent = maxDiscountPercent * progress;
    }

    // Next drop: price in 24 hours
    const tomorrowDays = Math.max(daysUntilDeparture - 1, 0);
    if (tomorrowDays > 0) {
      const tomorrowProgress = 1 - tomorrowDays / startDaysBefore;
      const tomorrowDiscount = maxDiscountPercent * Math.max(tomorrowProgress, 0);
      const tomorrowPrice = Math.max(
        basePrice * (1 - tomorrowDiscount / 100),
        minPrice
      );
      nextDropPrice = Math.round(tomorrowPrice * 100) / 100;
      nextDropDate = new Date(
        currentTime.getTime() + 24 * 60 * 60 * 1000
      );
    }
  }

  let currentPrice = basePrice * (1 - discountPercent / 100);
  currentPrice = Math.max(currentPrice, minPrice);
  currentPrice = Math.round(currentPrice * 100) / 100;

  const actualDiscount =
    basePrice > 0
      ? Math.round(((basePrice - currentPrice) / basePrice) * 100)
      : 0;

  let message: string | null = null;
  if (nextDropPrice && nextDropDate && nextDropPrice < currentPrice) {
    const formattedDate = format(nextDropDate, "d 'de' MMMM", { locale: es });
    message = `El precio puede bajar a $${nextDropPrice.toLocaleString("es-AR")} antes del ${formattedDate}`;
  }

  return {
    currentPrice,
    originalPrice: basePrice,
    discountPercent: actualDiscount,
    isDiscounted: actualDiscount > 0,
    nextDropPrice,
    nextDropDate,
    minPossiblePrice: minPrice,
    message,
  };
}
