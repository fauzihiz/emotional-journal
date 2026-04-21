'use client'

import { useMemo } from 'react';
import { EntryRow } from '@/lib/api/entries';
import { getEmotionById, getEmotionColor } from '@/constants/emotions';

interface Props {
  year: number;
  month: number;
  entries: EntryRow[];
  onDayPress: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const DAYS_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function HeatmapCalendar({
  year, month, entries, onDayPress, onPrevMonth, onNextMonth,
}: Props) {
  const entryMap = useMemo(() => {
    const map: Record<string, EntryRow[]> = {};
    entries.forEach((e) => {
      if (!map[e.entry_date]) map[e.entry_date] = [];
      map[e.entry_date].push(e);
    });
    return map;
  }, [entries]);

  const calendarRows = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();

    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);

    const rows: (number | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [year, month]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="bg-white rounded-3xl p-5 mb-4 flex-1 flex flex-col shadow-sm">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onPrevMonth}
          className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors"
        >
          <svg className="w-5 h-5 text-[#334155]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-lg font-extrabold text-[#1E293B] tracking-tight">
          {MONTHS_ID[month - 1]} {year}
        </span>
        <button
          onClick={onNextMonth}
          className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors"
        >
          <svg className="w-5 h-5 text-[#334155]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-3">
        {DAYS_ID.map((d) => (
          <div key={d} className="text-center text-xs font-bold text-[#94A3B8]">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col gap-1.5">
        {calendarRows.map((row, rIndex) => (
          <div key={`row-${rIndex}`} className="flex-1 grid grid-cols-7 gap-1.5">
            {row.map((day, cIndex) => {
              if (day === null) {
                return <div key={`empty-${rIndex}-${cIndex}`} className="bg-transparent" />;
              }

              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEntries = entryMap[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isFuture = dateStr > todayStr;
              const hasEntry = dayEntries.length > 0;

              const latestEntry = dayEntries[dayEntries.length - 1];
              const emotion = latestEntry ? getEmotionById(latestEntry.emotion_id) : null;

              // Build gradient for multi-entry days
              const meshColors = dayEntries.map(e => getEmotionColor(e.emotion_id));
              const gradientStyle = hasEntry
                ? meshColors.length > 1
                  ? { background: `linear-gradient(135deg, ${meshColors.join(', ')})` }
                  : { backgroundColor: meshColors[0] }
                : { backgroundColor: '#F1F5F9' };

              return (
                <button
                  key={dateStr}
                  className={`
                    relative rounded-[14px] overflow-hidden flex flex-col items-center justify-center
                    transition-all min-h-[42px]
                    ${isToday ? 'ring-2 ring-[#4F46E5]' : ''}
                    ${isFuture ? 'opacity-40 cursor-default' : 'cursor-pointer hover:scale-105'}
                  `}
                  style={gradientStyle}
                  onClick={() => !isFuture && onDayPress(dateStr)}
                  disabled={isFuture}
                >
                  <span
                    className={`text-[13px] font-semibold ${
                      hasEntry
                        ? 'text-white font-extrabold drop-shadow-sm'
                        : isToday
                          ? 'text-[#4F46E5] font-extrabold'
                          : 'text-[#475569]'
                    }`}
                  >
                    {day}
                  </span>
                  {emotion && dayEntries.length === 1 && (
                    <span className="text-xs mt-0.5">{emotion.emoji}</span>
                  )}
                  {dayEntries.length > 1 && (
                    <span className="absolute bottom-1 right-1 bg-black/30 rounded-lg px-1 py-0.5 text-white text-[9px] font-bold">
                      {dayEntries.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
