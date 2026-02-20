import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userPrisma, productPrisma } from '@/lib/db';

type OrderItemInput = {
  productId: string;
  quantity: number;
  price?: number;
  originalPrice?: number;
};

// Helper function to get financial year in format YYYY(YY+1)
// Financial year in India: April 1 to March 31
// Example: April 1, 2025 to March 31, 2026 = FY 2025-26 = "202526"
function getFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
  
  // If month is April (4) or later, financial year starts from current year
  // If month is January-March (1-3), financial year started from previous year
  if (month >= 4) {
    // FY 2025-26: April 2025 to March 2026
    const fyStart = year;
    const fyEnd = year + 1;
    return `${fyStart}${String(fyEnd).slice(-2)}`;
  } else {
    // FY 2024-25: April 2024 to March 2025
    const fyStart = year - 1;
    const fyEnd = year;
    return `${fyStart}${String(fyEnd).slice(-2)}`;
  }
}

// Helper function to get financial year start date
function getFinancialYearStart(date: Date): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  if (month >= 4) {
    // Current FY started in April of current year
    return new Date(year, 3, 1); // Month 3 = April (0-indexed)
  } else {
    // Current FY started in April of previous year
    return new Date(year - 1, 3, 1); // Month 3 = April (0-indexed)
  }
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

// Helper function to generate order ID: ODR-DDMMYYYY-HHMMSS-XXXX
async function generateOrderId(): Promise<string> {
  const now = new Date();
  
  // Format: DDMMYYYY
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const dateStr = `${day}${month}${year}`;
  
  // Format: HHMMSS (current timestamp)
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timeStr = `${hours}${minutes}${seconds}`;
  
  // Get start and end of today
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  // Find the last order of today
  // Check if order ID follows the ODR format
  const lastOrder = await userPrisma.order.findFirst({
    where: {
      orderDate: {
        gte: todayStart,
        lte: todayEnd,
      },
      id: {
        startsWith: `ODR-${dateStr}-`,
      },
    },
    orderBy: {
      orderDate: "desc",
    },
  });
  
  // Extract serial number from last order or start from 1
  let serialNumber = 1;
  if (lastOrder?.id) {
    const parts = lastOrder.id.split("-");
    if (parts.length === 4 && parts[0] === "ODR") {
      const lastSerial = parseInt(parts[3]);
      if (!isNaN(lastSerial)) {
        serialNumber = lastSerial + 1;
      }
    }
  }
  
  // Determine padding based on serial number
  // If serial number exceeds 9999, use 5 digits, otherwise 4
  // Can extend to 6 digits if needed (99999)
  let padding = 4;
  if (serialNumber > 99999) {
    padding = 6;
  } else if (serialNumber > 9999) {
    padding = 5;
  }
  
  const serialStr = String(serialNumber).padStart(padding, "0");
  
  return `ODR-${dateStr}-${timeStr}-${serialStr}`;
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orders = await userPrisma.order.findMany({
      where: {
        orderBy: session.user.id,
      },
      include: {
        orderItems: true,
        shippingAddress: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
    });

    // Fetch product details for all order items
    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        const orderItemsWithProducts = await Promise.all(
          order.orderItems.map(async (item) => {
            try {
              const product = await productPrisma.product.findUnique({
                where: { id: item.productId },
                select: {
                  id: true,
                  code: true,
                  name: true,
                  mainImage: true,
                  price: true,
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

        return {
          ...order,
          orderItems: orderItemsWithProducts,
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: ordersWithProducts,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
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
      items,
      totalAmount,
      discountAmount,
      addressId,
      deliveryCharge,
    }: {
      items: OrderItemInput[];
      totalAmount?: number;
      discountAmount?: number;
      addressId?: string;
      deliveryCharge?: number | string | null;
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!addressId) {
      return NextResponse.json(
        { success: false, message: 'Address ID is required' },
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const address = await userPrisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Address not found or does not belong to user' },
        { status: 404 }
      );
    }

    // Get user's business account status
    const user = await userPrisma.user.findUnique({
      where: { id: session.user.id },
      select: { isBusinessAccount: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate order ID
    const generatedOrderId = await generateOrderId();

    // Fetch product tax values
    const productIds = items.map((item) => item.productId);
    const products = await productPrisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        tax: true,
      },
    });

    // Create a map of productId to tax for quick lookup
    const productTaxMap = new Map(
      products.map((product) => [product.id, product.tax])
    );

    // Calculate grand total
    const subtotal = totalAmount || 0;
    const discount = discountAmount || 0;
    const shipping =
      typeof deliveryCharge === 'string'
        ? parseFloat(deliveryCharge)
        : deliveryCharge || 0;
    const grandTotal = subtotal - discount + shipping;
    
    // Round the final total
    const roundedTotal = Math.round(grandTotal);
    const roundingOff = roundedTotal - grandTotal;

    // Generate PI number when creating order
    const now = new Date();
    const financialYear = getFinancialYear(now);
    const financialYearStart = getFinancialYearStart(now);
    const isBusinessAccount = user.isBusinessAccount === true;
    
    // Generate PI invoice number (state code 09 by default)
    const { invoiceNumber: piInvoiceNumber, sequenceNumber: piSequenceNumber } = await generateInvoiceNumber(
      "PI",
      isBusinessAccount,
      financialYear,
      financialYearStart,
      "09" // Default state code 09
    );

    // Create order
    const order = await userPrisma.order.create({
      data: {
        id: generatedOrderId,
        orderBy: session.user.id,
        totalAmount: roundedTotal,
        discountAmount: discount,
        shippingAddressId: addressId,
        deliveryCharge: shipping > 0 ? shipping : null,
        status: 'PENDING',
        invoiceOfficeId: 'cml092i700000jxt8bjv8opzq',
        invoiceType: 'PI',
        invoiceSequenceNumber: piSequenceNumber,
        InvoiceNumber: piInvoiceNumber,
        roundedOffAmount: roundingOff,
        invoiceAmount: roundedTotal,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price || 0,
            discount: (item.originalPrice || item.price || 0) - (item.price || 0),
            tax: productTaxMap.get(item.productId) || 0,
          })),
        },
      },
      include: {
        orderItems: true,
        shippingAddress: true,
      },
    });

    return NextResponse.json({
      success: true,
      id: order.id,
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}

