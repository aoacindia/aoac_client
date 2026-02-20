import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userPrisma, productPrisma } from '@/lib/db';

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

    const order = await userPrisma.order.findUnique({
      where: {
        id: id,
        orderBy: session.user.id, // Ensure user can only access their own orders
      },
      include: {
        orderItems: true,
        shippingAddress: true,
        user: {
          select: {
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

    // Fetch product details for all order items
    const orderItemsWithProducts = await Promise.all(
      order.orderItems.map(async (item) => {
        try {
          const product = await productPrisma.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
              mainImage: true,
              price: true,
              regularPrice: true,
              weight: true,
              category: {
                select: {
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

