import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const users = await (prisma as any).user.findMany();
    for (const user of users) {
        const isPasswordValid = await bcrypt.compare('Password123!', user.password);
        console.log(`User: ${user.email}, Valid Password 'Password123!': ${isPasswordValid}`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
