import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { addresses, dbUser } from "@/lib/db";
import { calculateDelhiveryShipping } from "@/lib/delhivery-shipping";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { addressId, totalWeightWithPackaging } = body as {
      addressId?: string;
      totalWeightWithPackaging?: number;
    };

    if (!addressId) {
      return NextResponse.json(
        { success: false, message: "Address ID is required" },
        { status: 400 }
      );
    }

    const [address] = await dbUser
      .select()
      .from(addresses)
      .where(
        and(eq(addresses.id, addressId), eq(addresses.userId, session.user.id))
      )
      .limit(1);

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    const gramsRaw = Number(totalWeightWithPackaging);
    const grams = Number.isFinite(gramsRaw) ? Math.round(gramsRaw) : 0;
    /** Delhivery helper treats `0` as missing; use minimum billable gram */
    const totalWeight = Math.max(grams, 1);

    const result = await calculateDelhiveryShipping({
      delivery_postcode: address.pincode.trim(),
      totalWeight,
    });

    const success = result.status === "success";

    return NextResponse.json({
      success,
      status: result.status,
      provider: result.provider,
      delivery_charges: result.delivery_charges,
      message: result.delivery_charges.message,
    });
  } catch (error) {
    console.error("Error calculating shipping:", error);
    return NextResponse.json(
      {
        success: false,
        status: "error" as const,
        message: error instanceof Error ? error.message : "Internal server error",
        delivery_charges: {
          courier_name: "Delhivery",
          freight_charge: 0,
          isServiceable: false,
          message:
            error instanceof Error ? error.message : "Unable to calculate shipping",
        },
      },
      { status: 500 }
    );
  }
}
