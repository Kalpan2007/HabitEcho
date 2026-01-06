'use client';

import { useState, useTransition } from 'react';
import { quickLogEntryAction } from '@/actions/entry.actions';
import { getToday, cn, formatDisplayDate } from '@/lib/utils';
import { Button, useToast, Card } from '@/components/ui';

interface LogEntryModalProps {
    habitId: string;
    date: string; // YYYY-MM-DD
    onClose: () => void;
}

export function LogEntryModal({ habitId, date, onClose }: LogEntryModalProps) {
    const [isPending, startTransition] = useTransition();
    const { success, error } = useToast();
    const [percent, setPercent] = useState(50);

    const handleLog = (status: 'DONE' | 'NOT_DONE' | 'PARTIAL') => {
        startTransition(async () => {
            const result = await quickLogEntryAction(habitId, date, status, status === 'PARTIAL' ? percent : undefined);
            if (result.success) {
                success('Entry Logged', `Logged entry for ${formatDisplayDate(date)}`);
                onClose();
            } else {
                error('Failed', result.message);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md bg-white p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h3 className="text-lg font-bold text-gray-900 mb-1">Catch Up</h3>
                <p className="text-gray-500 text-sm mb-6">Log your activity for <span className="font-semibold text-gray-900">{formatDisplayDate(date)}</span>.</p>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => handleLog('DONE')}
                        disabled={isPending}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                    >
                        <span className="text-2xl mb-1">✅</span>
                        <span className="text-sm font-bold">Done</span>
                    </button>

                    <button
                        onClick={() => handleLog('NOT_DONE')}
                        disabled={isPending}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                    >
                        <span className="text-2xl mb-1">❌</span>
                        <span className="text-sm font-bold">Missed</span>
                    </button>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => handleLog('PARTIAL')}
                            disabled={isPending}
                            className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl border border-gray-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                        >
                            <span className="text-sm font-bold">Partial</span>
                        </button>
                        <input
                            type="range" min="1" max="99"
                            value={percent}
                            onChange={(e) => setPercent(parseInt(e.target.value))}
                            className="w-full accent-yellow-500"
                        />
                        <div className="text-center text-xs text-gray-500 font-mono">{percent}%</div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
