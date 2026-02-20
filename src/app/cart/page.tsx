"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Package, CreditCard, Percent, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PlusIcon, MinusIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import { toast } from "sonner";

interface WeightDiscount {
  minWeight: number;
  price: number;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  weight: number;
  mainImage: string;
  name: string;
  categoryId: string;
  weightDiscounts?: WeightDiscount[];
}

interface CategoryDiscount {
  minWeight: number;
  productDiscounts: {
    productId: string;
    discountPrice: number;
  }[];
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [categoryDiscounts, setCategoryDiscounts] = useState<
    Record<string, CategoryDiscount[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [updatingQuantityId, setUpdatingQuantityId] = useState<string | null>(null);
  const { cart, increaseQuantity, decreaseQuantity, deleteItem, refreshCart } = useCart();

  useEffect(() => {
    async function fetchCartItems() {
      try {
        const cartResponse = await fetch("/api/cart");
        if (cartResponse.status === 401) {
          router.push("/auth/login");
          return;
        }
        if (!cartResponse.ok) throw new Error("Failed to fetch cart items");
        const cartData: CartItem[] = await cartResponse.json();

        if (cartData.length === 0) {
          setCartItems([]);
          setCategoryDiscounts({});
          setLoading(false);
          return;
        }

        const productPromises = cartData.map((item) =>
          fetch(`/api/products/get-products/${item.productId}`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch product details");
            return res.json();
          })
        );

        const productResults = await Promise.allSettled(productPromises);
        const combinedCart = cartData
          .map((item, index) => {
            const result = productResults[index];
            if (result.status !== "fulfilled") {
              return null;
            }
            return {
              ...item,
              ...result.value,
            };
          })
          .filter((item): item is CartItem => item !== null);

        if (combinedCart.length === 0) {
          setCartItems([]);
          setCategoryDiscounts({});
          setLoading(false);
          return;
        }

        // Fetch discounts for all unique categories in cart
        const uniqueCategories = [
          ...new Set(combinedCart.map((item) => item.categoryId)),
        ];
        const discountPromises = uniqueCategories.map((categoryId) =>
          fetch(`/api/products/category-discounts?categoryId=${categoryId}`).then(
            (res) => res.json()
          )
        );

        const discountsData = await Promise.allSettled(discountPromises);

        const discountsByCategory = uniqueCategories.reduce(
          (acc, categoryId, index) => {
            const result = discountsData[index];
            return {
              ...acc,
              [categoryId]:
                result.status === "fulfilled" ? result.value || [] : [],
            };
          },
          {} as Record<string, CategoryDiscount[]>
        );

        // Fetch weight-based discounts for each product
        const weightDiscountPromises = combinedCart.map((item) =>
          fetch(`/api/products/weight-discounts?productId=${item.productId}`).then(
            (res) => res.json()
          )
        );
        const weightDiscountsData = await Promise.allSettled(weightDiscountPromises);

        const cartWithAllDiscounts = combinedCart.map((item, index) => {
          const result = weightDiscountsData[index];
          const weightDiscounts =
            result.status === "fulfilled" ? result.value?.weightDiscounts || [] : [];
          return {
            ...item,
            weightDiscounts: Array.isArray(weightDiscounts) ? weightDiscounts : [],
          };
        });

        setCategoryDiscounts(discountsByCategory);
        setCartItems(cartWithAllDiscounts);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        toast.error("Failed to load cart items");
      } finally {
        setLoading(false);
      }
    }
    fetchCartItems();
  }, [router, cart]);

  const handleDeleteItem = async (itemId: string) => {
    setDeletingItemId(itemId);
    const result = await deleteItem(itemId);
    if (result.success) {
      toast.success("Item removed from cart");
      await refreshCart();
    } else {
      toast.error(result.error || "Failed to remove item");
    }
    setDeletingItemId(null);
  };

  const handleQuantityChange = async (productId: string, action: "increase" | "decrease") => {
    // Prevent multiple simultaneous updates for the same product
    if (updatingQuantityId === productId) return;
    
    setUpdatingQuantityId(productId);
    try {
      if (action === "increase") {
        const result = await increaseQuantity(productId);
        if (!result.success) {
          toast.error(result.error || "Failed to update quantity");
        }
      } else {
        const result = await decreaseQuantity(productId);
        if (!result.success) {
          toast.error(result.error || "Failed to update quantity");
        }
      }
      await refreshCart();
    } finally {
      setUpdatingQuantityId(null);
    }
  };

  const handleCheckout = async () => {
    try {
      // Prepare order items with both original and discounted prices
      const orderItems = visibleItems.map((item) => ({
        productId: item.productId,
        quantity: cart[item.productId]?.quantity || 0,
        originalPrice: item.price,
        price: getFinalDiscountedPrice(item),
      }));

      // Redirect to checkout page with cart data
      const checkoutData = {
        items: orderItems,
        totalRegularPrice,
        totalSavings,
        totalDiscountedPrice,
        totalWeight,
      };

      // Store in sessionStorage for checkout page
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      router.push('/checkout');
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to proceed to checkout. Please try again.");
    }
  };

  // Calculate category weights (in grams)
  const categoryWeights = cartItems.reduce((acc, item) => {
    const quantity = cart[item.productId]?.quantity || 0;
    const weight = (item.weight || 0) * quantity;
    acc[item.categoryId] = (acc[item.categoryId] || 0) + weight;
    return acc;
  }, {} as Record<string, number>);

