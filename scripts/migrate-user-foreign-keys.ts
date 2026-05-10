/**
 * Legacy MySQL migration (Prisma era). Not applicable to Neon Postgres.
 * If you still need to remap user IDs, run targeted SQL in the Neon SQL editor.
 */

console.log(
  "This script was for historical MySQL + Prisma migrations and is a no-op on Postgres."
);
console.log("Use npm run db:push:user after updating src/lib/db/user-schema.ts if needed.");
process.exit(0);
