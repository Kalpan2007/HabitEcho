'use client';

import { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { formatDisplayDate } from '@/lib/utils';
import { LogEntryModal } from './LogEntryModal';

interface PendingEntriesListProps {
    habitId: string;
    missingDates: string[];
}

export function PendingEntriesList({ habitId, missingDates }: PendingEntriesListProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    if (!missingDates || missingDates.length === 0) return null;

    // Show recent missing dates first (reverse chronological)
    const sortedDates = [...missingDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const displayDates = isExpanded ? sortedDates : sortedDates.slice(0, 3); // Show top 3 by default

    return (
        <>
            <Card className="border-l-4 border-l-yellow-400 bg-yellow-50/50 p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-bold text-yellow-800 flex items-center gap-2">
                            <span className="text-xl">⚠️</span> Catch Up Needed
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                            You missed {missingDates.length} scheduled day{missingDates.length > 1 ? 's' : ''}.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {displayDates.map(date => (
                        <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className="px-3 py-1.5 bg-white text-yellow-700 text-sm font-medium rounded-lg border border-yellow-200 shadow-sm hover:border-yellow-400 hover:text-yellow-800 transition-colors"
                        >
                            {formatDisplayDate(date)}
                        </button>
                    ))}
                    {sortedDates.length > 3 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-xs text-yellow-600 font-medium underline px-2 self-center hover:text-yellow-800"
                        >
                            {isExpanded ? 'Show Less' : `+${sortedDates.length - 3} more`}
                        </button>
                    )}
                </div>
            </Card>

            {selectedDate && (
                <LogEntryModal
                    habitId={habitId}
                    date={selectedDate}
                    onClose={() => setSelectedDate(null)}
                />
            )}
        </>
    );
}
