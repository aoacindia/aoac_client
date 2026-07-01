import { Truck } from "lucide-react";
import {
  FREE_SHIPPING_THRESHOLD,
  getRemainingForFreeShipping,
  qualifiesForFreeShipping,
} from "@/lib/free-shipping";

interface FreeShippingBannerProps {
  itemTotal: number;
}

export function FreeShippingBanner({ itemTotal }: FreeShippingBannerProps) {
  const qualifies = qualifiesForFreeShipping(itemTotal);
  const remaining = getRemainingForFreeShipping(itemTotal);

  if (qualifies) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            Your order qualifies for <strong>free shipping</strong> because your
            total item cost is ₹{FREE_SHIPPING_THRESHOLD.toLocaleString("en-IN")}{" "}
            or more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <Truck className="h-5 w-5 shrink-0 mt-0.5" />
        <p>
          Add items worth <strong>₹{remaining.toFixed(2)}</strong> more to get{" "}
          <strong>free shipping</strong> on orders of ₹
          {FREE_SHIPPING_THRESHOLD.toLocaleString("en-IN")} or above.
        </p>
      </div>
    </div>
  );
}
