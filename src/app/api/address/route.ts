import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { addresses, dbUser } from '@/lib/db';
import { and, desc, eq, ne } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rows = await dbUser
      .select()
      .from(addresses)
      .where(eq(addresses.userId, session.user.id))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));

    return NextResponse.json({
      success: true,
      addresses: rows,
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch addresses' },
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

    if (!type || !name || !phone || !houseNo || !line1 || !city || !district || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return NextResponse.json(
        { success: false, message: 'Invalid pincode format. Please enter a valid 6-digit pincode.' },
        { status: 400 }
      );
    }

    const address = await dbUser.transaction(async (tx) => {
      if (isDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(
            and(
              eq(addresses.userId, session.user.id),
              eq(addresses.isDefault, true)
            )
          );
      }

      const [row] = await tx
        .insert(addresses)
        .values({
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
        })
        .returning();
      return row;
    });

    return NextResponse.json(
      { success: true, address },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create address' },
      { status: 500 }
    );
  }
}

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

    if (!type || !name || !phone || !houseNo || !line1 || !city || !district || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return NextResponse.json(
        { success: false, message: 'Invalid pincode format. Please enter a valid 6-digit pincode.' },
        { status: 400 }
      );
    }

    const [existingAddress] = await dbUser
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, session.user.id)))
      .limit(1);

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 }
      );
    }

    await dbUser.transaction(async (tx) => {
      if (isDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(
            and(
              eq(addresses.userId, session.user.id),
              eq(addresses.isDefault, true),
              ne(addresses.id, id)
            )
          );
      }

      await tx
        .update(addresses)
        .set({
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
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, id));
    });

    const [updatedAddress] = await dbUser
      .select()
      .from(addresses)
      .where(eq(addresses.id, id))
      .limit(1);

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
