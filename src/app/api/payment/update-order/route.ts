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
// - PI: P092025261, P092025262, etc. (state code 09)
// - TAX_INVOICE Business: B092025261, B092025262, etc. (state code 09)
// - TAX_INVOICE Non-business: R092025261, R092025262, etc. (state code 09)
// - State 10: P2025261, B2025261, etc. (no state code in number)
async function generateInvoiceNumber(
  invoiceType: "PI" | "TAX_INVOICE",
  isBusinessAccount: boolean,
  financialYear: string,
  financialYearStart: Date,
  invoiceOfficeStateCode?: string | number | null
): Promise<{ invoiceNumber: string; sequenceNumber: number }> {
  // For PI, use "P" prefix regardless of customer type
  // For TAX_INVOICE, use "B" for business or "R" for non-business
  const prefix = invoiceType === "PI" ? "P" : (isBusinessAccount ? "B" : "R");
  const normalizedStateCode =
    invoiceOfficeStateCode === null || invoiceOfficeStateCode === undefined
      ? "09" // Default to state code 09
      : String(invoiceOfficeStateCode).trim();
  const stateCodeSegment =
    normalizedStateCode && normalizedStateCode !== "10"
      ? normalizedStateCode
      : "";
  const prefixAndFY = `${prefix}${stateCodeSegment}${financialYear}`;

  // Find the last invoice for this invoice type and prefix/state in the current financial year
  const lastInvoice = await userPrisma.order.findFirst({
    where: {
      invoiceType: invoiceType,
      InvoiceNumber: {
        startsWith: prefixAndFY,
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
    // Extract sequence from invoice number
    // Format:
    // - State 10: P2025261, B2025261, or R2025261
    // - Other states: P092025261, B092025261, etc.
    // Extract the last part (sequence)
    const invoiceNumber = lastInvoice.InvoiceNumber;
    if (invoiceNumber.startsWith(prefixAndFY)) {
      const sequenceStr = invoiceNumber.substring(prefixAndFY.length);
      const lastSequence = parseInt(sequenceStr, 10);
      if (!isNaN(lastSequence)) {
        nextSequenceNumber = lastSequence + 1;
      }
    }
  }

  // Format sequence without padding (just the number)
  const invoiceNumber = `${prefixAndFY}${nextSequenceNumber}`;

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
    const isBusinessAccount = customer.isBusinessAccount === true;

    const grandTotal = order.totalAmount || 0;
    const roundedTotal = Math.round(grandTotal);
    const roundingOff = roundedTotal - grandTotal;

    // Generate TAX_INVOICE number after payment (replacing PI)
    // Use state code 09 by default (can be fetched from invoiceOfficeId if needed)
    const { invoiceNumber: taxInvoiceNumber, sequenceNumber: taxSequenceNumber } = await generateInvoiceNumber(
      "TAX_INVOICE",
      isBusinessAccount,
      financialYear,
      financialYearStart,
      "09" // Default state code 09
    );

    // Update invoice data - replace PI with TAX_INVOICE
    const invoiceData = {
      invoiceType: "TAX_INVOICE",
      invoiceSequenceNumber: taxSequenceNumber,
      InvoiceNumber: taxInvoiceNumber,
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

