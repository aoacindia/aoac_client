import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { addresses, dbUser } from '@/lib/db';
import { and, eq } from 'drizzle-orm';

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
    const { addressId } = body;

    if (!addressId) {
      return NextResponse.json(
        { success: false, message: 'Address ID is required' },
        { status: 400 }
      );
    }

    const [address] = await dbUser
      .select()
      .from(addresses)
      .where(
        and(
          eq(addresses.id, addressId),
          eq(addresses.userId, session.user.id)
        )
      )
      .limit(1);

    if (!address) {
      return NextResponse.json(
        { success: false, message: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error) {
    console.error('Error fetching address for shipping:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
