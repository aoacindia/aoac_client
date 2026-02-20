import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { userPrisma } from "@/lib/db";
import { productPrisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login Before Adding to Cart" }, { status: 401 });
    }

    const cartItems = await userPrisma.cart.findMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login Before Adding to Cart" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity } = body;

    const product = await productPrisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if requested quantity is available in stock
    if (product.stockCount !== null && quantity > product.stockCount) {
      return NextResponse.json({
        error: `Sorry, we only have ${product.stockCount} units of ${product.name} in our inventory.`,
        insufficientStock: true,
        availableStock: product.stockCount,
        productName: product.name
      }, { status: 400 });
    }

    // Database operations
    const existingItem = await userPrisma.cart.findFirst({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    let cartItem;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      // Prevent negative quantities
      if (newQuantity < 0) {
        return NextResponse.json({
          error: "Quantity cannot be negative",
        }, { status: 400 });
      }
      
      // Check stock again with new quantity
      if (product.stockCount !== null && newQuantity > product.stockCount) {
        return NextResponse.json({
          error: `Sorry, we only have ${product.stockCount} units of ${product.name} in our inventory. You already have ${existingItem.quantity} in your cart.`,
          insufficientStock: true,
          availableStock: product.stockCount,
          productName: product.name,
          currentQuantity: existingItem.quantity
        }, { status: 400 });
      }

      cartItem = await userPrisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      cartItem = await userPrisma.cart.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
        },
      });
    }

    if (!cartItem) {
      throw new Error("Failed to create or update cart item");
    }

    return NextResponse.json({
      message: existingItem ? "Cart updated" : "Item added to cart",
      data: cartItem,
    });
  } catch (error) {
    console.error("Error updating cart:", error);

    return NextResponse.json(
      {
        error: "Failed to update cart",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login Before Adding to Cart" }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;

    await userPrisma.cart.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({
      message: "Item removed from cart",
      success: true,
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      {
        error: "Failed to remove item from cart",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

