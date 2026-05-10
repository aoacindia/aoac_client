CREATE TYPE "public"."OrderStatus" AS ENUM('PENDING', 'ORDER_READY', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'ORDER_SHIPPED_WITHOUT_PAYMENT', 'DELIVERED', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TABLE "Address" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"houseNo" text NOT NULL,
	"line1" text NOT NULL,
	"line2" text,
	"city" text NOT NULL,
	"district" text NOT NULL,
	"state" text NOT NULL,
	"stateCode" text,
	"country" text DEFAULT 'India' NOT NULL,
	"pincode" text NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Announcement" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BillingAddress" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"houseNo" text NOT NULL,
	"line1" text NOT NULL,
	"line2" text,
	"city" text NOT NULL,
	"district" text NOT NULL,
	"state" text NOT NULL,
	"stateCode" text,
	"country" text DEFAULT 'India' NOT NULL,
	"pincode" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BulkCart" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"productId" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Cart" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"productId" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Contact" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OrderItem" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"productId" text NOT NULL,
	"quantity" integer NOT NULL,
	"price" double precision NOT NULL,
	"discount" double precision DEFAULT 0 NOT NULL,
	"tax" integer NOT NULL,
	"customWeightItem" boolean DEFAULT false NOT NULL,
	"customWeight" double precision
);
--> statement-breakpoint
CREATE TABLE "Order" (
	"id" text PRIMARY KEY NOT NULL,
	"orderBy" text NOT NULL,
	"orderDate" timestamp DEFAULT now() NOT NULL,
	"status" "OrderStatus" DEFAULT 'PENDING' NOT NULL,
	"totalAmount" double precision NOT NULL,
	"discountAmount" double precision,
	"paidAmount" double precision,
	"packed" boolean DEFAULT false NOT NULL,
	"refund" boolean DEFAULT false NOT NULL,
	"customOrder" boolean DEFAULT false NOT NULL,
	"r_orderId" text,
	"r_paymentId" text,
	"paymentLinkUrl" text,
	"paymentMethod" text,
	"paymentVpa" text,
	"courierId" integer,
	"shippingId" text,
	"shippingAmount" double precision,
	"awsCode" text,
	"shippingInvoiceNumber" text,
	"shippingCourierName" text,
	"estimatedDeliveryDate" text,
	"pickupScheduled" timestamp,
	"deliveredAt" timestamp,
	"manifestGenerated" boolean DEFAULT false,
	"InvoiceNumber" text,
	"invoiceType" text,
	"invoiceSequenceNumber" integer,
	"invoiceOfficeId" text,
	"roundedOffAmount" double precision,
	"invoiceAmount" double precision,
	"refundId" text,
	"refundReceipt" text,
	"refundArn" text,
	"refundCreatedAt" timestamp,
	"isDifferentSupplier" boolean DEFAULT false,
	"supplierId" text,
	"shippingAddressId" text
);
--> statement-breakpoint
CREATE TABLE "OtpVerification" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"token" text NOT NULL,
	"otp" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PasswordReset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PopupAnnouncement" (
	"id" text PRIMARY KEY NOT NULL,
	"isActive" boolean DEFAULT false NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"startDate" timestamp DEFAULT now() NOT NULL,
	"endDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Supplier" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"gstNumber" text,
	"fssaiLicense" text,
	"houseNo" text NOT NULL,
	"line1" text NOT NULL,
	"line2" text,
	"city" text NOT NULL,
	"district" text NOT NULL,
	"state" text NOT NULL,
	"stateCode" text,
	"country" text DEFAULT 'India' NOT NULL,
	"pincode" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SuspensionReason" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"reason" text NOT NULL,
	"suspendedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"suspended" boolean DEFAULT false NOT NULL,
	"suspended_number" integer DEFAULT 0 NOT NULL,
	"terminated" boolean DEFAULT false NOT NULL,
	"isBusinessAccount" boolean DEFAULT false,
	"businessName" text,
	"gstNumber" text,
	"hasAdditionalTradeName" boolean DEFAULT false,
	"additionalTradeName" text,
	"phone" text NOT NULL,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "Address_userId_idx" ON "Address" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "BillingAddress_userId_key" ON "BillingAddress" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "BillingAddress_userId_idx" ON "BillingAddress" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "bulk_cart_user_product_idx" ON "BulkCart" USING btree ("userId","productId");--> statement-breakpoint
CREATE INDEX "cart_user_product_idx" ON "Cart" USING btree ("userId","productId");--> statement-breakpoint
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "Order_orderBy_idx" ON "Order" USING btree ("orderBy");--> statement-breakpoint
CREATE INDEX "Order_status_idx" ON "Order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Order_supplierId_idx" ON "Order" USING btree ("supplierId");--> statement-breakpoint
CREATE UNIQUE INDEX "OtpVerification_token_key" ON "OtpVerification" USING btree ("token");--> statement-breakpoint
CREATE INDEX "OtpVerification_email_idx" ON "OtpVerification" USING btree ("email");--> statement-breakpoint
CREATE INDEX "OtpVerification_token_idx" ON "OtpVerification" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset" USING btree ("token");--> statement-breakpoint
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "PopupAnnouncement_isActive_idx" ON "PopupAnnouncement" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "Supplier_email_idx" ON "Supplier" USING btree ("email");--> statement-breakpoint
CREATE INDEX "Supplier_phone_idx" ON "Supplier" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "SuspensionReason_userId_idx" ON "SuspensionReason" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "SuspensionReason_suspendedAt_idx" ON "SuspensionReason" USING btree ("suspendedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "User_phone_key" ON "User" USING btree ("phone");