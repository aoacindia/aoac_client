/**
 * Two Neon databases:
 * - `dbUser`  → DATABASE_URL (storefront / users, orders, carts, …)
 * - `dbProduct` → PRODUCT_DATABASE_URL (catalog)
 *
 * Use `neon-serverless` Pool (not neon-http) so `transaction()` works.
 *
 * Cross-DB linkage: `Cart`, `BulkCart`, and `OrderItem` use plain-text `productId`
 * matching `Product.id` in the product DB — no FK across instances; validate in app code.
 *
 * In development, pools are cached on globalThis so Next.js hot reload does not spawn
 * unlimited connections.
 */
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as productSchema from "./product-schema";
import * as userSchema from "./user-schema";

const userUrl = process.env.DATABASE_URL;
const productUrl = process.env.PRODUCT_DATABASE_URL;

if (!userUrl) {
  throw new Error("DATABASE_URL is not set");
}

if (!productUrl) {
  throw new Error("PRODUCT_DATABASE_URL is not set");
}

type NeonPoolGlobal = typeof globalThis & {
  __drizzleNeonPoolUser?: Pool;
  __drizzleNeonPoolProduct?: Pool;
};

function getPool(
  cacheKey: keyof Pick<
    NeonPoolGlobal,
    "__drizzleNeonPoolUser" | "__drizzleNeonPoolProduct"
  >,
  connectionString: string
): Pool {
  if (process.env.NODE_ENV !== "development") {
    return new Pool({ connectionString });
  }
  const g = globalThis as NeonPoolGlobal;
  if (!g[cacheKey]) {
    g[cacheKey] = new Pool({ connectionString });
  }
  return g[cacheKey];
}

const poolUser = getPool("__drizzleNeonPoolUser", userUrl);
const poolProduct = getPool("__drizzleNeonPoolProduct", productUrl);

export const dbUser = drizzle(poolUser, { schema: userSchema });

export const dbProduct = drizzle(poolProduct, {
  schema: productSchema,
});

export * from "./product-schema";
export * from "./user-schema";