  // Get discounted price for an item (category-based)
  const getDiscountedPrice = (item: CartItem): number => {
    const categoryWeight = categoryWeights[item.categoryId] || 0;
    const discounts = categoryDiscounts[item.categoryId] || [];

    if (!discounts.length || !Array.isArray(discounts)) return item.price;

    // Find applicable discount tier
    // Both categoryWeight and minWeight are in grams, so compare directly
    const applicableDiscount = discounts
      .filter((discount) => {
        const minWeight = discount.minWeight || 0;
        return minWeight <= categoryWeight;
      })
      .sort((a, b) => (b.minWeight || 0) - (a.minWeight || 0))[0];

    if (!applicableDiscount || !applicableDiscount.productDiscounts) return item.price;

    // Find discounted price for this product
    const productDiscount = applicableDiscount.productDiscounts.find(
      (pd) => pd.productId === item.productId
    );

    return productDiscount ? productDiscount.discountPrice : item.price;
  };

  // Get weight-based discounted price for an item
  const getWeightBasedPrice = (item: CartItem): number => {
    if (!item.weightDiscounts?.length || !Array.isArray(item.weightDiscounts)) {
      return item.price;
    }

    const quantity = cart[item.productId]?.quantity || 0;
    if (quantity === 0) return item.price;

    // Calculate total weight in grams
    // Both totalWeight and minWeight are in grams, so compare directly
    const totalWeight = (item.weight || 0) * quantity;

    // Find applicable discount tier based on total weight
    const applicableDiscount = item.weightDiscounts
      .filter((discount) => {
        const minWeight = discount.minWeight || 0;
        return minWeight <= totalWeight;
      })
      .sort((a, b) => (b.minWeight || 0) - (a.minWeight || 0))[0];

    return applicableDiscount ? applicableDiscount.price : item.price;
  };

  // Get the final discounted price (minimum of category and weight-based discounts)
  const getFinalDiscountedPrice = (item: CartItem): number => {
    const categoryDiscountedPrice = getDiscountedPrice(item);
    const weightDiscountedPrice = getWeightBasedPrice(item);
    // Return the minimum of the two discounts (best price)
    return Math.min(categoryDiscountedPrice, weightDiscountedPrice);
  };

  const totalRegularPrice = cartItems.reduce((sum, item) => {
    const quantity = cart[item.productId]?.quantity || 0;
    return sum + item.price * quantity;
  }, 0);

  const totalDiscountedPrice = cartItems.reduce((sum, item) => {
    const quantity = cart[item.productId]?.quantity || 0;
    return sum + getFinalDiscountedPrice(item) * quantity;
  }, 0);

  const totalWeight = cartItems.reduce((sum, item) => {
    const quantity = cart[item.productId]?.quantity || 0;
    return sum + (item.weight || 0) * quantity;
  }, 0);

  const totalSavings = totalRegularPrice - totalDiscountedPrice;

  const visibleItems = cartItems.filter((item) => (cart[item.productId]?.quantity || 0) > 0);
  const isEmpty = visibleItems.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <ShoppingCart className="h-8 w-8 text-[#168e2d]" />
          Your Cart
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Card className="p-12 text-center w-full max-w-md">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start adding products to see them here
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-[#168e2d] hover:bg-[#137a26]"
              >
                Continue Shopping
              </Button>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {visibleItems.map((item) => {
                const discountedPrice = getFinalDiscountedPrice(item);
                const quantity = cart[item.productId]?.quantity || 0;

                return (
                  <Card key={item.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-32 h-32 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {item.mainImage ? (
                          <Image
                            src={item.mainImage}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="128px"
                            unoptimized={item.mainImage.includes('admin.aoac.in')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                          {item.weight && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Weight: {(item.weight / 1000).toFixed(2)} kg
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2 border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => handleQuantityChange(item.productId, "decrease")}
                              disabled={deletingItemId === item.productId || updatingQuantityId === item.productId}
                            >
                              <MinusIcon className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-semibold">
                              {quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => handleQuantityChange(item.productId, "increase")}
                              disabled={deletingItemId === item.productId || updatingQuantityId === item.productId}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.productId)}
                            disabled={deletingItemId === item.productId}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingItemId === item.productId ? "Removing..." : "Remove"}
                          </Button>
                        </div>
                      </div>
                      <div className="text-right sm:text-left sm:min-w-[120px]">
                        <p className="font-semibold text-lg text-gray-900">
                          ₹{(discountedPrice * quantity).toFixed(2)}
                        </p>
                        <div className="text-sm mt-1">
                          {item.price > discountedPrice ? (
                            <>
                              <span className="line-through text-muted-foreground">
                                ₹{item.price.toFixed(2)}
                              </span>
                              <span className="text-green-600 ml-2 font-medium">
                                ₹{discountedPrice.toFixed(2)} each
                              </span>
                              {(getWeightBasedPrice(item) < item.price || getDiscountedPrice(item) < item.price) && (
                                <span className="block text-xs text-green-600 mt-1">
                                  Discount applied!
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground">
                              ₹{item.price.toFixed(2)} each
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-36 shadow-lg">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      ₹{totalRegularPrice.toFixed(2)}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Total Savings
                      </span>
                      <span className="font-semibold">
                        -₹{totalSavings.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Total Weight
                    </span>
                    <span className="font-semibold">
                      {(totalWeight / 1000).toFixed(2)} kg
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-[#168e2d]">₹{totalDiscountedPrice.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full bg-[#168e2d] hover:bg-[#137a26] text-white"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isEmpty}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/")}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

