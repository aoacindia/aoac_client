import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** User / storefront database — use with `DATABASE_URL` */
export const orderStatusEnum = pgEnum("OrderStatus", [
  "PENDING",
  "ORDER_READY",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "ORDER_SHIPPED_WITHOUT_PAYMENT",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

export const users = pgTable(
  "User",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    suspended: boolean("suspended").notNull().default(false),
    suspendedNumber: integer("suspended_number").notNull().default(0),
    terminated: boolean("terminated").notNull().default(false),
    isBusinessAccount: boolean("isBusinessAccount").default(false),
    businessName: text("businessName"),
    gstNumber: text("gstNumber"),
    hasAdditionalTradeName: boolean("hasAdditionalTradeName").default(false),
    additionalTradeName: text("additionalTradeName"),
    phone: text("phone").notNull(),
    password: text("password"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("User_email_key").on(t.email), uniqueIndex("User_phone_key").on(t.phone)]
);

export const otpVerifications = pgTable(
  "OtpVerification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    email: text("email"),
    token: text("token").notNull(),
    otp: text("otp").notNull(),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("OtpVerification_token_key").on(t.token),
    index("OtpVerification_email_idx").on(t.email),
    index("OtpVerification_token_idx").on(t.token),
  ]
);

export const carts = pgTable(
  "Cart",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("userId").notNull(),
    productId: text("productId").notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("cart_user_product_idx").on(t.userId, t.productId)]
);

export const bulkCarts = pgTable(
  "BulkCart",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("userId").notNull(),
    productId: text("productId").notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("bulk_cart_user_product_idx").on(t.userId, t.productId)]
);

export const addresses = pgTable(
  "Address",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("userId").notNull(),
    type: text("type").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    houseNo: text("houseNo").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    district: text("district").notNull(),
    state: text("state").notNull(),
    stateCode: text("stateCode"),
    country: text("country").notNull().default("India"),
    pincode: text("pincode").notNull(),
    isDefault: boolean("isDefault").notNull().default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("Address_userId_idx").on(t.userId)]
);

export const suppliers = pgTable(
  "Supplier",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    type: text("type").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    gstNumber: text("gstNumber"),
    fssaiLicense: text("fssaiLicense"),
    houseNo: text("houseNo").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    district: text("district").notNull(),
    state: text("state").notNull(),
    stateCode: text("stateCode"),
    country: text("country").notNull().default("India"),
    pincode: text("pincode").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("Supplier_email_idx").on(t.email),
    index("Supplier_phone_idx").on(t.phone),
  ]
);

export const orders = pgTable(
  "Order",
  {
    id: text("id").primaryKey(),
    orderBy: text("orderBy").notNull(),
    orderDate: timestamp("orderDate", { mode: "date" }).notNull().defaultNow(),
    status: orderStatusEnum("status").notNull().default("PENDING"),
    totalAmount: doublePrecision("totalAmount").notNull(),
    discountAmount: doublePrecision("discountAmount"),
    paidAmount: doublePrecision("paidAmount"),
    packed: boolean("packed").notNull().default(false),
    refund: boolean("refund").notNull().default(false),
    customOrder: boolean("customOrder").notNull().default(false),
    r_orderId: text("r_orderId"),
    r_paymentId: text("r_paymentId"),
    paymentLinkUrl: text("paymentLinkUrl"),
    paymentMethod: text("paymentMethod"),
    paymentVpa: text("paymentVpa"),
    courierId: integer("courierId"),
    shippingId: text("shippingId"),
    shippingAmount: doublePrecision("shippingAmount"),
    awsCode: text("awsCode"),
    shippingInvoiceNumber: text("shippingInvoiceNumber"),
    shippingCourierName: text("shippingCourierName"),
    estimatedDeliveryDate: text("estimatedDeliveryDate"),
    pickupScheduled: timestamp("pickupScheduled", { mode: "date" }),
    deliveredAt: timestamp("deliveredAt", { mode: "date" }),
    manifestGenerated: boolean("manifestGenerated").default(false),
    InvoiceNumber: text("InvoiceNumber"),
    invoiceType: text("invoiceType"),
    invoiceSequenceNumber: integer("invoiceSequenceNumber"),
    invoiceOfficeId: text("invoiceOfficeId"),
    roundedOffAmount: doublePrecision("roundedOffAmount"),
    invoiceAmount: doublePrecision("invoiceAmount"),
    refundId: text("refundId"),
    refundReceipt: text("refundReceipt"),
    refundArn: text("refundArn"),
    refundCreatedAt: timestamp("refundCreatedAt", { mode: "date" }),
    isDifferentSupplier: boolean("isDifferentSupplier").default(false),
    supplierId: text("supplierId"),
    shippingAddressId: text("shippingAddressId"),
  },
  (t) => [
    index("Order_orderBy_idx").on(t.orderBy),
    index("Order_status_idx").on(t.status),
    index("Order_supplierId_idx").on(t.supplierId),
  ]
);

