export const FREE_SHIPPING_THRESHOLD = 10000;

export function qualifiesForFreeShipping(itemTotal: number): boolean {
  return itemTotal >= FREE_SHIPPING_THRESHOLD;
}

export function getRemainingForFreeShipping(itemTotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - itemTotal);
}

export function getFreeShippingDiscount(
  itemTotal: number,
  calculatedShipping: number
): number {
  if (!qualifiesForFreeShipping(itemTotal) || calculatedShipping <= 0) {
    return 0;
  }
  return calculatedShipping;
}

export function getEffectiveShippingCost(
  itemTotal: number,
  calculatedShipping: number
): number {
  return qualifiesForFreeShipping(itemTotal) ? 0 : calculatedShipping;
}
