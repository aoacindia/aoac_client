import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userPrisma, productPrisma } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';

// Helper function to get financial year in format YYYY(YY+1)
// Financial year in India: April 1 to March 31
// Example: April 1, 2025 to March 31, 2026 = FY 2025-26 = "202526"
function getFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1

  if (month >= 4) {
    const fyStart = year;
    const fyEnd = year + 1;
    return `${fyStart}${String(fyEnd).slice(-2)}`;
  }

  const fyStart = year - 1;
  const fyEnd = year;
  return `${fyStart}${String(fyEnd).slice(-2)}`;
}

// Helper function to get financial year start date
function getFinancialYearStart(date: Date): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return new Date(year, 3, 1); // Month 3 = April (0-indexed)
  }

  return new Date(year - 1, 3, 1); // Month 3 = April (0-indexed)
}

// Helper function to generate invoice number
// Format:
// - PI: P2025261, P2025262, etc. (separate sequence for all PI invoices)
// - TAX_INVOICE Business: B2025261, B2025262, etc.
// - TAX_INVOICE Non-business: R2025261, R2025262, etc.
async function generateInvoiceNumber(
  invoiceType: "PI" | "TAX_INVOICE",
  isBusinessAccount: boolean,
  financialYear: string,
  financialYearStart: Date
): Promise<{ invoiceNumber: string; sequenceNumber: number }> {
  const prefix = invoiceType === "PI" ? "P" : (isBusinessAccount ? "B" : "R");

  const lastInvoice = await userPrisma.order.findFirst({
    where: {
      invoiceType: invoiceType,
      InvoiceNumber: {
        startsWith: prefix,
      },
      orderDate: {
        gte: financialYearStart,
      },
    },
    orderBy: {
      orderDate: "desc",
    },
  });

  let nextSequenceNumber = 1;

  if (lastInvoice?.InvoiceNumber) {
    const invoiceNumber = lastInvoice.InvoiceNumber;
    const prefixAndFY = `${prefix}${financialYear}`;
    if (invoiceNumber.startsWith(prefixAndFY)) {
      const sequenceStr = invoiceNumber.substring(prefixAndFY.length);
      const lastSequence = parseInt(sequenceStr, 10);
      if (!isNaN(lastSequence)) {
        nextSequenceNumber = lastSequence + 1;
      }
    }
  }

  const invoiceNumber = `${prefix}${financialYear}${nextSequenceNumber}`;

  return { invoiceNumber, sequenceNumber: nextSequenceNumber };
}

/**
 * Update Order with Payment Details
 * POST /api/payment/update-order
 */
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

    // Verify order belongs to user
    const order = await userPrisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.orderBy !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Order does not belong to user' },
        { status: 403 }
      );
    }

    const customer = await userPrisma.user.findUnique({
      where: { id: order.orderBy },
      select: { isBusinessAccount: true },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const financialYear = getFinancialYear(now);
    const financialYearStart = getFinancialYearStart(now);
    const effectiveInvoiceType =
      order.invoiceType === "PI" || order.invoiceType === "TAX_INVOICE"
        ? order.invoiceType
        : "TAX_INVOICE";
    const isBusinessAccount = customer.isBusinessAccount === true;

    const grandTotal = order.totalAmount || 0;
    const roundedTotal = Math.round(grandTotal);
    const roundingOff = roundedTotal - grandTotal;

    const invoiceDetails = order.InvoiceNumber
      ? null
      : await generateInvoiceNumber(
          effectiveInvoiceType,
          isBusinessAccount,
          financialYear,
          financialYearStart
        );

    const invoiceData = order.InvoiceNumber
      ? {}
      : {
          invoiceType: effectiveInvoiceType,
          invoiceSequenceNumber: invoiceDetails?.sequenceNumber,
          InvoiceNumber: invoiceDetails?.invoiceNumber,
          roundedOffAmount: roundingOff,
          invoiceAmount: roundedTotal,
        };

    // Update order with payment details
    const updatedOrder = await userPrisma.order.update({
      where: { id: orderId },
      data: {
        r_orderId: razorpay_order_id,
        r_paymentId: razorpay_payment_id,
        status: 'PAID',
        paidAmount: order.totalAmount,
        discountAmount: totalDiscountAmount || order.discountAmount,
        deliveryCharge: deliveryCharge || order.deliveryCharge,
        shippingAddressId: selectedAddressId || order.shippingAddressId,
        shippingCourierName: courierName || order.shippingCourierName,
        ...invoiceData,
      },
      include: {
        orderItems: true,
        shippingAddress: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send order confirmation email (don't wait for it to complete)
    if (updatedOrder.shippingAddress && updatedOrder.user) {
      // Fetch product details for email
      const orderItemsWithProducts = await Promise.all(
        updatedOrder.orderItems.map(async (item) => {
          try {
            const product = await productPrisma.product.findUnique({
              where: { id: item.productId },
              select: { name: true },
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

      // Send email asynchronously (don't block response)
      sendOrderConfirmationEmail({
        email: updatedOrder.user.email,
        userName: updatedOrder.user.name || 'Customer',
        orderId: updatedOrder.id,
        orderDate: updatedOrder.orderDate.toISOString(),
        totalAmount: updatedOrder.totalAmount,
        discountAmount: updatedOrder.discountAmount || 0,
        deliveryCharge: updatedOrder.deliveryCharge || 0,
        orderItems: orderItemsWithProducts,
        shippingAddress: updatedOrder.shippingAddress,
        paymentId: razorpay_payment_id,
        courierName: courierName || updatedOrder.shippingCourierName || undefined,
        estimatedDeliveryDate: updatedOrder.estimatedDeliveryDate || undefined,
      }).catch((error) => {
        console.error('Failed to send order confirmation email:', error);
        // Don't fail the request if email fails
      });
    }

    // Clear cart only after successful payment update
    await userPrisma.cart.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}

