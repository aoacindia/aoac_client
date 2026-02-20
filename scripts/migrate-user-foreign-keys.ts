/**
 * Migration script to update foreign key values from user_Unique_id to id
 * 
 * This script updates all foreign key references in related tables:
 * - Cart
 * - BulkCart
 * - Address
 * - Order
 * - PasswordReset
 * - SuspensionReason
 * - BillingAddress
 * 
 * Run this script BEFORE applying the schema changes with `prisma db push`
 */

import { PrismaClient } from '../prisma/generated/user';

const userPrisma = new PrismaClient();

async function migrateForeignKeys() {
  try {
    console.log('Starting foreign key migration...');

    // Update Cart table
    console.log('Updating Cart table...');
    const cartResult = await userPrisma.$executeRawUnsafe(`
      UPDATE Cart c
      INNER JOIN User u ON c.userId = u.user_Unique_id
      SET c.userId = u.id
    `);
    console.log(`Updated ${cartResult} Cart records`);

    // Update BulkCart table
    console.log('Updating BulkCart table...');
    const bulkCartResult = await userPrisma.$executeRawUnsafe(`
      UPDATE BulkCart bc
      INNER JOIN User u ON bc.userId = u.user_Unique_id
      SET bc.userId = u.id
    `);
    console.log(`Updated ${bulkCartResult} BulkCart records`);

    // Update Address table
    console.log('Updating Address table...');
    const addressResult = await userPrisma.$executeRawUnsafe(`
      UPDATE Address a
      INNER JOIN User u ON a.userId = u.user_Unique_id
      SET a.userId = u.id
    `);
    console.log(`Updated ${addressResult} Address records`);

    // Update Order table
    console.log('Updating Order table...');
    const orderResult = await userPrisma.$executeRawUnsafe(`
      UPDATE \`Order\` o
      INNER JOIN User u ON o.orderBy = u.user_Unique_id
      SET o.orderBy = u.id
    `);
    console.log(`Updated ${orderResult} Order records`);

    // Update PasswordReset table
    console.log('Updating PasswordReset table...');
    const passwordResetResult = await userPrisma.$executeRawUnsafe(`
      UPDATE PasswordReset pr
      INNER JOIN User u ON pr.userId = u.user_Unique_id
      SET pr.userId = u.id
    `);
    console.log(`Updated ${passwordResetResult} PasswordReset records`);

    // Update SuspensionReason table
    console.log('Updating SuspensionReason table...');
    const suspensionReasonResult = await userPrisma.$executeRawUnsafe(`
      UPDATE SuspensionReason sr
      INNER JOIN User u ON sr.userId = u.user_Unique_id
      SET sr.userId = u.id
    `);
    console.log(`Updated ${suspensionReasonResult} SuspensionReason records`);

    // Update BillingAddress table
    console.log('Updating BillingAddress table...');
    const billingAddressResult = await userPrisma.$executeRawUnsafe(`
      UPDATE BillingAddress ba
      INNER JOIN User u ON ba.userId = u.user_Unique_id
      SET ba.userId = u.id
    `);
    console.log(`Updated ${billingAddressResult} BillingAddress records`);

    console.log('\n✅ Migration completed successfully!');
    console.log('You can now run: npx prisma db push --schema=prisma/user.schema.prisma');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await userPrisma.$disconnect();
  }
}

// Run the migration
migrateForeignKeys()
  .then(() => {
    console.log('Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

