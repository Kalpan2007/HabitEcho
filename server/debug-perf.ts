
import { PrismaClient } from '@prisma/client';
import * as performanceService from './src/services/performance.service';
import * as habitService from './src/services/habit.service';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Finding a user...');
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('No user found');
            return;
        }
        console.log(`Found user: ${user.id} (${user.email})`);

        const habits = await habitService.getHabits(user.id, { limit: 5, page: 1 });
        console.log(`Found ${habits.habits.length} habits`);

        for (const habit of habits.habits) {
            console.log(`\nTesting habit: ${habit.name} (${habit.id})`);
            try {
                const perf = await performanceService.getHabitPerformance(user.id, habit.id);
                console.log('Success! Performance keys:', Object.keys(perf));
                console.log('Rolling Average:', perf.rollingAverage);
                console.log('Heatmap length:', perf.heatmap.length);
            } catch (error: any) {
                console.error('FAILED to get performance:', error.stack || error);
            }
        }

    } catch (error) {
        console.error('Script error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
