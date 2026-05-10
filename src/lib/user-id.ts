import { dbUser, users } from "@/lib/db";
import { eq, like } from "drizzle-orm";

export function getIdPrefix(isBusinessAccount: boolean) {
  return isBusinessAccount ? "BS" : "US";
}

export function formatUserId(prefix: string, year: number, sequence: number) {
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

export async function getMaxSequence(prefix: string, year: number) {
  const expectedPrefix = `${prefix}${year}`;
  const existing = await dbUser
    .select({ id: users.id })
    .from(users)
    .where(like(users.id, `${expectedPrefix}%`));

  let maxSequence = 0;
  for (const user of existing) {
    const seq = parseSequence(user.id, prefix, year);
    if (seq !== null && seq > maxSequence) {
      maxSequence = seq;
    }
  }
  return maxSequence;
}

export async function generateNextUserId(
  isBusinessAccount: boolean
): Promise<string> {
  const prefix = getIdPrefix(isBusinessAccount);
  const year = new Date().getFullYear();
  let sequence = await getMaxSequence(prefix, year);
  let userId = "";
  let exists = true;

  while (exists) {
    sequence += 1;
    userId = formatUserId(prefix, year, sequence);
    const row = await dbUser
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    exists = row.length > 0;
  }
  return userId;
}
