import { carts, dbUser, users } from "../src/lib/db";
import { count } from "drizzle-orm";

async function checkData() {
  try {
    const [userRow] = await dbUser.select({ n: count() }).from(users);
    const userCount = userRow?.n ?? 0;
    console.log(`Total User records: ${userCount}`);

    if (Number(userCount) > 0) {
      const sample = await dbUser
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .limit(5);
      console.log("Sample users:", sample);
    }

    const [cartRow] = await dbUser.select({ n: count() }).from(carts);
    const cartCount = cartRow?.n ?? 0;
    console.log(`\nTotal Cart records: ${cartCount}`);

    if (Number(cartCount) > 0) {
      const sampleCarts = await dbUser
        .select({
          id: carts.id,
          userId: carts.userId,
          productId: carts.productId,
        })
        .from(carts)
        .limit(5);
      console.log("Sample carts:", sampleCarts);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
