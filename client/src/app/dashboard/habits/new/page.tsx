'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createHabitAction } from '@/actions/habit.actions';
import { Button, Input, Select, Textarea, Card, useToast } from '@/components/ui';
import { ROUTES, FREQUENCY_OPTIONS, WEEKDAYS } from '@/lib/constants';
import { getToday, cn } from '@/lib/utils';
import type { FormState, Frequency } from '@/types';

// ============================================
// NEW HABIT FORM - Client Component
// ============================================

const initialState: FormState = {
  success: false,
  message: '',
};

export default function NewHabitPage() {
  const [state, formAction, isPending] = useActionState(createHabitAction, initialState);
  const [frequency, setFrequency] = useState<Frequency>('DAILY');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const { success, error } = useToast();
  const prevStateRef = useRef(state);

  // Show toast on state change
  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;

    if (state.message) {
      if (state.success) {
        success('Habit created!', state.message);
      } else {
        error('Failed to create habit', state.message);
      }
    }
  }, [state, success, error]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const showDaySelector = frequency === 'WEEKLY' || frequency === 'CUSTOM';
  const showMonthDaySelector = frequency === 'MONTHLY';

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={ROUTES.HABITS}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Habits
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Habit</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define a new habit to track your progress
        </p>
      </div>

      <Card>
        <form action={formAction} className="space-y-6">
          {/* Habit name */}
          <Input
            label="Habit Name"
            name="name"
            type="text"
            placeholder="e.g., Morning Meditation"
            required
            error={state.errors?.name?.[0]}
          />

          {/* Description */}
          <Textarea
            label="Description (optional)"
            name="description"
            placeholder="What does this habit involve?"
            rows={3}
            error={state.errors?.description?.[0]}
          />

          {/* Frequency */}
          <Select
            label="Frequency"
            name="frequency"
            options={FREQUENCY_OPTIONS.map((f) => ({ value: f.value, label: f.label }))}
            value={frequency}
            onChange={(e) => {
              setFrequency(e.target.value as Frequency);
              setSelectedDays([]);
            }}
            required
            error={state.errors?.frequency?.[0]}
          />

          {/* Weekly/Custom day selector */}
          {showDaySelector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Days
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                      selectedDays.includes(day.value)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <input type="hidden" name="scheduleDays" value={JSON.stringify(selectedDays)} />
              {state.errors?.scheduleDays && (
                <p className="mt-1 text-sm text-red-600">{state.errors.scheduleDays[0]}</p>
              )}
            </div>
          )}

          {/* Monthly day selector */}
          {showMonthDaySelector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Days of Month
              </label>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      'p-2 text-sm font-medium rounded-lg border transition-colors',
                      selectedDays.includes(day)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <input type="hidden" name="scheduleDays" value={JSON.stringify(selectedDays)} />
              {state.errors?.scheduleDays && (
                <p className="mt-1 text-sm text-red-600">{state.errors.scheduleDays[0]}</p>
              )}
            </div>
          )}

          {/* Start date */}
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            defaultValue={getToday()}
            required
            error={state.errors?.startDate?.[0]}
          />

          {/* End date (optional) */}
          <Input
            label="End Date (optional)"
            name="endDate"
            type="date"
            hint="Leave empty for an ongoing habit"
            error={state.errors?.endDate?.[0]}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              href={ROUTES.HABITS}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <Button type="submit" isLoading={isPending}>
              Create Habit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
