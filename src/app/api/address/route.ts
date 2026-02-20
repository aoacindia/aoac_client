import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userPrisma } from '@/lib/db';

// GET all addresses for the logged-in user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const addresses = await userPrisma.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST create new address
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
      type,
      name,
      phone,
      houseNo,
      line1,
      line2,
      city,
      district,
      state,
      stateCode,
      pincode,
      isDefault,
    } = body;

    // Validate required fields
    if (!type || !name || !phone || !houseNo || !line1 || !city || !district || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate pincode format (6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return NextResponse.json(
        { success: false, message: 'Invalid pincode format. Please enter a valid 6-digit pincode.' },
        { status: 400 }
      );
    }

    // If this address is set as default, unset other default addresses
    if (isDefault) {
      await userPrisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create the new address
    const address = await userPrisma.address.create({
      data: {
        userId: session.user.id,
        type: type.trim(),
        name: name.trim(),
        phone: phone.trim(),
        houseNo: houseNo.trim(),
        line1: line1.trim(),
        line2: line2 ? line2.trim() : null,
        city: city.trim(),
        district: district.trim(),
        state: state.trim(),
        stateCode: stateCode || null,
        pincode: pincode.trim(),
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      address,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create address' },
      { status: 500 }
    );
  }
}

// PUT update existing address
export async function PUT(req: NextRequest) {
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
      id,
      type,
      name,
      phone,
      houseNo,
      line1,
      line2,
      city,
      district,
      state,
      stateCode,
      pincode,
      isDefault,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Address ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!type || !name || !phone || !houseNo || !line1 || !city || !district || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate pincode format (6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return NextResponse.json(
        { success: false, message: 'Invalid pincode format. Please enter a valid 6-digit pincode.' },
        { status: 400 }
      );
    }

    const existingAddress = await userPrisma.address.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 }
      );
    }

    // If this address is set as default, unset other default addresses
    if (isDefault) {
      await userPrisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          NOT: { id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedAddress = await userPrisma.address.update({
      where: { id },
      data: {
        type: type.trim(),
        name: name.trim(),
        phone: phone.trim(),
        houseNo: houseNo.trim(),
        line1: line1.trim(),
        line2: line2 ? line2.trim() : null,
        city: city.trim(),
        district: district.trim(),
        state: state.trim(),
        stateCode: stateCode || null,
        pincode: pincode.trim(),
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      address: updatedAddress,
    });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update address' },
      { status: 500 }
    );
  }
}

