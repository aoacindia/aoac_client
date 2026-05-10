import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Product catalog database — use with `PRODUCT_DATABASE_URL` */

export const categories = pgTable("Category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const products = pgTable(
  "Product",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    price: doublePrecision("price").notNull(),
    regularPrice: doublePrecision("regularPrice"),
    length: doublePrecision("length"),
    breadth: doublePrecision("breadth"),
    height: doublePrecision("height"),
    weight: doublePrecision("weight"),
    packingWeight: doublePrecision("packingWeight"),
    tax: integer("tax").notNull(),
    hsnsac: text("hsnsac"),
    mainImage: text("mainImage"),
    images: jsonb("images"),
    inStock: boolean("inStock").notNull().default(true),
    approved: boolean("approved").notNull(),
    webVisible: boolean("webVisible").notNull().default(true),
    stockCount: integer("stockCount"),
    vegetable: boolean("vegetable").notNull().default(false),
    veg: boolean("veg").notNull().default(false),
    frozen: boolean("frozen").notNull().default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    createdBy: text("createdBy").notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
    updatedBy: text("updatedBy").notNull(),
    approvedAt: timestamp("approvedAt", { mode: "date" }),
    approvedBy: text("approvedBy"),
    categoryId: text("categoryId").notNull(),
  },
  (t) => [uniqueIndex("Product_code_key").on(t.code)]
);

export const categoryWeightDiscounts = pgTable("CategoryWeightDiscount", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  minWeight: doublePrecision("minWeight").notNull(),
  categoryId: text("categoryId").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const productDiscountPrices = pgTable(
  "ProductDiscountPrice",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("productId").notNull(),
    discountId: text("discountId").notNull(),
    discountPrice: doublePrecision("discountPrice").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("ProductDiscountPrice_productId_discountId_key").on(
      t.productId,
      t.discountId
    ),
  ]
);

export const productWeightDiscounts = pgTable(
  "ProductWeightDiscount",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("productId").notNull(),
    minWeight: doublePrecision("minWeight").notNull(),
    price: doublePrecision("price").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("ProductWeightDiscount_productId_idx").on(t.productId)]
);

export const productNutrition = pgTable(
  "ProductNutrition",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("productId").notNull(),
    name: text("name").notNull(),
    grams: doublePrecision("grams").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("ProductNutrition_productId_idx").on(t.productId)]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  weightDiscounts: many(categoryWeightDiscounts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  discountPrices: many(productDiscountPrices),
  weightDiscounts: many(productWeightDiscounts),
  nutrition: many(productNutrition),
}));

export const categoryWeightDiscountsRelations = relations(
  categoryWeightDiscounts,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [categoryWeightDiscounts.categoryId],
      references: [categories.id],
    }),
    productDiscounts: many(productDiscountPrices),
  })
);

export const productDiscountPricesRelations = relations(
  productDiscountPrices,
  ({ one }) => ({
    product: one(products, {
      fields: [productDiscountPrices.productId],
      references: [products.id],
    }),
    discount: one(categoryWeightDiscounts, {
      fields: [productDiscountPrices.discountId],
      references: [categoryWeightDiscounts.id],
    }),
  })
);

export const productWeightDiscountsRelations = relations(
  productWeightDiscounts,
  ({ one }) => ({
    product: one(products, {
      fields: [productWeightDiscounts.productId],
      references: [products.id],
    }),
  })
);

export const productNutritionRelations = relations(
  productNutrition,
  ({ one }) => ({
    product: one(products, {
      fields: [productNutrition.productId],
      references: [products.id],
    }),
  })
);

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type CategoryWeightDiscount = typeof categoryWeightDiscounts.$inferSelect;
export type ProductDiscountPrice = typeof productDiscountPrices.$inferSelect;
export type ProductWeightDiscount = typeof productWeightDiscounts.$inferSelect;
export type ProductNutritionRow = typeof productNutrition.$inferSelect;
