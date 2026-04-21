'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { getEmotionById, getCalmnessLabel } from '@/constants/emotions';
import { useReleaseHistory } from '@/hooks/useReleaseHistory';

interface ReleaseSession {
  id: string;
  emotion_id: number;
  released_text: string;
  before_score: number;
  after_score: number;
  duration: number;
  created_at: string;
}

export default function ReleaseHistoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  const { data: sessions = [], isLoading } = useReleaseHistory(userId);

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-white border-b border-[#F1F5F9]">
        <button onClick={() => router.back()} className="p-2">
          <svg className="w-6 h-6 text-[#1E293B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-xl font-extrabold text-[#1E293B]">Riwayat Release Emosi</h1>
        <div className="w-10" />
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <span className="animate-spin h-8 w-8 border-4 border-[#4F46E5] border-t-transparent rounded-full" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <svg className="w-16 h-16 text-[#CBD5E1] mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
          <p className="text-base text-[#94A3B8] text-center mb-6">
            Belum ada riwayat sesi release emosi.
          </p>
          <button
            className="bg-[#4F46E5] px-6 py-3.5 rounded-2xl text-white font-bold hover:bg-[#4338CA] transition-colors"
            onClick={() => router.push('/release')}
          >
            Mulai Sesi Pertama
          </button>
        </div>
      ) : (
        <div className="p-5 pb-10 max-w-lg mx-auto w-full flex flex-col gap-4">
          {sessions.map((item) => {
            const emotion = getEmotionById(item.emotion_id);
            const date = new Date(item.created_at);
            const dateStr = date.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const timeStr = date.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm">
                {/* Card Header */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#F8FAFC] flex items-center justify-center mr-3">
                    <span className="text-2xl">{emotion?.emoji || '😶'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#94A3B8] font-semibold mb-0.5">
                      {dateStr} • {timeStr}
                    </p>
                    <p className="text-base font-extrabold text-[#1E293B]">
                      {emotion?.label || 'Emosi'}
                    </p>
                  </div>
                  <div className="bg-[#EEF2FF] px-3 py-1.5 rounded-xl">
                    <span className="text-[13px] font-bold text-[#4F46E5]">
                      {item.after_score} ({getCalmnessLabel(item.after_score)})
                    </span>
                  </div>
                </div>

                {/* Content */}
                {item.released_text && (
                  <div className="bg-[#FDFBF7] p-4 rounded-2xl mb-4">
                    <p className="text-sm text-[#475569] italic leading-5 line-clamp-3">
                      &ldquo;{item.released_text}&rdquo;
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-xs text-[#94A3B8] font-medium">
                    Durasi: {Math.floor(item.duration / 60)}m {item.duration % 60}s
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
