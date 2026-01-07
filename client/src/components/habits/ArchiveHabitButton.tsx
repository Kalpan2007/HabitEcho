'use client';

import { useRouter } from 'next/navigation';
import { useDeleteHabit } from '@/hooks/useHabits';
import { Button, useToast } from '@/components/ui';
import { ROUTES } from '@/lib/constants';

interface ArchiveHabitButtonProps {
    habitId: string;
    habitName: string;
}

export function ArchiveHabitButton({ habitId, habitName }: ArchiveHabitButtonProps) {
    const { mutate: archiveHabit, isPending } = useDeleteHabit();
    const router = useRouter();
    const { success, error } = useToast();

    const handleArchive = () => {
        const confirmed = window.confirm(
            `Are you sure you want to end "${habitName}"?\n\nThis will mark the habit as inactive. Your history will be preserved, but you won't be able to log new entries.`
        );

        if (!confirmed) return;

        archiveHabit(habitId, {
            onSuccess: () => {
                success('Habit Ended', 'The habit has been moved to your archive.');
                router.push(ROUTES.PROFILE);
            },
            onError: (err: any) => {
                error('Failed to end habit', err.message);
            },
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
