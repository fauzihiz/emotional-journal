'use client'

import { useState, useEffect } from 'react';
import { Emotion } from '@/constants/emotions';
import EmotionPicker from './EmotionPicker';
import { useCreateEntry } from '@/hooks/useEntries';

interface Props {
  visible: boolean;
  dateStr: string;
  userId: string | undefined;
  onClose: () => void;
}

export default function QuickLogModal({ visible, dateStr, userId, onClose }: Props) {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [note, setNote] = useState('');

  const createEntryMutation = useCreateEntry(userId);

  useEffect(() => {
    if (visible) {
      setSelectedEmotion(null);
      setNote('');
    }
  }, [visible]);

  const handleSave = () => {
    if (!selectedEmotion) return;

    createEntryMutation.mutate(
      {
        emotion_id: selectedEmotion.id,
        content: note,
        entry_date: dateStr,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const dateObj = new Date(dateStr);
  const displayDate = isNaN(dateObj.getTime())
    ? dateStr
    : dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0F172A]/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-t-[32px] p-6 pb-10 max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="mb-6 text-center relative">
          <h2 className="text-[22px] font-extrabold text-[#1E293B] mb-1">
            Bagaimana perasaanmu?
          </h2>
          <p className="text-sm text-[#64748B] font-medium">{displayDate}</p>
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-1 bg-[#F1F5F9] rounded-2xl hover:bg-[#E2E8F0] transition-colors"
          >
            <svg className="w-6 h-6 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <EmotionPicker
          selected={selectedEmotion?.id ?? null}
          onSelect={setSelectedEmotion}
        />

        <div className="mt-6">
          <label className="text-[15px] font-bold text-[#334155] mb-3 block">
            Apa yang kamu rasakan saat ini?
          </label>
          <textarea
            className="w-full bg-white rounded-2xl p-5 h-[120px] text-base text-[#1E293B] leading-6 shadow-sm resize-none outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
            placeholder="Yuk ceritakan kejadian hari ini..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button
          className={`w-full h-[60px] rounded-2xl flex items-center justify-center mt-8 font-bold text-base text-white transition-all ${
            selectedEmotion
              ? 'bg-[#4F46E5] shadow-lg shadow-[#4F46E5]/20 hover:bg-[#4338CA]'
              : 'bg-[#CBD5E1] cursor-not-allowed'
          }`}
          onClick={handleSave}
          disabled={!selectedEmotion || createEntryMutation.isPending}
        >
          {createEntryMutation.isPending ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            'Simpan Jurnal'
          )}
        </button>
      </div>
    </div>
  );
}