export const orderItems = pgTable(
  "OrderItem",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    orderId: text("orderId").notNull(),
    productId: text("productId").notNull(),
    quantity: integer("quantity").notNull(),
    price: doublePrecision("price").notNull(),
    discount: doublePrecision("discount").notNull().default(0),
    tax: integer("tax").notNull(),
    customWeightItem: boolean("customWeightItem").notNull().default(false),
    customWeight: doublePrecision("customWeight"),
  },
  (t) => [
    index("OrderItem_orderId_idx").on(t.orderId),
    index("OrderItem_productId_idx").on(t.productId),
  ]
);

export const passwordResets = pgTable(
  "PasswordReset",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    token: text("token").notNull(),
    userId: text("userId").notNull(),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("PasswordReset_token_key").on(t.token),
    index("PasswordReset_userId_idx").on(t.userId),
  ]
);

export const contacts = pgTable("Contact", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const feedback = pgTable("Feedback", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const announcements = pgTable(
  "Announcement",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdBy: text("createdBy").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("Announcement_createdAt_idx").on(t.createdAt)]
);

export const popupAnnouncements = pgTable(
  "PopupAnnouncement",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    isActive: boolean("isActive").notNull().default(false),
    title: text("title").notNull(),
    message: text("message").notNull(),
    startDate: timestamp("startDate", { mode: "date" }).notNull().defaultNow(),
    endDate: timestamp("endDate", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("PopupAnnouncement_isActive_idx").on(t.isActive)]
);

export const suspensionReasons = pgTable(
  "SuspensionReason",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("userId").notNull(),
    reason: text("reason").notNull(),
    suspendedAt: timestamp("suspendedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("SuspensionReason_userId_idx").on(t.userId),
    index("SuspensionReason_suspendedAt_idx").on(t.suspendedAt),
  ]
);

export const billingAddresses = pgTable(
  "BillingAddress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("userId").notNull(),
    houseNo: text("houseNo").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    district: text("district").notNull(),
    state: text("state").notNull(),
    stateCode: text("stateCode"),
    country: text("country").notNull().default("India"),
    pincode: text("pincode").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("BillingAddress_userId_key").on(t.userId),
    index("BillingAddress_userId_idx").on(t.userId),
  ]
);

export const usersRelations = relations(users, ({ many, one }) => ({
  carts: many(carts),
  bulkCarts: many(bulkCarts),
  addresses: many(addresses),
  orders: many(orders, { relationName: "orderUser" }),
  passwordResets: many(passwordResets),
  suspensionReasons: many(suspensionReasons),
  billingAddress: one(billingAddresses, {
    fields: [users.id],
    references: [billingAddresses.userId],
  }),
}));

export const cartsRelations = relations(carts, ({ one }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
}));

export const bulkCartsRelations = relations(bulkCarts, ({ one }) => ({
  user: one(users, { fields: [bulkCarts.userId], references: [users.id] }),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
  orders: many(orders, { relationName: "orderShipping" }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    relationName: "orderUser",
    fields: [orders.orderBy],
    references: [users.id],
  }),
  shippingAddress: one(addresses, {
    relationName: "orderShipping",
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  supplier: one(suppliers, {
    fields: [orders.supplierId],
    references: [suppliers.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, { fields: [passwordResets.userId], references: [users.id] }),
}));

export const suspensionReasonsRelations = relations(
  suspensionReasons,
  ({ one }) => ({
    user: one(users, {
      fields: [suspensionReasons.userId],
      references: [users.id],
    }),
  })
);

export const billingAddressesRelations = relations(
  billingAddresses,
  ({ one }) => ({
    user: one(users, { fields: [billingAddresses.userId], references: [users.id] }),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type NewOtpVerification = typeof otpVerifications.$inferInsert;
export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type BulkCart = typeof bulkCarts.$inferSelect;
export type NewBulkCart = typeof bulkCarts.$inferInsert;
export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type PasswordReset = typeof passwordResets.$inferSelect;
export type NewPasswordReset = typeof passwordResets.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type FeedbackRow = typeof feedback.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type PopupAnnouncement = typeof popupAnnouncements.$inferSelect;
export type SuspensionReason = typeof suspensionReasons.$inferSelect;
export type BillingAddress = typeof billingAddresses.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
