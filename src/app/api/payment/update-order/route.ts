import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { carts, dbProduct, dbUser, orders, products, users } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { and, desc, eq, gte, like } from 'drizzle-orm';

function getFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    const fyStart = year;
    const fyEnd = year + 1;
    return `${fyStart}${String(fyEnd).slice(-2)}`;
  }

  const fyStart = year - 1;
  const fyEnd = year;
  return `${fyStart}${String(fyEnd).slice(-2)}`;
}

function getFinancialYearStart(date: Date): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return new Date(year, 3, 1);
  }

  return new Date(year - 1, 3, 1);
}

async function generateInvoiceNumber(
  invoiceType: "PI" | "TAX_INVOICE",
  isBusinessAccount: boolean,
  financialYear: string,
  financialYearStart: Date,
  invoiceOfficeStateCode?: string | number | null
): Promise<{ invoiceNumber: string; sequenceNumber: number }> {
  const prefix = invoiceType === "PI" ? "P" : (isBusinessAccount ? "B" : "R");
  const normalizedStateCode =
    invoiceOfficeStateCode === null || invoiceOfficeStateCode === undefined
      ? "09"
      : String(invoiceOfficeStateCode).trim();
  const stateCodeSegment =
    normalizedStateCode && normalizedStateCode !== "10"
      ? normalizedStateCode
      : "";
  const prefixAndFY = `${prefix}${stateCodeSegment}${financialYear}`;

  const [lastInvoice] = await dbUser
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.invoiceType, invoiceType),
        like(orders.InvoiceNumber, `${prefixAndFY}%`),
        gte(orders.orderDate, financialYearStart)
      )
    )
    .orderBy(desc(orders.orderDate))
    .limit(1);

  let nextSequenceNumber = 1;

  if (lastInvoice?.InvoiceNumber) {
    const invoiceNumber = lastInvoice.InvoiceNumber;
    if (invoiceNumber.startsWith(prefixAndFY)) {
      const sequenceStr = invoiceNumber.substring(prefixAndFY.length);
      const lastSequence = parseInt(sequenceStr, 10);
      if (!isNaN(lastSequence)) {
        nextSequenceNumber = lastSequence + 1;
      }
    }
  }

  const invoiceNumber = `${prefixAndFY}${nextSequenceNumber}`;

  return { invoiceNumber, sequenceNumber: nextSequenceNumber };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      totalDiscountAmount,
      deliveryCharge,
      selectedAddressId,
      courierName,
    } = body;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment information' },
        { status: 400 }
      );
    }

    const [orderRow] = await dbUser
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderRow) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (orderRow.orderBy !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Order does not belong to user' },
        { status: 403 }
      );
    }

    const [customer] = await dbUser
      .select({ isBusinessAccount: users.isBusinessAccount })
      .from(users)
      .where(eq(users.id, orderRow.orderBy))
      .limit(1);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const financialYear = getFinancialYear(now);
    const financialYearStart = getFinancialYearStart(now);
    const isBusinessAccount = customer.isBusinessAccount === true;

    const grandTotal = orderRow.totalAmount || 0;
    const roundedTotal = Math.round(grandTotal);
    const roundingOff = roundedTotal - grandTotal;

    const { invoiceNumber: taxInvoiceNumber, sequenceNumber: taxSequenceNumber } =
      await generateInvoiceNumber(
        "TAX_INVOICE",
        isBusinessAccount,
        financialYear,
        financialYearStart,
        "09"
      );

    const invoiceData = {
      invoiceType: "TAX_INVOICE" as const,
      invoiceSequenceNumber: taxSequenceNumber,
      InvoiceNumber: taxInvoiceNumber,
      roundedOffAmount: roundingOff,
      invoiceAmount: roundedTotal,
    };

    await dbUser
      .update(orders)
      .set({
        r_orderId: razorpay_order_id,
        r_paymentId: razorpay_payment_id,
        status: 'PAID',
        paidAmount: orderRow.totalAmount,
        discountAmount: totalDiscountAmount || orderRow.discountAmount,
        shippingAmount: deliveryCharge
          ? (typeof deliveryCharge === 'string'
              ? parseFloat(deliveryCharge)
              : deliveryCharge)
          : orderRow.shippingAmount,
        shippingAddressId: selectedAddressId || orderRow.shippingAddressId,
        shippingCourierName: courierName || orderRow.shippingCourierName,
        ...invoiceData,
      })
      .where(eq(orders.id, orderId));

    const updatedOrder = await dbUser.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        orderItems: true,
        shippingAddress: true,
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (updatedOrder?.shippingAddress && updatedOrder.user) {
      const orderItemsWithProducts = await Promise.all(
        updatedOrder.orderItems.map(async (item) => {
          try {
            const product = await dbProduct.query.products.findFirst({
              where: and(
                eq(products.id, item.productId),
                eq(products.webVisible, true)
              ),
              columns: { name: true },
            });
            return {
              name: product?.name || 'Product',
              quantity: item.quantity,
              price: item.price,
            };
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error);
            return {
              name: 'Product',
              quantity: item.quantity,
              price: item.price,
            };
          }
        })
      );

      sendOrderConfirmationEmail({
        email: updatedOrder.user.email,
        userName: updatedOrder.user.name || 'Customer',
        orderId: updatedOrder.id,
        orderDate: updatedOrder.orderDate.toISOString(),
        totalAmount: updatedOrder.totalAmount,
        discountAmount: updatedOrder.discountAmount || 0,
        deliveryCharge: updatedOrder.shippingAmount || 0,
        orderItems: orderItemsWithProducts,
        shippingAddress: updatedOrder.shippingAddress,
        paymentId: razorpay_payment_id,
        courierName: courierName || updatedOrder.shippingCourierName || undefined,
        estimatedDeliveryDate: updatedOrder.estimatedDeliveryDate || undefined,
      }).catch((error) => {
        console.error('Failed to send order confirmation email:', error);
      });
    }

    await dbUser
      .delete(carts)
      .where(eq(carts.userId, session.user.id));

    const orderResponse = await dbUser.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        orderItems: true,
        shippingAddress: true,
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      order: orderResponse,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}
