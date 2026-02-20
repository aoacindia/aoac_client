import { PrismaClient } from '../prisma/generated/user';

const userPrisma = new PrismaClient();

async function checkMapping() {
  try {
    // Check if Cart userId values match User id values
    const matching = await userPrisma.$queryRawUnsafe(`
      SELECT COUNT(*) as matching_count
      FROM Cart c
      INNER JOIN User u ON c.userId = u.id
    `);
    
    console.log('Cart records with userId matching User.id:');
    console.log(matching);
    
    // Check total Cart records
    const total = await userPrisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total_count FROM Cart
    `);
    
    console.log('\nTotal Cart records:');
    console.log(total);
    
    // Check if there are any Cart records with userId that don't match User.id
    const nonMatching = await userPrisma.$queryRawUnsafe(`
      SELECT c.userId, COUNT(*) as count
      FROM Cart c
      LEFT JOIN User u ON c.userId = u.id
      WHERE u.id IS NULL
      GROUP BY c.userId
      LIMIT 10
    `);
    
    console.log('\nCart userId values that do NOT match any User.id:');
    console.log(nonMatching);
    
    // Get sample User records to see what id values look like
    const sampleUsers = await userPrisma.$queryRawUnsafe(`
      SELECT id, name, email FROM User LIMIT 5
    `);
    
    console.log('\nSample User records:');
    console.log(sampleUsers);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await userPrisma.$disconnect();
  }
}

checkMapping();

