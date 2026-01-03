import { signup, login } from './src/services/auth.service';
import { prisma } from './src/config/database';
import { Occupation } from './src/types';

async function main() {
    const testEmail = `test_${Date.now()}@example.com`;
    console.log(`Testing with email: ${testEmail}`);

    try {
        // 1. Test Signup
        console.log('--- Testing Signup ---');
        const signupResult = await signup({
            fullName: 'Test User',
            email: testEmail,
            password: 'Password123!',
            occupation: 'ENGINEER' as Occupation,
            age: 25,
            timezone: 'UTC'
        });

        if (signupResult.token && signupResult.user) {
            console.log('✅ Signup successful! Token received.');
            console.log(`User ID: ${signupResult.user.id}`);
        } else {
            console.error('❌ Signup failed: No token or user returned.');
            process.exit(1);
        }

        // 2. Test Login
        console.log('\n--- Testing Login ---');
        const loginResult = await login({
            email: testEmail,
            password: 'Password123!'
        });

        if (loginResult.token && loginResult.user) {
            console.log('✅ Login successful! Token received.');
        } else {
            console.error('❌ Login failed: No token returned.');
            process.exit(1);
        }

        // Cleanup
        await prisma.user.delete({ where: { email: testEmail } });
        console.log('\n✅ Verification Complete. Cleanup done.');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
