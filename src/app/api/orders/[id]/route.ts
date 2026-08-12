import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  assertBusinessOwnedByUser,
  createBusinessForUser,
  validateBusinessPayload,
  type CreateBusinessInput,
} from '@/lib/business';
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
        business: {
          with: {
            billingAddress: true,
          },
        },
        user: {
          columns: {
            name: true,
            email: true,
            phone: true,
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

export async function PATCH(
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
    const body = await req.json();
    const {
      businessId: requestedBusinessId,
      newBusiness,
      isBillToSameAsShipping = true,
      clearBusiness,
    }: {
      businessId?: string | null;
      newBusiness?: CreateBusinessInput | null;
      isBillToSameAsShipping?: boolean;
      clearBusiness?: boolean;
    } = body;

    const [orderRow] = await dbUser
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.orderBy, session.user.id)))
      .limit(1);

    if (!orderRow) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (orderRow.status !== 'PENDING' && orderRow.status !== 'PAYMENT_PENDING') {
      return NextResponse.json(
        { success: false, message: 'Only pending orders can update business details' },
        { status: 400 }
      );
    }

    let resolvedBusinessId: string | null = null;

    if (clearBusiness) {
      resolvedBusinessId = null;
    } else if (newBusiness) {
      const validationError = validateBusinessPayload(newBusiness);
      if (validationError) {
        return NextResponse.json(
          { success: false, message: validationError },
          { status: 400 }
        );
      }
      const created = await createBusinessForUser(session.user.id, newBusiness);
      resolvedBusinessId = created.business.id;
    } else if (requestedBusinessId) {
      const owned = await assertBusinessOwnedByUser(
        requestedBusinessId,
        session.user.id
      );
      if (!owned) {
        return NextResponse.json(
          { success: false, message: 'Business not found or does not belong to user' },
          { status: 404 }
        );
      }
      resolvedBusinessId = owned.id;
    }

    const [updated] = await dbUser
      .update(orders)
      .set({
        businessId: resolvedBusinessId,
        isBillToSameAsShipping: isBillToSameAsShipping !== false,
      })
      .where(eq(orders.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error) {
    console.error('Error updating order business:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
