import { userPrisma } from "@/lib/db";

type UserPrisma = typeof userPrisma;

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

export async function getMaxSequence(
  prisma: UserPrisma,
  prefix: string,
  year: number
) {
  const expectedPrefix = `${prefix}${year}`;
  const existing = await prisma.user.findMany({
    where: {
      id: {
        startsWith: expectedPrefix,
      },
    },
    select: { id: true },
  });

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
  prisma: UserPrisma,
  isBusinessAccount: boolean
): Promise<string> {
  const prefix = getIdPrefix(isBusinessAccount);
  const year = new Date().getFullYear();
  let sequence = await getMaxSequence(prisma, prefix, year);
  let userId = "";
  let exists = true;

  while (exists) {
    sequence += 1;
    userId = formatUserId(prefix, year, sequence);
    exists = Boolean(
      await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      })
    );
  }
  return userId;
}


