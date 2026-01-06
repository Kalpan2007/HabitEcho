'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { archiveHabitAction } from '@/actions/habit.actions';
import { Button, useToast } from '@/components/ui';
import { ROUTES } from '@/lib/constants';

interface ArchiveHabitButtonProps {
    habitId: string;
    habitName: string;
}

export function ArchiveHabitButton({ habitId, habitName }: ArchiveHabitButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { success, error } = useToast();

    const handleArchive = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to end "${habitName}"?\n\nThis will mark the habit as inactive. Your history will be preserved, but you won't be able to log new entries.`
        );

        if (!confirmed) return;

        startTransition(async () => {
            const result = await archiveHabitAction(habitId);
            if (result.success) {
                success('Habit Ended', 'The habit has been moved to your archive.');
                // Redirect to profile to see it in "Ended Habits" or just refresh
                router.push(ROUTES.PROFILE);
            } else {
                error('Failed to end habit', result.message);
            }
        });
    };

    return (
        <Button
            variant="danger"
            onClick={handleArchive}
            disabled={isPending}
            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 shadow-sm"
        >
            {isPending ? 'Ending...' : 'End Habit'}
        </Button>
    );
}
