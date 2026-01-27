'use client';

import { useEffect, useState } from 'react';
import { useLogEntry } from '@/hooks/useEntries';
import { useToast, Card } from '@/components/ui';
import { getToday, cn, isDateScheduled } from '@/lib/utils';
import type { EntryStatus, HabitEntry, Frequency } from '@/types';

interface HabitEntryLoggerProps {
    habitId: string;
    habitName: string;
    initialEntry: HabitEntry | null;
    frequency: Frequency;
    scheduleDays: number[] | null;
}

export function HabitEntryLogger({ habitId, habitName, initialEntry, frequency, scheduleDays }: HabitEntryLoggerProps) {
    const { mutate: logEntry, isPending } = useLogEntry(habitId);
    const today = getToday();
    const { success, error } = useToast();

    const [showPartialModal, setShowPartialModal] = useState(false);
    const [percentComplete, setPercentComplete] = useState(50);
    const [entry, setEntry] = useState<HabitEntry | null>(initialEntry);

    useEffect(() => {
        setEntry(initialEntry);
    }, [initialEntry]);

    const isScheduledToday = isDateScheduled(today, frequency, scheduleDays);

    const handleLog = (status: EntryStatus, percentage?: number) => {
        // 1. One-time update rule check
        if (entry) {
            error('Access Denied', 'You cannot change the status once logged.');
            return;
        }

        // 2. Schedule Check
        if (!isScheduledToday) {
            error('Not Scheduled', 'You can only log this habit on scheduled days.');
            return;
        }

        // 3. Partial Status specific flow
        if (status === 'PARTIAL' && percentage === undefined) {
            setShowPartialModal(true);
            return;
        }

        // 4. Confirmation Alert
        const message = status === 'DONE'
            ? 'Are you sure you want to mark this as Completed?\n\nThis action cannot be undone.'
            : status === 'PARTIAL'
                ? `Are you sure you want to mark this as Partial (${percentage}%)?\n\nThis action cannot be undone.`
                : 'Are you sure you want to mark this as Missed?\n\nThis action cannot be undone.';

        const confirmed = window.confirm(message);

        if (!confirmed) return;
        
        logEntry({
            status,
            date: today,
            percentComplete: percentage
        }, {
            onSuccess: (response) => {
                const nextEntry = (response as any)?.data?.entry ?? (response as any)?.data?.log ?? null;
                if (nextEntry) {
                    setEntry(nextEntry as HabitEntry);
                }
                const text = status === 'DONE' ? 'Completed!' : status === 'PARTIAL' ? `Marked as ${percentage}% complete` : 'Marked as missed';
                success('Status Updated', text);
                setShowPartialModal(false);
            },
            onError: (err: any) => {
                // Handle authentication errors specifically
                if (err?.status === 401 || err?.message?.includes('Authentication') || err?.message?.includes('Unauthorized')) {
                    error(
                        'Authentication Required', 
                        'Your session may have expired. Please refresh the page and try logging in again.'
                    );
                } else {
                    error('Failed to update', err?.message || 'An unexpected error occurred. Please try again.');
                }
                console.error('[HabitEntryLogger] Error details:', err);
            }
        });
    };

    const currentStatus = entry?.status;
    const isLocked = !!entry;

    // If not scheduled today and no entry exists, look disabled/informational
    const isDisabled = !isScheduledToday && !entry;

    return (
        <>
            <Card className="border-none shadow-lg shadow-indigo-100 overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        How did you do today?
                        {isLocked && (
                            <span className="text-xs font-normal px-2 py-1 bg-gray-100 text-gray-500 rounded-full flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Locked
                            </span>
                        )}
                        {!isScheduledToday && !isLocked && (
                            <span className="text-xs font-normal px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
                                Not scheduled for today
                            </span>
                        )}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* DONE Button */}
                        <button
                            onClick={() => handleLog('DONE')}
                            disabled={isPending || isLocked || isDisabled}
                            className={cn(
                                'relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200',
                                currentStatus === 'DONE'
                                    ? 'bg-green-50 border-green-500 ring-4 ring-green-100 opacity-100'
                                    : isLocked || isDisabled
                                        ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                                        : 'bg-white border-gray-100 hover:border-green-200 hover:bg-green-50/50 group'
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                                currentStatus === 'DONE' ? "bg-green-500 text-white" : isLocked || isDisabled ? "bg-gray-200 text-gray-400" : "bg-green-100 text-green-600 group-hover:bg-green-200"
                            )}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className={cn(
                                "font-bold",
                                currentStatus === 'DONE' ? "text-green-700" : isLocked || isDisabled ? "text-gray-400" : "text-gray-600 group-hover:text-green-700"
                            )}>
                                Completed
                            </span>
                            {currentStatus === 'DONE' && (
                                <span className="absolute top-3 right-3 text-green-500">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            )}
                        </button>

                        {/* PARTIAL Button */}
                        <button
                            onClick={() => handleLog('PARTIAL')}
                            disabled={isPending || isLocked || isDisabled}
                            className={cn(
                                'relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200',
                                currentStatus === 'PARTIAL'
                                    ? 'bg-yellow-50 border-yellow-500 ring-4 ring-yellow-100 opacity-100'
                                    : isLocked || isDisabled
                                        ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                                        : 'bg-white border-gray-100 hover:border-yellow-200 hover:bg-yellow-50/50 group'
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                                currentStatus === 'PARTIAL' ? "bg-yellow-500 text-white" : isLocked || isDisabled ? "bg-gray-200 text-gray-400" : "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200"
                            )}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className={cn(
                                "font-bold",
                                currentStatus === 'PARTIAL' ? "text-yellow-700" : isLocked || isDisabled ? "text-gray-400" : "text-gray-600 group-hover:text-yellow-700"
                            )}>
                                Partial
                            </span>
                        </button>

                        {/* NOT DONE Button */}
                        <button
                            onClick={() => handleLog('NOT_DONE')}
                            disabled={isPending || isLocked || isDisabled}
                            className={cn(
                                'relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200',
                                currentStatus === 'NOT_DONE'
                                    ? 'bg-red-50 border-red-500 ring-4 ring-red-100 opacity-100'
                                    : isLocked || isDisabled
                                        ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                                        : 'bg-white border-gray-100 hover:border-red-200 hover:bg-red-50/50 group'
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                                currentStatus === 'NOT_DONE' ? "bg-red-500 text-white" : isLocked || isDisabled ? "bg-gray-200 text-gray-400" : "bg-red-100 text-red-600 group-hover:bg-red-200"
                            )}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <span className={cn(
                                "font-bold",
                                currentStatus === 'NOT_DONE' ? "text-red-700" : isLocked || isDisabled ? "text-gray-400" : "text-gray-600 group-hover:text-red-700"
                            )}>
                                Missed
                            </span>
                        </button>
                    </div>

                    {isLocked && (
                        <p className="text-center text-sm text-gray-400 mt-6 animate-fade-in flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Entry locked. Great job staying consistent!
                        </p>
                    )}
                </div>
            </Card>

            {/* Custom Partial Modal */}
            {showPartialModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">How much did you verify?</h3>
                            <p className="text-sm text-gray-500">Use the slider to set your completion percentage.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative pt-6 pb-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-400">0%</span>
                                    <span className="text-4xl font-black text-indigo-600">{percentComplete}%</span>
                                    <span className="text-xs font-bold text-gray-400">100%</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="99"
                                    value={percentComplete}
                                    onChange={(e) => setPercentComplete(parseInt(e.target.value))}
                                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowPartialModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleLog('PARTIAL', percentComplete)}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                                Save & Lock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
