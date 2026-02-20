import { PrismaClient } from '../prisma/generated/user';

const userPrisma = new PrismaClient();

async function checkColumns() {
  try {
    // Query to get all columns from User table
    const result = await userPrisma.$queryRawUnsafe(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'User'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Columns in User table:');
    console.log(JSON.stringify(result, null, 2));
    
    // Also check what userId values exist in Cart
    const cartUsers = await userPrisma.$queryRawUnsafe(`
      SELECT DISTINCT userId FROM Cart LIMIT 10
    `);
    
    console.log('\nSample userId values from Cart:');
    console.log(JSON.stringify(cartUsers, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await userPrisma.$disconnect();
  }
}

checkColumns();

