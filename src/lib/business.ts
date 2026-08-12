import { generateNextBusinessId } from "@/lib/business-id";
import { billingAddresses, businesses, dbUser } from "@/lib/db";
import { eq } from "drizzle-orm";

const GST_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;

export type BillingAddressInput = {
  houseNo: string;
  line1: string;
  line2?: string | null;
  city: string;
  district: string;
  state: string;
  stateCode?: string | null;
  pincode: string;
  country?: string;
};

export type CreateBusinessInput = {
  businessName: string;
  gstNumber?: string | null;
  hasAdditionalTradeName?: boolean;
  additionalTradeName?: string | null;
  billingAddress: BillingAddressInput;
};

export function validateBusinessPayload(
  input: CreateBusinessInput,
  options?: { requireGst?: boolean }
): string | null {
  if (!input.businessName?.trim()) {
    return "Business name is required";
  }

  const requireGst = options?.requireGst ?? false;
  if (requireGst && !input.gstNumber?.trim()) {
    return "GST number is required";
  }

  if (input.gstNumber?.trim()) {
    if (!GST_REGEX.test(input.gstNumber.toUpperCase().trim())) {
      return "Invalid GST number format. Please enter a valid 15-character GST number.";
    }
  }

  if (
    input.hasAdditionalTradeName &&
    !input.additionalTradeName?.trim()
  ) {
    return "Additional trade name is required when selected";
  }

  const ba = input.billingAddress;
  if (!ba) {
    return "Billing address is required";
  }
  if (!ba.houseNo?.trim()) return "Billing address house number is required";
  if (!ba.line1?.trim()) return "Billing address line 1 is required";
  if (!ba.city?.trim()) return "Billing city is required";
  if (!ba.district?.trim()) return "Billing district is required";
  if (!ba.state?.trim()) return "Billing state is required";
  if (!ba.pincode?.trim()) return "Billing pincode is required";
  if (!PINCODE_REGEX.test(ba.pincode.trim())) {
    return "Invalid pincode format. Please enter a valid 6-digit pincode.";
  }

  return null;
}

type DbClient = {
  insert: typeof dbUser.insert;
};

export async function createBusinessForUser(
  userId: string,
  input: CreateBusinessInput,
  tx?: DbClient
) {
  const run = async (client: DbClient) => {
    const businessId = await generateNextBusinessId();
    const hasTrade = Boolean(input.hasAdditionalTradeName);

    const [business] = await client
      .insert(businesses)
      .values({
        id: businessId,
        userId,
        businessName: input.businessName.trim(),
        gstNumber: input.gstNumber
          ? input.gstNumber.toUpperCase().trim()
          : null,
        hasAdditionalTradeName: hasTrade,
        additionalTradeName:
          hasTrade && input.additionalTradeName
            ? input.additionalTradeName.trim()
            : null,
      })
      .returning();

    if (!business) {
      throw new Error("Failed to create business");
    }

    const [billing] = await client
      .insert(billingAddresses)
      .values({
        businessId: business.id,
        houseNo: input.billingAddress.houseNo.trim(),
        line1: input.billingAddress.line1.trim(),
        line2: input.billingAddress.line2
          ? input.billingAddress.line2.trim()
          : null,
        city: input.billingAddress.city.trim(),
        district: input.billingAddress.district.trim(),
        state: input.billingAddress.state.trim(),
        stateCode: input.billingAddress.stateCode ?? null,
        pincode: input.billingAddress.pincode.trim(),
        country: input.billingAddress.country?.trim() || "India",
      })
      .returning();

    return { business, billingAddress: billing };
  };

  if (tx) {
    return run(tx);
  }
  return dbUser.transaction(async (inner) => run(inner));
}

export async function assertBusinessOwnedByUser(
  businessId: string,
  userId: string
) {
  const [row] = await dbUser
    .select({ id: businesses.id, userId: businesses.userId })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);

  if (!row || row.userId !== userId) {
    return null;
  }
  return row;
}
