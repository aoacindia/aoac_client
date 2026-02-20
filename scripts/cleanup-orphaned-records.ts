/**
 * Cleanup script to delete orphaned records
 * 
 * Since there are no User records, we'll delete all records from tables
 * that have foreign keys to User table.
 */

import { PrismaClient } from '../prisma/generated/user';

const userPrisma = new PrismaClient();

async function cleanupOrphanedRecords() {
  try {
    console.log('Starting cleanup of orphaned records...\n');

    // Delete all Cart records
    const cartResult = await userPrisma.cart.deleteMany({});
    console.log(`Deleted ${cartResult.count} Cart records`);

    // Delete all BulkCart records
    const bulkCartResult = await userPrisma.bulkCart.deleteMany({});
    console.log(`Deleted ${bulkCartResult.count} BulkCart records`);

    // Delete all Address records
    const addressResult = await userPrisma.address.deleteMany({});
    console.log(`Deleted ${addressResult.count} Address records`);

    // Delete all Order records
    const orderResult = await userPrisma.order.deleteMany({});
    console.log(`Deleted ${orderResult.count} Order records`);

    // Delete all PasswordReset records
    const passwordResetResult = await userPrisma.passwordReset.deleteMany({});
    console.log(`Deleted ${passwordResetResult.count} PasswordReset records`);

    // Delete all SuspensionReason records
    const suspensionReasonResult = await userPrisma.suspensionReason.deleteMany({});
    console.log(`Deleted ${suspensionReasonResult.count} SuspensionReason records`);

    // Delete all BillingAddress records
    const billingAddressResult = await userPrisma.billingAddress.deleteMany({});
    console.log(`Deleted ${billingAddressResult.count} BillingAddress records`);

    console.log('\n✅ Cleanup completed successfully!');
    console.log('You can now run: npx prisma db push --schema=prisma/user.schema.prisma');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    await userPrisma.$disconnect();
  }
}

// Run the cleanup
cleanupOrphanedRecords()
  .then(() => {
    console.log('Cleanup script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup script failed:', error);
    process.exit(1);
  });

