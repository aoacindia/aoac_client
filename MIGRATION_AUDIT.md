<!--
================================================================================
PRISMA → DRIZZLE ORM — PHASE 1 AUDIT REPORT
Generated: read-only inventory. No application code was modified.
================================================================================

## 0. Repository structure note (important)

- There is **no** single `prisma/schema.prisma`. The project uses **two** Prisma schemas and **two** generated clients:
  - `prisma/user.schema.prisma` → output `prisma/generated/user` — datasource `env("DATABASE_URL")`, provider **mysql**
  - `prisma/product.schema.prisma` → output `prisma/generated/product` — datasource `env("PRODUCT_DATABASE_URL")`, provider **mysql**
- `src/lib/db.ts` instantiates **both** `UserPrismaClient` and `ProductPrismaClient` as singletons: `userPrisma` and `productPrisma`.
- Your later migration plan shows **one** Neon `DATABASE_URL` and **one** `db` export. You will need a deliberate strategy: **two Neon databases** (two URLs / two Drizzle instances), **one merged Postgres database** with namespaces/schemas, or **one DB with prefixed tables** — this is not decided in the codebase today.

## 1. Environment / DATABASE_URL

- **User DB:** `DATABASE_URL` (see `prisma/user.schema.prisma`). Expected style: MySQL connection string (repository contains **no** committed `.env` / `.env.example`; URLs are not visible in-repo).
- **Product DB:** `PRODUCT_DATABASE_URL` (see `prisma/product.schema.prisma`). Same note.
- Migration target per your plan: **Neon Postgres** — both URLs and any app code that assumes MySQL-specific behavior (e.g. raw SQL in scripts) must be revisited.

---

## 2. Every file that uses Prisma (imports or calls)

### 2.1 Application / library (`src/`)

| File | Lines (Prisma-related) | Notes |
|------|------------------------|-------|
| `src/lib/db.ts` | 1–2, 4–9, 15–17, 20–27 | `PrismaClient` imports (user + product), singletons, exports `userPrisma`, `productPrisma` |
| `src/lib/user-id.ts` | 1–3, 22–65 | Imports `userPrisma` type; `getMaxSequence` / `generateNextUserId` take `prisma: UserPrisma` and call `user.findMany`, `user.findUnique` |
| `src/auth.ts` | 3, 51–89 | `userPrisma.user.findFirst`, `otpVerification.findUnique`, `otpVerification.delete` (×2) |
| `src/app/sitemap.ts` | 2, 62 | `productPrisma.product.findMany` |
| `src/app/api/address/route.ts` | 3, 17, 87, 99, 183, 199, 211 | `address.findMany`, `updateMany`, `create`, `findFirst`, `updateMany`, `update` |
| `src/app/api/cart/route.ts` | 3–4, 13, 39, 62, 92, 97, 137 | `cart` + `product` cross-DB reads/writes |
| `src/app/api/categories/route.ts` | 2, 6 | `category.findMany` |
| `src/app/api/contact/route.ts` | 2, 28 | `contact.create` |
| `src/app/api/orders/route.ts` | 3, 75, 136, 189, 208, 301, 313, 330, 377 | Heavy: includes, nested `order.create`, product lookups |
| `src/app/api/orders/[id]/route.ts` | 3, 21, 53 | `order.findUnique` + `product.findFirst` |
| `src/app/api/payment/update-order/route.ts` | 3, 63, 136, 154, 195, 226, 270 | `order` / `user` / `product` / `cart.deleteMany` |
| `src/app/api/products/route.ts` | 2–3, 18, 36, 71 | `import { Prisma }` for `ProductWhereInput`; `findMany`, `count` |
| `src/app/api/products/[id]/route.ts` | 2, 10, 38 | `product.findFirst`, `findMany` |
| `src/app/api/products/featured/route.ts` | 2, 16, 50 | `findMany`, `count` |
| `src/app/api/products/get-products/[id]/route.ts` | 2, 10 | `product.findFirst` |
| `src/app/api/products/category-discounts/route.ts` | 2, 16 | `categoryWeightDiscount.findMany` (+ nested `include` in file) |
| `src/app/api/products/weight-discounts/route.ts` | 2, 16 | `productWeightDiscount.findMany` |
| `src/app/api/profile/route.ts` | 3, 16 | `user.findUnique` |
| `src/app/api/profile/update/route.ts` | 3–4, 22, 37, 57, 148, 183–184 | `Prisma.UserUpdateInput`, `user.findUnique` (×2), `user.update`, `Prisma.PrismaClientKnownRequestError` P2002 |
| `src/app/api/profile/verify-email-change/route.ts` | 3, 6, 33, 55, 74, 81, 114, 129, 149, 163, 184, 218–219 | User + OTP flow; P2002 handling |
| `src/app/api/search/route.ts` | 2, 112, 147 | `product.findMany` (×2) |
| `src/app/api/shipping/calculate/route.ts` | 3, 36 | `address.findUnique` |
| `src/app/api/weight/calculate/route.ts` | 3, 33 | `product.findMany` |
| `src/app/api/auth/login/route.ts` | 3, 17, 34, 49, 78, 100 | `user`, `otpVerification` |
| `src/app/api/auth/register/route.ts` | 2–3, 112, 127, 139, 170, 173, 205, 224–225 | `generateNextUserId(userPrisma)`, `user.create`, P2002 |
| `src/app/api/auth/reset-password/route.ts` | 2, 25, 40, 67, 84, 94 | OTP + `user.update` |
| `src/app/api/auth/send-otp/route.ts` | 2, 27, 52, 62, 110, 129, 136, 184, 204, 211 | Multiple flows |
| `src/app/api/auth/verify-otp/route.ts` | 2, 16, 31 | OTP verify + delete |

