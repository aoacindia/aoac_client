import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { businesses, dbUser } from "@/lib/db";
import {
  createBusinessForUser,
  validateBusinessPayload,
  type CreateBusinessInput,
} from "@/lib/business";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const list = await dbUser.query.businesses.findMany({
      where: eq(businesses.userId, session.user.id),
      with: {
        billingAddress: true,
      },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    return NextResponse.json({
      success: true,
      businesses: list,
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CreateBusinessInput;
    const validationError = validateBusinessPayload(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const { business, billingAddress } = await createBusinessForUser(
      session.user.id,
      body
    );

    return NextResponse.json({
      success: true,
      business: {
        ...business,
        billingAddress,
      },
    });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
