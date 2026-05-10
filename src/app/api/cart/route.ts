import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { carts, dbProduct, dbUser, products } from "@/lib/db";
import { and, eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login Before Adding to Cart" }, { status: 401 });
    }

    const cartItems = await dbUser
      .select()
      .from(carts)
      .where(eq(carts.userId, session.user.id));

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

    const product = await dbProduct.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.webVisible, true)),
      with: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.stockCount !== null && quantity > product.stockCount) {
      return NextResponse.json({
        error: `Sorry, we only have ${product.stockCount} units of ${product.name} in our inventory.`,
        insufficientStock: true,
        availableStock: product.stockCount,
        productName: product.name
      }, { status: 400 });
    }

    const [existingItem] = await dbUser
      .select()
      .from(carts)
      .where(
        and(eq(carts.userId, session.user.id), eq(carts.productId, productId))
      )
      .limit(1);

    let cartItem;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity < 0) {
        return NextResponse.json({
          error: "Quantity cannot be negative",
        }, { status: 400 });
      }

      if (product.stockCount !== null && newQuantity > product.stockCount) {
        return NextResponse.json({
          error: `Sorry, we only have ${product.stockCount} units of ${product.name} in our inventory. You already have ${existingItem.quantity} in your cart.`,
          insufficientStock: true,
          availableStock: product.stockCount,
          productName: product.name,
          currentQuantity: existingItem.quantity
        }, { status: 400 });
      }

      const [updated] = await dbUser
        .update(carts)
        .set({ quantity: newQuantity, updatedAt: new Date() })
        .where(eq(carts.id, existingItem.id))
        .returning();
      cartItem = updated;
    } else {
      const [created] = await dbUser
        .insert(carts)
        .values({
          userId: session.user.id,
          productId,
          quantity,
        })
        .returning();
      cartItem = created;
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

    await dbUser
      .delete(carts)
      .where(
        and(eq(carts.userId, session.user.id), eq(carts.productId, productId))
      );

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
