CREATE TABLE "Category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CategoryWeightDiscount" (
	"id" text PRIMARY KEY NOT NULL,
	"minWeight" double precision NOT NULL,
	"categoryId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProductDiscountPrice" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"discountId" text NOT NULL,
	"discountPrice" double precision NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProductNutrition" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"name" text NOT NULL,
	"grams" double precision NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProductWeightDiscount" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"minWeight" double precision NOT NULL,
	"price" double precision NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Product" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" double precision NOT NULL,
	"regularPrice" double precision,
	"length" double precision,
	"breadth" double precision,
	"height" double precision,
	"weight" double precision,
	"packingWeight" double precision,
	"tax" integer NOT NULL,
	"hsnsac" text,
	"mainImage" text,
	"images" jsonb,
	"inStock" boolean DEFAULT true NOT NULL,
	"approved" boolean NOT NULL,
	"webVisible" boolean DEFAULT true NOT NULL,
	"stockCount" integer,
	"vegetable" boolean DEFAULT false NOT NULL,
	"veg" boolean DEFAULT false NOT NULL,
	"frozen" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" text NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"updatedBy" text NOT NULL,
	"approvedAt" timestamp,
	"approvedBy" text,
	"categoryId" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "ProductDiscountPrice_productId_discountId_key" ON "ProductDiscountPrice" USING btree ("productId","discountId");--> statement-breakpoint
CREATE INDEX "ProductNutrition_productId_idx" ON "ProductNutrition" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "ProductWeightDiscount_productId_idx" ON "ProductWeightDiscount" USING btree ("productId");--> statement-breakpoint
CREATE UNIQUE INDEX "Product_code_key" ON "Product" USING btree ("code");