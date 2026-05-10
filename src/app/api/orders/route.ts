import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  addresses,
  dbProduct,
  dbUser,
  orderItems,
  orders,
  products,
  users,
} from '@/lib/db';
import { and, desc, eq, gte, inArray, like, lte } from 'drizzle-orm';

type OrderItemInput = {
  productId: string;
  quantity: number;
  price?: number;
  originalPrice?: number;
};

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

async function generateOrderId(): Promise<string> {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const dateStr = `${day}${month}${year}`;

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timeStr = `${hours}${minutes}${seconds}`;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [lastOrder] = await dbUser
    .select()
    .from(orders)
    .where(
      and(
        gte(orders.orderDate, todayStart),
        lte(orders.orderDate, todayEnd),
        like(orders.id, `ODR-${dateStr}-%`)
      )
    )
    .orderBy(desc(orders.orderDate))
    .limit(1);

  let serialNumber = 1;
  if (lastOrder?.id) {
    const parts = lastOrder.id.split("-");
    if (parts.length === 4 && parts[0] === "ODR") {
      const lastSerial = parseInt(parts[3], 10);
      if (!isNaN(lastSerial)) {
        serialNumber = lastSerial + 1;
      }
    }
  }

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

    const orderList = await dbUser.query.orders.findMany({
      where: eq(orders.orderBy, session.user.id),
      with: {
        orderItems: true,
        shippingAddress: true,
      },
      orderBy: [desc(orders.orderDate)],
    });

    const ordersWithProducts = await Promise.all(
      orderList.map(async (order) => {
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
                  mainImage: true,
                  price: true,
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

    const [address] = await dbUser
      .select()
      .from(addresses)
      .where(eq(addresses.id, addressId))
      .limit(1);

    if (!address || address.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Address not found or does not belong to user' },
        { status: 404 }
      );
    }

    const [user] = await dbUser
      .select({ isBusinessAccount: users.isBusinessAccount })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const generatedOrderId = await generateOrderId();

    const productIds = items.map((item) => item.productId);
    const productRows = await dbProduct
      .select({
        id: products.id,
        tax: products.tax,
      })
      .from(products)
      .where(
        and(inArray(products.id, productIds), eq(products.webVisible, true))
      );

    const productTaxMap = new Map(
      productRows.map((p) => [p.id, p.tax])
    );

    const subtotal = totalAmount || 0;
    const discount = discountAmount || 0;
    const shipping =
      typeof deliveryCharge === 'string'
        ? parseFloat(deliveryCharge)
        : deliveryCharge || 0;
    const grandTotal = subtotal - discount + shipping;

    const roundedTotal = Math.round(grandTotal);
    const roundingOff = roundedTotal - grandTotal;

    const now = new Date();
    const financialYear = getFinancialYear(now);
    const financialYearStart = getFinancialYearStart(now);
    const isBusinessAccount = user.isBusinessAccount === true;

    const { invoiceNumber: piInvoiceNumber, sequenceNumber: piSequenceNumber } =
      await generateInvoiceNumber(
        "PI",
        isBusinessAccount,
        financialYear,
        financialYearStart,
        "09"
      );

    await dbUser.transaction(async (tx) => {
      await tx.insert(orders).values({
        id: generatedOrderId,
        orderBy: session.user.id,
        totalAmount: roundedTotal,
        discountAmount: discount,
        shippingAddressId: addressId,
        shippingAmount: shipping > 0 ? shipping : null,
        status: "PENDING",
        invoiceOfficeId: 'cml092i700000jxt8bjv8opzq',
        invoiceType: 'PI',
        invoiceSequenceNumber: piSequenceNumber,
        InvoiceNumber: piInvoiceNumber,
        roundedOffAmount: roundingOff,
        invoiceAmount: roundedTotal,
      });

      await tx.insert(orderItems).values(
        items.map((item) => ({
          orderId: generatedOrderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price || 0,
          discount:
            (item.originalPrice || item.price || 0) - (item.price || 0),
          tax: productTaxMap.get(item.productId) ?? 0,
        }))
      );
    });

    const order = await dbUser.query.orders.findFirst({
      where: eq(orders.id, generatedOrderId),
      with: {
        orderItems: true,
        shippingAddress: true,
      },
    });

    return NextResponse.json({
      success: true,
      id: generatedOrderId,
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
