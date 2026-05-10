import { sql } from "drizzle-orm";
import { dbUser } from "../src/lib/db";

async function checkColumns() {
  try {
    const result = await dbUser.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'User'
      ORDER BY ordinal_position
    `);

    console.log("Columns in User table:");
    console.log(JSON.stringify(result, null, 2));

    const cartUsers = await dbUser.execute(sql`
      SELECT DISTINCT "userId" FROM "Cart" LIMIT 10
    `);

    console.log("\nSample userId values from Cart:");
    console.log(JSON.stringify(cartUsers, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

checkColumns()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
