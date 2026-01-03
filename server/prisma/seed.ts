import { PrismaClient, Frequency, EntryStatus, Occupation } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Clean up existing data
    await prisma.habitEntry.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.otpRecord.deleteMany();
    // We'll keep the user if it exists, or create new if not

    const email = 'demo@habitecho.com';

    // 2. Create or Update Demo User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            fullName: 'Demo User',
            password: hashedPassword,
            occupation: Occupation.ENGINEER,
            emailVerified: true,  // Important: Verified
            timezone: 'UTC',
        },
    });

    console.log(`👤 User created/found: ${user.email}`);

    // 3. Define Habits
    const habits = [
        {
            name: '🧘 Morning Meditation',
            description: 'Start the day with 10 minutes of mindfulness',
            frequency: Frequency.DAILY,
            scheduleDays: [0, 1, 2, 3, 4, 5, 6],
        },
        {
            name: '📚 Read 30 Pages',
            description: 'Read non-fiction book',
            frequency: Frequency.DAILY,
            scheduleDays: [0, 1, 2, 3, 4, 5, 6],
        },
        {
            name: '💪 Gym Workout',
            description: 'Weight training and cardio session',
            frequency: Frequency.CUSTOM,
            scheduleDays: [1, 3, 5, 6], // Mon, Wed, Fri, Sat
        },
        {
            name: '💧 Drink 3L Water',
            description: 'Stay hydrated throughout the day',
            frequency: Frequency.DAILY,
            scheduleDays: [0, 1, 2, 3, 4, 5, 6],
        },
        {
            name: '💻 Code Side Project',
            description: 'Work on personal dev projects',
            frequency: Frequency.DAILY,
            scheduleDays: [0, 1, 2, 3, 4, 5, 6],
        },
        {
            name: '📝 Weekly Plan',
            description: 'Plan the upcoming week',
            frequency: Frequency.WEEKLY,
            scheduleDays: [0], // Sunday
        },
    ];

    // 4. Create Habits and History
    const today = new Date();

    for (const habitData of habits) {
        const habit = await prisma.habit.create({
            data: {
                userId: user.id,
                name: habitData.name,
                description: habitData.description,
                frequency: habitData.frequency,
                scheduleDays: habitData.scheduleDays,
                startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000), // Started 90 days ago
            },
        });

        console.log(`Hb Created habit: ${habit.name}`);

        // Generate 90 days of history
        const entries = [];
        for (let i = 0; i < 90; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Skip if future (though we are going backwards, so safe)
            if (date > today) continue;

            const dayOfWeek = date.getDay();

            // Check if scheduled
            let isScheduled = false;
            if (habit.frequency === Frequency.DAILY) isScheduled = true;
            else if (habit.frequency === Frequency.WEEKLY) isScheduled = dayOfWeek === 0; // Default sunday
            else if (habit.frequency === Frequency.CUSTOM && habitData.scheduleDays?.includes(dayOfWeek)) isScheduled = true;

            if (isScheduled) {
                // Randomize status
                // 65% DONE, 10% PARTIAL, 25% NOT_DONE/Skipped (no entry)
                const rand = Math.random();

                if (rand < 0.65) {
                    // DONE
                    entries.push({
                        habitId: habit.id,
                        entryDate: date,
                        status: EntryStatus.DONE,
                        percentComplete: 100,
                    });
                } else if (rand < 0.75) {
                    // PARTIAL
                    entries.push({
                        habitId: habit.id,
                        entryDate: date,
                        status: EntryStatus.PARTIAL,
                        percentComplete: 50,
                        notes: 'Ran out of time',
                    });
                } else if (rand < 0.85) {
                    // NOT DONE explicitly logged
                    entries.push({
                        habitId: habit.id,
                        entryDate: date,
                        status: EntryStatus.NOT_DONE,
                        percentComplete: 0,
                        reason: 'Too tired',
                    });
                }
                // remaining 15% is just missing entry (implicit not done)
            }
        }

        if (entries.length > 0) {
            await prisma.habitEntry.createMany({
                data: entries,
            });
            console.log(`   - Added ${entries.length} entries`);
        }
    }

    console.log('✅ Seeding completed!');
    console.log('📧 Login with: demo@habitecho.com');
    console.log('🔑 Password: Password123!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
