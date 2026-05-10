/** Postgres unique_violation — replaces Prisma P2002 handling */

export function isUniqueConstraintViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if (!("code" in error)) return false;
  return (error as { code: string }).code === "23505";
}