### 2.2 Scripts (`scripts/`)

| File | Lines | Notes |
|------|-------|-------|
| `scripts/check-data.ts` | 1, 3, 7, 11, 18, 22, 32 | `PrismaClient`, `count`, `findMany`, `$disconnect` |
| `scripts/check-user-columns.ts` | 1, 3, 8, 20, 30 | `$queryRawUnsafe` (×2), `$disconnect` |
| `scripts/check-user-mapping.ts` | 1, 3, 8, 18, 26, 39, 49 | `$queryRawUnsafe` (×4), `$disconnect` |
| `scripts/cleanup-orphaned-records.ts` | 8, 10, 17, 21, 25, 29, 33, 37, 41, 50 | `deleteMany` on several models, `$disconnect` |
| `scripts/migrate-user-foreign-keys.ts` | 16, 18, 26, 35, 44, 53, 62, 71, 80, 93 | `$executeRawUnsafe` (×7), `$disconnect` |

### 2.3 Config / build (not runtime app code, but Prisma-related)

| File | Lines | Notes |
|------|-------|-------|
| `package.json` | 7, 12, 41 | `build` runs `prisma generate` for **both** schemas; dependencies `@prisma/client`, `prisma` |
| `.eslintrc.json` | 8 | ignores `prisma/generated/**` |
| `.gitignore` | 3 | ignores `prisma/generated` |

### 2.4 Files checked with **no** Prisma usage

- `src/middleware.ts` — uses `auth()` only; **no** DB calls. Comment references Node runtime for Prisma compatibility (`runtime: 'nodejs'`).
- `src/app/api/auth/[...nextauth]/route.ts` — re-exports `handlers` only.
- `src/lib/actions/auth.ts` — `signOut` only.
- `instrumentation.ts` — no Prisma.
- `src/app/api/payment/order/route.ts`, `src/app/api/payment/verify/route.ts` — no Prisma (Razorpay API only).
- `src/app/api/auth/forgot-password/route.ts` — proxies to `send-otp`, no direct Prisma.

---

## 3. Auth / NextAuth adapter

- **NextAuth v5** (`next-auth`) with **Credentials** provider in `src/auth.ts`.
- **No** `@auth/prisma-adapter` or `PrismaAdapter` — sessions use JWT/credentials flow; user lookup is **direct** `userPrisma` in `authorize`.
- Phase 6 (Drizzle adapter) is **not** required unless you add a database session strategy later.

---

## 4. Transactions (`prisma.$transaction`)

- **None** found under `src/`. No `$transaction` in application code.

---

## 5. Raw queries and connection lifecycle

