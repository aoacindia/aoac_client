/**
 * Deletes dependent records (development / reset utility).
 * Order: OrderItem → Order → tables referencing User, etc.
 */

import {
  addresses,
  billingAddresses,
  bulkCarts,
  carts,
  dbUser,
  orderItems,
  orders,
  passwordResets,
  suspensionReasons,
} from "../src/lib/db";

async function cleanupOrphanedRecords() {
  try {
    console.log("Starting cleanup...\n");

    await dbUser.delete(orderItems);
    console.log(`Deleted OrderItem rows`);

    await dbUser.delete(orders);
    console.log(`Deleted Order rows`);

    await dbUser.delete(carts);
    console.log(`Deleted Cart rows`);

    await dbUser.delete(bulkCarts);
    console.log(`Deleted BulkCart rows`);

    await dbUser.delete(addresses);
    console.log(`Deleted Address rows`);

    await dbUser.delete(passwordResets);
    console.log(`Deleted PasswordReset rows`);

    await dbUser.delete(suspensionReasons);
    console.log(`Deleted SuspensionReason rows`);

    await dbUser.delete(billingAddresses);
    console.log(`Deleted BillingAddress rows`);

    console.log("\nCleanup completed.");
  } catch (error) {
    console.error("Cleanup failed:", error);
    throw error;
  }
}

cleanupOrphanedRecords()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
