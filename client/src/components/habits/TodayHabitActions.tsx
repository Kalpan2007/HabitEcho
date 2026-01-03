'use client';

import { useTransition, useState, useEffect } from 'react';
import { quickLogEntryAction } from '@/actions/entry.actions';
import { useToast } from '@/components/ui';
import { getToday, cn, formatDisplayDate } from '@/lib/utils';
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
  const [selectedDate, setSelectedDate] = useState(getToday());
  // Optimistic state for immediate UI feedback
  const [optimisticStatus, setOptimisticStatus] = useState<EntryStatus | null>(currentStatus);

  // Sync optimistic state if props change (e.g. from revalidation)
  // We use a key trick or effect to sync. Effect is safer here.
  useEffect(() => {
    setOptimisticStatus(currentStatus);
  }, [currentStatus]);

  const today = getToday();
  const { success, error } = useToast();

  const handleQuickLog = (status: EntryStatus) => {
    // Determine the new status: toggle if clicking same status, otherwise set new status
    // Logic: If clicking DONE and already DONE, maybe un-do? Standard UI usually supports toggle or mutually exclusive buttons.
    // The current UI has generic 'DONE' and 'NOT_DONE' buttons.
    // Let's assume explicit set.

    const prevStatus = optimisticStatus;
    setOptimisticStatus(status); // Optimistic update

    startTransition(async () => {
      const result = await quickLogEntryAction(habitId, selectedDate, status);
      if (result.success) {
        const statusText = status === 'DONE' ? 'completed' : 'marked as not done';
        const dateText = selectedDate === today ? 'today' : `for ${formatDisplayDate(selectedDate)}`;
        success('Entry logged', `"${habitName}" ${statusText} ${dateText}`);
      } else {
        // Revert on failure
        setOptimisticStatus(prevStatus);
        error('Failed to log entry', result.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Date Selection */}
      <div className="relative">
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            // We should ideally fetch the status for this date if we change dates.
            // Currently this component only takes `currentStatus` prop which is usually for 'today'.
            // If user changes date, the `currentStatus` prop is stale.
            // This is a limitation of the current component design. 
            // For now, we accept this or we'd need to fetch status on date change.
          }}
          className="w-[130px] px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          title="Select date to log"
        />
      </div>

      {/* Done button */}
      <button
        onClick={() => handleQuickLog('DONE')}
        disabled={isPending}
        className={cn(
          'p-2 rounded-lg transition-colors disabled:opacity-50',
          optimisticStatus === 'DONE' && selectedDate === today
            ? 'bg-green-100 text-green-600'
            : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
        )}
        title={selectedDate === today ? "Mark today as done" : `Mark ${formatDisplayDate(selectedDate)} as done`}
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
          optimisticStatus === 'NOT_DONE' && selectedDate === today
            ? 'bg-red-100 text-red-600'
            : 'text-gray-400 hover:bg-red-50 hover:text-red-600'
        )}
        title={selectedDate === today ? "Mark today as not done" : `Mark ${formatDisplayDate(selectedDate)} as not done`}

      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
