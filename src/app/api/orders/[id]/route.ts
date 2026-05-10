import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbProduct, dbUser, orders, products } from '@/lib/db';
import { and, eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const order = await dbUser.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.orderBy, session.user.id)),
      with: {
        orderItems: true,
        shippingAddress: true,
        user: {
          columns: {
            name: true,
            email: true,
            phone: true,
            isBusinessAccount: true,
            businessName: true,
            gstNumber: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    const orderItemsWithProducts = await Promise.all(
      order.orderItems.map(async (item) => {
        try {
          const product = await dbProduct.query.products.findFirst({
            where: and(
              eq(products.id, item.productId),
              eq(products.webVisible, true)
            ),
            columns: {
              id: true,
              code: true,
              name: true,
              description: true,
              mainImage: true,
              price: true,
              regularPrice: true,
              weight: true,
            },
            with: {
              category: {
                columns: {
                  name: true,
                },
              },
            },
          });
          return {
            ...item,
            product,
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          return {
            ...item,
            product: null,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        orderItems: orderItemsWithProducts,
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
