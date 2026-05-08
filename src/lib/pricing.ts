export type PricingFactors = {
  baseDailyPrice: number;
  rentalDays: number;
  demandFactor?: number;
  seasonFactor?: number;
  popularityFactor?: number;
  discountAmount?: number;
  minMultiplier?: number;
  maxMultiplier?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function calculateRentalPrice(input: PricingFactors) {
  const {
    baseDailyPrice,
    rentalDays,
    demandFactor = 1,
    seasonFactor = 1,
    popularityFactor = 1,
    discountAmount = 0,
    minMultiplier = 0.7,
    maxMultiplier = 2.5,
  } = input;

  if (baseDailyPrice <= 0 || rentalDays <= 0) {
    throw new Error('baseDailyPrice and rentalDays must be positive');
  }

  const rawMultiplier = demandFactor * seasonFactor * popularityFactor;
  const multiplier = clamp(rawMultiplier, minMultiplier, maxMultiplier);
  const subtotal = baseDailyPrice * rentalDays * multiplier;
  const total = Math.max(0, subtotal - discountAmount);

  return {
    rentalDays,
    multiplier,
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

export function computeDemandFactor(activeRentals: number, totalInventory: number) {
  if (totalInventory <= 0) return 1;
  const utilization = activeRentals / totalInventory;
  return clamp(1 + utilization * 0.6, 0.85, 1.6);
}
