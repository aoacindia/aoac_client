export const DELIVERY_BUFFER_DAYS = 3;

export function getDisplayDeliveryDays(
  estimatedDays?: number | string | null
): number | null {
  if (estimatedDays === undefined || estimatedDays === null || estimatedDays === "") {
    return null;
  }

  const days =
    typeof estimatedDays === "number"
      ? estimatedDays
      : parseInt(String(estimatedDays), 10);

  if (isNaN(days)) {
    return null;
  }

  return days + DELIVERY_BUFFER_DAYS;
}
