import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/product-schema.ts",
  out: "./drizzle/product",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.PRODUCT_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