| Kind | Location | Lines |
|------|----------|-------|
| `$queryRawUnsafe` | `scripts/check-user-mapping.ts` | 8, 18, 26, 39 |
| `$queryRawUnsafe` | `scripts/check-user-columns.ts` | 8, 20 |
| `$executeRawUnsafe` | `scripts/migrate-user-foreign-keys.ts` | 26, 35, 44, 53, 62, 71, 80 |
| `$disconnect` | `scripts/check-data.ts`, `cleanup-orphaned-records.ts`, `check-user-mapping.ts`, `check-user-columns.ts`, `migrate-user-foreign-keys.ts` | see each file |
| `$connect` | **None** found |

---

## 6. Nested create / update (relational writes)

- **`src/app/api/orders/route.ts` POST** (~377–406): `userPrisma.order.create({ data: { ..., orderItems: { create: [...] } }, include: { ... } })` — **nested create** of `OrderItem` rows in one call. Drizzle migration should use a **transaction**: insert `Order`, then insert `OrderItem` rows, preserve response shape (`include` equivalents via joins or follow-up selects).

- Other routes use **flat** `create`/`update` on single models (user, contact, address, cart, otp, etc.) or `updateMany` — no other nested `create`/`connect` trees found in `src/`.

---

## 7. `include` / `select` (read path complexity)

Many routes use Prisma `include` for nested graph loading (e.g. `order` + `orderItems` + `shippingAddress`; `product` + `category` + discounts). Representative files: `orders/route.ts` GET, `orders/[id]/route.ts`, `products/route.ts`, `[id]/route.ts`, `featured`, `search`, `cart`, `category-discounts`, `get-products/[id]`, `payment/update-order`. These map to **Drizzle joins** or **multiple queries** with manual assembly — preserve JSON shapes for the frontend.

---

## 8. Prisma type / error imports (non-query)

| File | Usage |
|------|--------|
| `src/app/api/products/route.ts` | `Prisma.ProductWhereInput` for dynamic `where` object |
| `src/app/api/profile/update/route.ts` | `Prisma.UserUpdateInput` for partial updates |
| `src/app/api/auth/register/route.ts` | `Prisma.PrismaClientKnownRequestError`, code `P2002` |
| `src/app/api/profile/update/route.ts` | Same P2002 pattern |
| `src/app/api/profile/verify-email-change/route.ts` | Same P2002 pattern |

Post-Drizzle: map unique violations to Postgres error codes / Drizzle driver errors instead of Prisma `P2002`.

---

## 9. Prisma models and fields (user schema — `prisma/user.schema.prisma`)

**Datasource / generator:** MySQL, `DATABASE_URL`, client output `./generated/user`.

### User
- `id` String @id @default(cuid())
- `name` String
- `email` String @unique
- `suspended` Boolean @default(false)
- `suspended_number` Int @default(0)
- `terminated` Boolean @default(false)
- `isBusinessAccount` Boolean? @default(false)
- `businessName` String?
- `gstNumber` String?
- `hasAdditionalTradeName` Boolean? @default(false)
- `additionalTradeName` String?
- `phone` String @unique
- `password` String?
- `createdAt` DateTime @default(now())
- `updatedAt` DateTime @updatedAt

### OtpVerification
- `id` String @id @default(cuid())
- `email` String?
- `token` String @unique
- `otp` String
- `expiresAt` DateTime
- `createdAt` DateTime @default(now())
- `updatedAt` DateTime @updatedAt
- @@index([email]), @@index([token])

### Cart
- `id`, `userId`, `productId`, `quantity` Int @default(1), `createdAt`, `updatedAt`
- @@index([userId, productId]) name `cart_user_product_idx`

### BulkCart
- Same shape as Cart for scalar fields
- @@index([userId, productId]) name `bulk_cart_user_product_idx`

### Address
- `id`, `userId`, `type`, `name`, `phone`, `houseNo`, `line1`, `line2?`, `city`, `district`, `state`, `stateCode?`, `country` @default("India"), `pincode`, `isDefault`, `createdAt`, `updatedAt`
- @@index([userId])

