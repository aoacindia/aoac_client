import { PrismaClient } from '../prisma/generated/user';

const userPrisma = new PrismaClient();

async function checkData() {
  try {
    const userCount = await userPrisma.user.count();
    console.log(`Total User records: ${userCount}`);
    
    if (userCount > 0) {
      const users = await userPrisma.user.findMany({
        take: 5,
        select: { id: true, name: true, email: true }
      });
      console.log('Sample users:', users);
    }
    
    const cartCount = await userPrisma.cart.count();
    console.log(`\nTotal Cart records: ${cartCount}`);
    
    if (cartCount > 0) {
      const carts = await userPrisma.cart.findMany({
        take: 5,
        select: { id: true, userId: true, productId: true }
      });
      console.log('Sample carts:', carts);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await userPrisma.$disconnect();
  }
}

checkData();

