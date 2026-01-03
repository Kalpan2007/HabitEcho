'use client';

import { useTransition } from 'react';
import { quickLogEntryAction } from '@/actions/entry.actions';
import { useToast } from '@/components/ui';
import { getToday, cn } from '@/lib/utils';
import type { EntryStatus } from '@/types';

// ============================================
// TODAY HABIT ACTIONS - Client Component
// Quick action buttons for marking habits done/not done
// ============================================

interface TodayHabitActionsProps {
  habitId: string;
  habitName: string;
  currentStatus: EntryStatus | null;
}

export function TodayHabitActions({ habitId, habitName, currentStatus }: TodayHabitActionsProps) {
  const [isPending, startTransition] = useTransition();
  const today = getToday();
  const { success, error } = useToast();

  const handleQuickLog = (status: EntryStatus) => {
    startTransition(async () => {
      const result = await quickLogEntryAction(habitId, today, status);
      if (result.success) {
        const statusText = status === 'DONE' ? 'completed' : 'marked as not done';
        success('Entry logged', `"${habitName}" ${statusText}`);
      } else {
        error('Failed to log entry', result.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-1">
      {/* Done button */}
      <button
        onClick={() => handleQuickLog('DONE')}
        disabled={isPending}
        className={cn(
          'p-2 rounded-lg transition-colors disabled:opacity-50',
          currentStatus === 'DONE'
            ? 'bg-green-100 text-green-600'
            : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
        )}
        title="Mark as done"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </button>

      {/* Not done button */}
      <button
        onClick={() => handleQuickLog('NOT_DONE')}
        disabled={isPending}
        className={cn(
          'p-2 rounded-lg transition-colors disabled:opacity-50',
          currentStatus === 'NOT_DONE'
            ? 'bg-red-100 text-red-600'
            : 'text-gray-400 hover:bg-red-50 hover:text-red-600'
        )}
        title="Mark as not done"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
