import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userPrisma, productPrisma } from '@/lib/db';

type OrderItemInput = {
  productId: string;
  quantity: number;
  price?: number;
  originalPrice?: number;
};

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

    // Create order
    const order = await userPrisma.order.create({
      data: {
        id: generatedOrderId,
        orderBy: session.user.id,
        totalAmount: grandTotal,
        discountAmount: discount,
        shippingAddressId: addressId,
        deliveryCharge: shipping > 0 ? shipping : null,
        status: 'PENDING',
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

