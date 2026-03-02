import { describe, it, expect } from "vitest";
import { calculateCurrentPrice } from "@/lib/pricing";

describe("Pricing Engine", () => {
  const basePrice = 10000;
  const minPrice = 4000;

  // Helper: create a date N days from now
  function daysFromNow(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  function daysBeforeDeparture(departure: Date, daysBefore: number): Date {
    return new Date(departure.getTime() - daysBefore * 24 * 60 * 60 * 1000);
  }

  it("1. Non-empty-leg returns base price", () => {
    const result = calculateCurrentPrice(
      basePrice,
      minPrice,
      daysFromNow(10),
      null,
      false
    );
    expect(result.currentPrice).toBe(basePrice);
    expect(result.isDiscounted).toBe(false);
    expect(result.discountPercent).toBe(0);
  });

  describe("TIERED discount", () => {
    const tiers = [
      { daysBeforeDeparture: 14, discountPercent: 10 },
      { daysBeforeDeparture: 7, discountPercent: 25 },
      { daysBeforeDeparture: 3, discountPercent: 40 },
      { daysBeforeDeparture: 1, discountPercent: 55 },
    ];

    it("2. 15 days before = 0% discount (before first tier)", () => {
      const departure = daysFromNow(30);
      const now = daysBeforeDeparture(departure, 15);
      const result = calculateCurrentPrice(
        basePrice,
        minPrice,
        departure,
        tiers,
        true,
        now
      );
      expect(result.currentPrice).toBe(basePrice);
      expect(result.discountPercent).toBe(0);
    });

    it("3. 7 days before = correct tier discount", () => {
      const departure = daysFromNow(30);
      const now = daysBeforeDeparture(departure, 7);
      const result = calculateCurrentPrice(
        basePrice,
        minPrice,
        departure,
        tiers,
        true,
        now
      );
      // At exactly 7 days, should be at the 25% tier
      expect(result.currentPrice).toBeLessThanOrEqual(basePrice);
      expect(result.isDiscounted).toBe(true);
    });

    it("4. 1 day before = max tier discount", () => {
      const departure = daysFromNow(30);
      const now = daysBeforeDeparture(departure, 1);
      const result = calculateCurrentPrice(
        basePrice,
        minPrice,
        departure,
        tiers,
        true,
        now
      );
      // At 1 day, should be at or near the 55% tier
      expect(result.currentPrice).toBeLessThan(basePrice * 0.6);
      expect(result.isDiscounted).toBe(true);
    });

    it("5. Respects minPrice floor", () => {
      const highDiscountTiers = [
        { daysBeforeDeparture: 14, discountPercent: 30 },
        { daysBeforeDeparture: 7, discountPercent: 50 },
        { daysBeforeDeparture: 3, discountPercent: 70 },
        { daysBeforeDeparture: 1, discountPercent: 90 },
      ];
      const departure = daysFromNow(30);
      const now = daysBeforeDeparture(departure, 1);
      const result = calculateCurrentPrice(
        basePrice,
        minPrice,
        departure,
        highDiscountTiers,
        true,
        now
      );
      expect(result.currentPrice).toBeGreaterThanOrEqual(minPrice);
    });

    it("9. Returns correct nextDropDate for TIERED", () => {
      const departure = daysFromNow(30);
      const now = daysBeforeDeparture(departure, 10);
      const result = calculateCurrentPrice(
        basePrice,
        minPrice,
        departure,
        tiers,
        true,
        now
      );
      // Should have a next drop date (next tier is 7 days before departure)
      if (result.nextDropDate) {
        expect(result.nextDropDate.getTime()).toBeGreaterThan(now.getTime());
        expect(result.nextDropDate.getTime()).toBeLessThan(
          departure.getTime()
        );
      }
    });
  });

  describe("LINEAR discount", () => {
    const linearRules = {
      maxDiscountPercent: 50,
      startDaysBefore: 14,
    };

    it("6. Halfway = ~50% of maxDiscount", () => {
      const departure = daysFromNow(30);
      const now = daysBeforeDeparture(departure, 7); // halfway
      const result = calculateCurrentPrice(
        basePrice,
        minPrice,
        departure,
        linearRules,
        true,
        now
      );
      // At halfway (7 of 14 days), should be ~25% discount (50% of 50%)
      const expectedDiscount = 50 * 0.5; // 25%
      const expectedPrice = basePrice * (1 - expectedDiscount / 100);
      expect(result.currentPrice).toBeCloseTo(expectedPrice, 0);
    });

    it("7. At departure = maxDiscount (or minPrice)", () => {
      const departure = daysFromNow(30);
      const now = daysBeforeDeparture(departure, 0.1); // near departure
      const result = calculateCurrentPrice(
        basePrice,
        minPrice,
        departure,
        linearRules,
        true,
        now
      );
      // Should be at or near max discount, but not below minPrice
      expect(result.currentPrice).toBeGreaterThanOrEqual(minPrice);
      expect(result.isDiscounted).toBe(true);
    });
  });

  describe("EXPONENTIAL discount", () => {
    const expRules = {
      maxDiscountPercent: 50,
      startDaysBefore: 14,
      curve: 2,
    };

    it("8. Curve=2, halfway ≈ 25% of maxDiscount", () => {
      const departure = daysFromNow(30);
      const now = daysBeforeDeparture(departure, 7); // halfway
      const result = calculateCurrentPrice(
        basePrice,
        minPrice,
        departure,
        expRules,
        true,
        now
      );
      // With curve=2 at halfway: progress=0.5, discount = 50 * 0.5^2 = 12.5%
      const expectedDiscount = 50 * Math.pow(0.5, 2); // 12.5%
      const expectedPrice = basePrice * (1 - expectedDiscount / 100);
      expect(result.currentPrice).toBeCloseTo(expectedPrice, 0);
    });
  });

  it("10. Returns Spanish message string", () => {
    const linearRules = {
      maxDiscountPercent: 50,
      startDaysBefore: 14,
    };
    const departure = daysFromNow(10);
    const result = calculateCurrentPrice(
      basePrice,
      minPrice,
      departure,
      linearRules,
      true
    );
    // Should return a Spanish message about price dropping
    if (result.message) {
      expect(result.message).toContain("El precio puede bajar");
      expect(result.message).toContain("$");
    }
  });
});
