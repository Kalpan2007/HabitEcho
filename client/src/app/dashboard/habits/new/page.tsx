'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCreateHabit, useHabitDetail } from '@/hooks/useHabits';
import { Button, Input, Select, Textarea, Card, useToast } from '@/components/ui';
import { ROUTES, FREQUENCY_OPTIONS, WEEKDAYS } from '@/lib/constants';
import { getToday, cn } from '@/lib/utils';
import type { Frequency } from '@/types';

// ============================================
// NEW HABIT FORM - Client Component
// ============================================

export default function NewHabitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  const { data: templateData, isLoading: isLoadingTemplate } = useHabitDetail(templateId || '');
  const { mutate: createHabit, isPending } = useCreateHabit();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('DAILY');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [reminderTime, setReminderTime] = useState('');

  const { success, error, info } = useToast();

  // Load template if templateId is present
  useEffect(() => {
    if (templateId && templateData?.data?.habit) {
      const habit = templateData.data.habit;
      setName(habit.name);
      setDescription(habit.description || '');
      setFrequency(habit.frequency);
      setSelectedDays(habit.scheduleDays || []);
      setReminderTime(habit.reminderTime || '');
      info('Template Loaded', `Details from "${habit.name}" have been pre-filled.`);
    }
  }, [templateId, templateData, info]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const input = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      frequency: formData.get('frequency') as Frequency,
      scheduleDays: selectedDays.length > 0 ? selectedDays : undefined,
      startDate: formData.get('startDate') as string,
      reminderTime: (formData.get('reminderTime') as string) || undefined,
      timezone: (formData.get('timezone') as string) || undefined,
    };

    createHabit(input, {
      onSuccess: () => {
        success('Habit created!', 'Your new habit has been set up.');
        router.push(ROUTES.HABITS);
      },
      onError: (err: any) => {
        error('Failed to create habit', err.message);
      }
    });
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
        <h1 className="text-2xl font-bold text-gray-900">
          {templateId ? 'Restart Habit' : 'Create New Habit'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {templateId
            ? 'Adjust the details below to start this habit again'
            : 'Define a new habit to track your progress'}
        </p>
      </div>

      <Card className={cn(isLoadingTemplate && 'opacity-50 pointer-events-none transition-opacity')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Habit name */}
          <Input
            label="Habit Name"
            name="name"
            type="text"
            placeholder="e.g., Morning Meditation"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Description */}
          <Textarea
            label="Description (optional)"
            name="description"
            placeholder="What does this habit involve?"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            </div>
          )}

          {/* Start date */}
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            defaultValue={getToday()}
            required
          />

          {/* Reminder Time */}
          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Email Reminders
                </label>
                <p className="text-xs text-indigo-600/70 leading-relaxed max-w-xs">
                  We'll send you a nudge at your preferred time to keep your streak alive.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Input
                  name="reminderTime"
                  type="time"
                  className="w-40 h-11 text-lg font-medium tracking-tight bg-white border-indigo-200 focus:ring-indigo-500 rounded-xl shadow-sm"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <input
            type="hidden"
            name="timezone"
            value={Intl.DateTimeFormat().resolvedOptions().timeZone}
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
              {templateId ? 'Restart Habit' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </Card>
      {isLoadingTemplate && (
        <div className="mt-4 flex items-center justify-center text-sm text-gray-500 animate-pulse">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching habit details...
        </div>
      )}
    </div>
  );
}