### Order
- `id` String @id (app-generated, not cuid default)
- `orderBy` String (FK to User.id)
- `orderDate` DateTime @default(now())
- `status` OrderStatus @default(PENDING)
- `totalAmount` Float, `discountAmount` Float?, `paidAmount` Float?
- `packed` Boolean @default(false), `refund` Boolean @default(false), `customOrder` Boolean @default(false)
- Payment: `r_orderId`, `r_paymentId`, `paymentLinkUrl`, `paymentMethod`, `paymentVpa`
- Shipping: `courierId` Int?, `shippingId`, `shippingAmount` Float?, `awsCode`, `shippingInvoiceNumber`, `shippingCourierName`, `estimatedDeliveryDate`, `pickupScheduled`, `deliveredAt`
- Docs: `manifestGenerated` Boolean?, `InvoiceNumber`, `invoiceType`, `invoiceSequenceNumber` Int?, `invoiceOfficeId`
- Invoice amounts: `roundedOffAmount` Float?, `invoiceAmount` Float?
- Refund: `refundId`, `refundReceipt`, `refundArn`, `refundCreatedAt`
- Supplier: `isDifferentSupplier` Boolean?, `supplierId` String?
- `shippingAddressId` String?
- @@index([orderBy]), @@index([status]), @@index([supplierId])

### OrderItem
- `id` @default(cuid()), `orderId`, `productId`, `quantity`, `price` Float, `discount` Float @default(0), `tax` Int, `customWeightItem` Boolean @default(false), `customWeight` Float?
- @@index([orderId]), @@index([productId])

### OrderStatus (enum)
PENDING, ORDER_READY, PAYMENT_PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED

### PasswordReset
- `id` @id @default(uuid()), `token` @unique, `userId`, `expiresAt`, `createdAt`
- @@index([userId]), onDelete Cascade on user relation

### Contact
- `id`, `name`, `email`, `subject`, `message` @db.Text, `createdAt`, `updatedAt`

### Feedback
- `id`, `message`, `createdAt`

### Announcement
- `id`, `title`, `content` @db.Text, `createdBy`, `createdAt`, `updatedAt`
- @@index([createdAt])

### PopupAnnouncement
- `id`, `isActive`, `title`, `message` @db.Text, `startDate` @default(now()), `endDate` DateTime?, `createdAt`, `updatedAt`
- @@index([isActive])

### SuspensionReason
- `id`, `userId`, `reason` @db.Text, `suspendedAt` @default(now())
- @@index([userId]), @@index([suspendedAt]), onDelete Cascade

### BillingAddress
- `id`, `userId` @unique, address fields..., `createdAt`, `updatedAt`
- @@index([userId]), onDelete Cascade

### Supplier
- `id`, `type`, `name`, `phone`, `email`, `gstNumber?`, `fssaiLicense?`, address fields..., `createdAt`, `updatedAt`
- @@index([email]), @@index([phone])

---

## 10. Prisma models and fields (product schema — `prisma/product.schema.prisma`)

**Datasource / generator:** MySQL, `PRODUCT_DATABASE_URL`, output `./generated/product`.

### Category
- `id` @default(cuid()), `name`, `createdAt`, `updatedAt`

