'use client'

import { useState } from 'react';
import { EntryRow } from '@/lib/api/entries';
import { getEmotionById } from '@/constants/emotions';

interface DayDetailModalProps {
  visible: boolean;
  dateStr: string;
  entries: EntryRow[];
  onClose: () => void;
  onAddEntry: () => void;
}

function EntryCard({ entry }: { entry: EntryRow }) {
  const [expanded, setExpanded] = useState(false);
  const emotion = getEmotionById(entry.emotion_id);

  if (!emotion) return null;

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm">
      <div className="flex items-center mb-3">
        <span className="text-[28px] mr-2.5">{emotion.emoji}</span>
        <span
          className="text-[17px] font-extrabold tracking-tight"
          style={{ color: emotion.color }}
        >
          {emotion.label}
        </span>
      </div>
      {entry.content ? (
        <button
          className="w-full text-left bg-[#FDFBF7] p-4 rounded-xl mt-1"
          onClick={() => setExpanded(!expanded)}
        >
          <p className={`text-[15px] text-[#475569] leading-6 ${!expanded ? 'line-clamp-3' : ''}`}>
            {entry.content}
          </p>
          <span className="text-[13px] text-[#4F46E5] font-bold mt-2 inline-block">
            {expanded ? 'Tutup' : 'Baca selengkapnya...'}
          </span>
        </button>
      ) : null}
      <p className="text-xs text-[#94A3B8] font-semibold mt-4 text-right">
        {new Date(entry.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}

export default function DayDetailModal({
  visible,
  dateStr,
  entries,
  onClose,
  onAddEntry,
}: DayDetailModalProps) {
  const dateObj = new Date(dateStr);
  const displayDate = isNaN(dateObj.getTime())
    ? dateStr
    : dateObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0F172A]/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-t-[32px] p-6 pb-10 h-[85%] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="mb-5 text-center relative">
          <h2 className="text-[22px] font-extrabold text-[#1E293B] mb-1">Jurnal Hari Ini</h2>
          <p className="text-sm text-[#64748B] font-medium">{displayDate}</p>
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-1 bg-[#F1F5F9] rounded-2xl hover:bg-[#E2E8F0] transition-colors"
          >
            <svg className="w-6 h-6 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="w-12 h-12 text-[#CBD5E1] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <p className="text-[#94A3B8] text-[15px] font-medium">
                Belum ada catatan emosi pada hari ini.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-6">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            className="w-full h-[60px] rounded-2xl bg-[#4F46E5] flex items-center justify-center gap-2 text-white font-bold text-base shadow-lg shadow-[#4F46E5]/20 hover:bg-[#4338CA] transition-colors"
            onClick={onAddEntry}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah Entri Baru
          </button>
        </div>
      </div>
    </div>
  );
}
