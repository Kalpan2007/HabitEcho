'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { createEntryAction } from '@/actions/entry.actions';
import { Button, Input, Select, Textarea, useToast } from '@/components/ui';
import { getToday } from '@/lib/utils';
import type { FormState, EntryStatus } from '@/types';

// ============================================
// HABIT ENTRY FORM - Client Component
// ============================================

interface HabitEntryFormProps {
  habitId: string;
  habitName: string;
}

const initialState: FormState = {
  success: false,
  message: '',
};

export function HabitEntryForm({ habitId, habitName }: HabitEntryFormProps) {
  const boundAction = createEntryAction.bind(null, habitId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [status, setStatus] = useState<EntryStatus | ''>('');
  const [showDetails, setShowDetails] = useState(false);
  const { success, error } = useToast();
  const prevStateRef = useRef(state);

  // Show toast on state change
  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;

    if (state.message) {
      if (state.success) {
        success('Entry logged', `Entry for "${habitName}" has been saved`);
      } else {
        error('Failed to log entry', state.message);
      }
    }
  }, [state, success, error, habitName]);

  const isPartial = status === 'PARTIAL';

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <Input
            label="Date"
            name="entryDate"
            type="date"
            defaultValue={getToday()}
            max={getToday()}
            required
            error={state.errors?.entryDate?.[0]}
          />

          {/* Status */}
          <Select
            label="Status"
            name="status"
            options={[
              { value: 'DONE', label: 'Done (100%)' },
              { value: 'PARTIAL', label: 'Partial' },
              { value: 'NOT_DONE', label: 'Not Done (0%)' },
            ]}
            placeholder="Select status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as EntryStatus);
              if (e.target.value === 'PARTIAL') {
                setShowDetails(true);
              }
            }}
            required
            error={state.errors?.status?.[0]}
          />
        </div>

        {/* Percentage (for partial) */}
        {isPartial && (
          <div>
            <Input
              label="Completion Percentage"
              name="percentComplete"
              type="number"
              min={1}
              max={99}
              placeholder="50"
              hint="Enter a value between 1-99"
              required
              error={state.errors?.percentComplete?.[0]}
            />
          </div>
        )}

        {/* Toggle for additional details */}
        {!isPartial && (
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {showDetails ? 'Hide' : 'Add'} notes and reason
          </button>
        )}

        {/* Additional details */}
        {(showDetails || isPartial) && (
          <div className="space-y-4 pt-2">
            {/* Reason (for partial/not done) */}
            {(status === 'PARTIAL' || status === 'NOT_DONE') && (
              <Input
                label="Reason (optional)"
                name="reason"
                type="text"
                placeholder="Why wasn't this completed?"
                error={state.errors?.reason?.[0]}
              />
            )}

            {/* Notes */}
            <Textarea
              label="Notes (optional)"
              name="notes"
              placeholder="Any additional notes..."
              rows={2}
              error={state.errors?.notes?.[0]}
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={isPending} disabled={!status}>
            Log Entry
          </Button>
        </div>
      </form>
    </div>
  );
}
