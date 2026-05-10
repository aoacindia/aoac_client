import { sql } from "drizzle-orm";
import { dbUser } from "../src/lib/db";

async function checkMapping() {
  try {
    const matching = await dbUser.execute(sql`
      SELECT COUNT(*)::int AS matching_count
      FROM "Cart" c
      INNER JOIN "User" u ON c."userId" = u.id
    `);

    console.log("Cart records with userId matching User.id:");
    console.log(matching);

    const total = await dbUser.execute(sql`
      SELECT COUNT(*)::int AS total_count FROM "Cart"
    `);

    console.log("\nTotal Cart records:");
    console.log(total);

    const nonMatching = await dbUser.execute(sql`
      SELECT c."userId", COUNT(*)::int AS count
      FROM "Cart" c
      LEFT JOIN "User" u ON c."userId" = u.id
      WHERE u.id IS NULL
      GROUP BY c."userId"
      LIMIT 10
    `);

    console.log("\nCart userId values that do NOT match any User.id:");
    console.log(nonMatching);

    const sampleUsers = await dbUser.execute(sql`
      SELECT id, name, email FROM "User" LIMIT 5
    `);

    console.log("\nSample User records:");
    console.log(sampleUsers);
  } catch (error) {
    console.error("Error:", error);
  }
}

checkMapping()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
