"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import Script from "next/script";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): {
        open: () => void;
        on: (event: string, handler: (response?: unknown) => void) => void;
      };
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  image: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  theme: {
    color: string;
  };
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    orderId: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  retry?: {
    enabled: boolean;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayPaymentFailedResponse {
  error?: {
    description?: string;
  };
}

interface PaymentHandlerProps {
  orderId: string;
  totalAmount: number;
  discountAmount: number;
  shippingCharge: number;
  courierName?: string;
  estimatedDeliveryDays?: string | number;
  disabled?: boolean;
  selectedAddress: {
    id: string;
    name: string;
    phone: string;
    houseNo: string;
    line1: string;
    line2?: string | null;
    city: string;
    district: string;
    state: string;
    pincode: string;
  } | null;
  orderItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  onProcessingChange?: (isProcessing: boolean) => void;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxAttempts) {
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        console.log(`Retry attempt ${attempt}/${maxAttempts} after ${backoffDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  
  throw lastError || new Error('Max retry attempts reached');
}

export default function PaymentHandler({
  orderId,
  totalAmount,
  discountAmount,
  shippingCharge,
  courierName,
  selectedAddress,
  disabled,
  onProcessingChange,
}: PaymentHandlerProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [session, setSession] = useState<{
    name: string;
    email: string;
    phone: string;
  } | null>(null);

  useEffect(() => {
    if (onProcessingChange) {
      onProcessingChange(isProcessing || isSaving);
    }
  }, [isProcessing, isSaving, onProcessingChange]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setSession({
              name: data.user.name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    };

    fetchSession();
  }, []);

  const handlePayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!keyId) {
      toast.error("Payment gateway not configured. Please contact support.");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create Razorpay order
      const amount = Number(totalAmount.toFixed(2));
      const amountInPaise = Math.round(amount * 100);

      const { data: orderData } = await axios.post("/api/payment/order", {
        amount: amountInPaise,
        currency: "INR",
        orderId,
      });

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create payment order");
      }

      // Step 2: Initialize Razorpay checkout
      const options: RazorpayOptions = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,
        name: "AOAC",
        image: "https://aoac.in/_next/image?url=%2Fimg%2Flogo.png&w=128&q=75",
        description: `Order ID: ${orderId}`,
        handler: async function (response: RazorpayResponse) {
          setIsSaving(true);
          
          try {
            // Step 3: Verify payment signature
            if (!response.razorpay_payment_id) {
              throw new Error("Invalid payment response");
            }

            const verifyResponse = await axios.post("/api/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verifyResponse.data.success) {
              throw new Error(verifyResponse.data.message || "Payment verification failed");
            }

            // Step 4: Update order with payment details (with retry logic)
            let orderUpdateSuccess = false;
            try {
              await retryWithBackoff(async () => {
                const updateResponse = await axios.post("/api/payment/update-order", {
                  orderId,
                  razorpay_payment_id: verifyResponse.data.paymentId,
                  razorpay_order_id: verifyResponse.data.orderId,
                  totalDiscountAmount: discountAmount,
                  deliveryCharge: shippingCharge,
                  selectedAddressId: selectedAddress.id,
                  courierName,
                });

                if (!updateResponse.data.success) {
                  throw new Error(updateResponse.data.message || "Failed to update order");
                }

                return updateResponse.data;
              });

              orderUpdateSuccess = true;
            } catch (updateError) {
              console.error("Failed to update order after payment:", updateError);
              
              // Payment was successful but order update failed
              // This is critical - we need to retry or alert admin
              toast.error(
                "Payment successful but order update failed. Please contact support with your payment ID: " +
                response.razorpay_payment_id
              );
              
              // Still redirect to success page but with warning
              router.push(`/order/success/${orderId}?paymentId=${response.razorpay_payment_id}&warning=true`);
              return;
            }

            if (orderUpdateSuccess) {
              toast.success("Payment successful! Order confirmed.");
              
              // Redirect to success page
              router.push(`/order/success/${orderId}`);
            }
          } catch (error) {
            console.error("Payment processing error:", error);
            toast.error(
              error instanceof Error 
                ? error.message 
                : "Payment processing failed. Please contact support."
            );
          } finally {
            setIsSaving(false);
            setIsProcessing(false);
          }
        },
        theme: {
          color: "#168e2d",
        },
        prefill: {
          name: session?.name || "",
          email: session?.email || "",
          contact: session?.phone || "",
        },
        notes: {
          orderId: orderId,
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setIsSaving(false);
          },
        },
        retry: {
          enabled: true,
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on("payment.failed", function (response?: unknown) {
        setIsProcessing(false);
        setIsSaving(false);
        const paymentResponse = response as RazorpayPaymentFailedResponse | undefined;
        const errorDescription =
          paymentResponse?.error?.description || "Payment failed. Please try again.";
        toast.error(`Payment failed: ${errorDescription}`);
      });

      rzp.on("modal.closed", function () {
        setIsProcessing(false);
        setIsSaving(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      setIsProcessing(false);
      setIsSaving(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to initiate payment. Please try again."
      );
    }
  };

  if (isSaving) {
    return (
      <Button className="w-full" size="lg" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing Payment...
      </Button>
    );
  }

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Button
        className="w-full bg-[#168e2d] hover:bg-[#137a26] text-white"
        size="lg"
        onClick={handlePayment}
        disabled={disabled || isProcessing || !selectedAddress}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ₹{totalAmount.toFixed(2)}
          </>
        )}
      </Button>
    </>
  );
}

