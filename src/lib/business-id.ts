import { businesses, dbUser } from "@/lib/db";
import { eq, like } from "drizzle-orm";

/** Business IDs: BZ{year}{sequence} e.g. BZ20261 — matches admin lib/business-id.ts */
export function getBusinessIdPrefix() {
  return "BZ";
}

export function formatBusinessId(
  prefix: string,
  year: number,
  sequence: number
) {
  return `${prefix}${year}${sequence}`;
}

function parseSequence(id: string, prefix: string, year: number) {
  const expectedPrefix = `${prefix}${year}`;
  if (!id.startsWith(expectedPrefix)) return null;
  const sequencePart = id.slice(expectedPrefix.length);
  if (!sequencePart) return null;
  const sequenceValue = Number(sequencePart);
  return Number.isFinite(sequenceValue) ? sequenceValue : null;
}

export async function getMaxBusinessSequence(prefix: string, year: number) {
  const expectedPrefix = `${prefix}${year}`;
  const existing = await dbUser
    .select({ id: businesses.id })
    .from(businesses)
    .where(like(businesses.id, `${expectedPrefix}%`));

  let maxSequence = 0;
  for (const row of existing) {
    const seq = parseSequence(row.id, prefix, year);
    if (seq !== null && seq > maxSequence) {
      maxSequence = seq;
    }
  }
  return maxSequence;
}

export async function generateNextBusinessId(): Promise<string> {
  const prefix = getBusinessIdPrefix();
  const year = new Date().getFullYear();
  let sequence = await getMaxBusinessSequence(prefix, year);
  let businessId = "";
  let exists = true;

  while (exists) {
    sequence += 1;
    businessId = formatBusinessId(prefix, year, sequence);
    const row = await dbUser
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);
    exists = row.length > 0;
  }
  return businessId;
}