### Product
- `id`, `code` @unique, `name`, `description` Text?, `price` Float, `regularPrice` Float?, dimensions/weight fields Float?, `tax` Int, `hsnsac`, `mainImage`, `images` Json?, `inStock` @default(true), `approved` Boolean, `webVisible` @default(true), `stockCount` Int?, `vegetable`, `veg`, `frozen` Booleans
- Audit: `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `approvedAt`, `approvedBy`
- `categoryId` → Category

### CategoryWeightDiscount
- `id`, `minWeight` Float, `categoryId`, `createdAt`, `updatedAt`

### ProductDiscountPrice
- `id`, `productId`, `discountId`, `discountPrice` Float, `createdAt`, `updatedAt`
- @@unique([productId, discountId])

### ProductWeightDiscount
- `id`, `productId`, `minWeight` Float, `price` Float, `createdAt`, `updatedAt`
- @@index([productId])

### ProductNutrition
- `id`, `productId`, `name`, `grams` Float, `createdAt`, `updatedAt`
- @@index([productId])

---

## 11. Relations (all)

### User DB
- **User** → Cart (1-n), BulkCart (1-n), Address (1-n), Order (1-n via `order.orderBy`), PasswordReset (1-n), SuspensionReason (1-n), BillingAddress (1-1 optional unique on userId)
- **Address** → User (n-1), Order (1-n as shipping address)
- **Order** → User (n-1), Address? (n-1 optional), Supplier? (n-1 optional), OrderItem (1-n)
- **OrderItem** → Order (n-1)
- **PasswordReset** → User (n-1, cascade)
- **SuspensionReason** → User (n-1, cascade)
- **BillingAddress** → User (n-1, cascade)
- **Supplier** → Order (1-n)

**Standalone / no FK in schema:** OtpVerification, Contact, Feedback, Announcement, PopupAnnouncement.

### Product DB
- **Category** → Product (1-n), CategoryWeightDiscount (1-n)
- **Product** → Category (n-1), ProductDiscountPrice (1-n), ProductWeightDiscount (1-n), ProductNutrition (1-n)
- **CategoryWeightDiscount** → Category (n-1), ProductDiscountPrice (1-n)
- **ProductDiscountPrice** → Product (n-1), CategoryWeightDiscount (n-1); composite unique (productId, discountId)
- **ProductWeightDiscount** → Product (n-1)
- **ProductNutrition** → Product (n-1)

**Cross-database note:** `Cart.productId`, `OrderItem.productId`, etc. reference **logical** product IDs but live on the **user** DB — the product row is fetched via `productPrisma` in application code. Drizzle design must preserve this **two-database** split or migrate to one DB with explicit FKs if you merge data.

---

## 12. Models in schema with no direct Prisma calls found in audited `src/` routes

Still part of the schema and may be used by admin/other services or reserved: **BulkCart**, **PasswordReset**, **Feedback**, **Announcement**, **PopupAnnouncement**, **SuspensionReason**, **BillingAddress**, **Supplier** (Order has optional supplier relation but no dedicated Supplier CRUD in listed API files). Include in Drizzle schema for parity and scripts.

---

## 13. Edge cases / special attention for Phase 3+

1. **Two databases / two clients today** — `DATABASE_URL` vs `PRODUCT_DATABASE_URL`; Neon migration must not silently merge without a data plan.
2. **MySQL → Postgres** — types (`Json`, `Text`, floats), quoting, and raw SQL scripts (`scripts/*.ts`) are MySQL-specific; rewrite or drop for Postgres.
3. **Dual `prisma generate` in build** — replaced by Drizzle kit + single or dual schema strategy.
4. **Order ID** — string PK not using Prisma `@default`; app generates `ODR-...` in `orders/route.ts`.
5. **User ID** — `generateNextUserId` uses **string** IDs with year/prefix sequencing (`US2025...` / `BS2025...`), not plain cuid.
6. **P2002 handling** — three routes; replace with Postgres unique violation detection.
7. **`OrderStatus` enum** — map to Drizzle `pgEnum` or text + check constraint.
8. **Nested order create** — must become transactional multi-table insert in Drizzle.
9. **Heavy `include` graphs** — orders list/detail and product listing need careful joins to match existing API JSON.
10. **Middleware** — `runtime: 'nodejs'` comment was for Prisma/Edge; revalidate after Drizzle + Neon HTTP driver (often still avoid Edge if unsupported).

================================================================================
END OF PHASE 1 AUDIT
================================================================================
-->

# Migration audit (Phase 1)

The machine-readable **full audit** is in the HTML comment at the top of this file (view raw / source in your editor).

**Summary for humans**

- Prisma is wired through **`src/lib/db.ts`** as **`userPrisma`** and **`productPrisma`** (two generated clients).
- **NextAuth** does not use a Prisma adapter; it queries **`userPrisma`** inside the Credentials provider.
- **Middleware** does not call Prisma.
- There are **no** `prisma.$transaction` calls in `src/`. **One** notable nested write: **`POST /api/orders`** — `order.create` with **`orderItems.create`**.
- **Raw SQL** appears only in **`scripts/`** (`$queryRawUnsafe` / `$executeRawUnsafe`) plus **`$disconnect`** in those scripts.
- Schemas are split across **`prisma/user.schema.prisma`** and **`prisma/product.schema.prisma`** (not `prisma/schema.prisma`).

Confirm this audit before **Phase 2** (install Drizzle packages).
