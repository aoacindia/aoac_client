import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbUser, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [row] = await dbUser
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!row) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { password: _password, ...user } = row;

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
