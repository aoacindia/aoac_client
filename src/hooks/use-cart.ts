"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

interface Cart {
  [key: string]: CartItem;
}

export function useCart() {
  const [cart, setCart] = useState<Cart>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart");
      if (response.status === 401) {
        // User not logged in
        setCart({});
        setIsLoading(false);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch cart");
      const cartItems: CartItem[] = await response.json();
      const cartMap: Cart = {};
      cartItems.forEach((item) => {
        cartMap[item.productId] = item;
      });
      setCart(cartMap);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      try {
        console.log("addToCart called with:", { productId, quantity });
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId, quantity }),
        });

        console.log("Cart API response status:", response.status);

        if (response.status === 401) {
          router.push("/auth/login");
          return { success: false, error: "Please login to add items to cart" };
        }

        const data = await response.json();
        console.log("Cart API response data:", data);

        if (!response.ok) {
          return { success: false, error: data.error || "Failed to add to cart" };
        }

        // Update local cart state
        await fetchCart();
        return { success: true, data: data.data };
      } catch (error) {
        console.error("Error adding to cart:", error);
        return {
          success: false,
          error: "Failed to add item to cart. Please try again.",
        };
      }
    },
    [router, fetchCart]
  );

  const deleteItem = useCallback(
    async (productId: string) => {
      try {
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });

        if (response.status === 401) {
          router.push("/auth/login");
          return { success: false, error: "Please login" };
        }

        if (!response.ok) {
          const data = await response.json();
          return { success: false, error: data.error || "Failed to remove item" };
        }

        await fetchCart();
        return { success: true };
      } catch (error) {
        console.error("Error deleting item:", error);
        return { success: false, error: "Failed to remove item" };
      }
    },
    [router, fetchCart]
  );

  const increaseQuantity = useCallback(
    async (productId: string) => {
      return await addToCart(productId, 1);
    },
    [addToCart]
  );

  const decreaseQuantity = useCallback(
    async (productId: string) => {
      const currentItem = cart[productId];
      if (!currentItem || currentItem.quantity <= 1) {
        return await deleteItem(productId);
      }

      try {
        // Send -1 to decrease quantity (API adds this to existing quantity)
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId, quantity: -1 }),
        });

        if (response.status === 401) {
          router.push("/auth/login");
          return { success: false, error: "Please login" };
        }

        if (!response.ok) {
          const data = await response.json();
          return { success: false, error: data.error || "Failed to update cart" };
        }

        await fetchCart();
        return { success: true };
      } catch (error) {
        console.error("Error decreasing quantity:", error);
        return { success: false, error: "Failed to update cart" };
      }
    },
    [cart, router, fetchCart, deleteItem]
  );

  const refreshCart = useCallback(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    isLoading,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    deleteItem,
    refreshCart,
  };
}

