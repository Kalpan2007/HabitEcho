import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAll() {
  console.log('🗑️  Clearing all data...');
  
  await prisma.habitLog.deleteMany();
  console.log('   - Cleared habit logs');
  
  await prisma.habit.deleteMany();
  console.log('   - Cleared habits');
  
  await prisma.refreshToken.deleteMany();
  console.log('   - Cleared refresh tokens');
  
  await prisma.user.deleteMany();
  console.log('   - Cleared users');
  
  console.log('✅ All data cleared successfully');
}

clearAll()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
