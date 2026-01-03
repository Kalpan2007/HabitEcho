'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteHabitAction, toggleHabitActiveAction } from '@/actions/habit.actions';
import { Button, useToast } from '@/components/ui';
import type { Habit } from '@/types';

// ============================================
// HABIT ACTIONS - Client Component
// ============================================

interface HabitActionsProps {
  habit: Habit;
}

export function HabitActions({ habit }: HabitActionsProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { success, error } = useToast();

  const handleToggleActive = () => {
    startTransition(async () => {
      const result = await toggleHabitActiveAction(habit.id, !habit.isActive);
      if (result.success) {
        const statusText = habit.isActive ? 'deactivated' : 'activated';
        success('Habit updated', `"${habit.name}" has been ${statusText}`);
        router.refresh();
      } else {
        error('Failed to update', result.message);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteHabitAction(habit.id);
      if (result.success) {
        success('Habit deleted', `"${habit.name}" has been removed`);
      } else {
        error('Failed to delete', result.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Active */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleActive}
        disabled={isPending}
      >
        {habit.isActive ? 'Deactivate' : 'Activate'}
      </Button>

      {/* Delete */}
      {!showDeleteConfirm ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600 hover:bg-red-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isPending}
          >
            Confirm Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
