'use client'

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useMonthEntries } from '@/hooks/useEntries';
import { fetchEntriesByMonth } from '@/lib/api/entries';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import QuickLogModal from '@/components/QuickLogModal';
import DayDetailModal from '@/components/DayDetailModal';
import Link from 'next/link';

export default function DashboardScreen() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userName, setUserName] = useState('Teman');

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  const queryClient = useQueryClient();
  const { data: entries, isLoading, error } = useMonthEntries(userId, currentYear, currentMonth);

  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        if (data.user.email) {
          setUserName(data.user.email.split('@')[0]);
        }
      }
    });
  }, [supabase]);

  // Prefetch adjacent months
  useEffect(() => {
    if (!userId) return;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    queryClient.prefetchQuery({
      queryKey: ['entries', userId, prevYear, prevMonth],
      queryFn: () => fetchEntriesByMonth(prevYear, prevMonth),
    });

    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    queryClient.prefetchQuery({
      queryKey: ['entries', userId, nextYear, nextMonth],
      queryFn: () => fetchEntriesByMonth(nextYear, nextMonth),
    });
  }, [currentYear, currentMonth, queryClient, userId]);

  const getEntriesForDate = (dateStr: string) => {
    if (!entries) return [];
    return entries.filter((e) => e.entry_date === dateStr);
  };

  const selectedDateEntries = useMemo(() => {
    return getEntriesForDate(selectedDateStr);
  }, [entries, selectedDateStr]);

  const handleSignOut = async () => {
    queryClient.clear();
    await supabase.auth.signOut();
    router.refresh();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDayPress = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const dayEntries = getEntriesForDate(dateStr);

    if (dayEntries.length === 0) {
      setQuickLogVisible(true);
    } else {
      setDetailVisible(true);
    }
  };

  const handleAddToday = () => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDateStr(todayStr);
    setQuickLogVisible(true);
  };

  const handleAddFromDetail = () => {
    setDetailVisible(false);
    setTimeout(() => {
      setQuickLogVisible(true);
    }, 150);
  };

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 11) return 'Selamat Pagi,';
    if (hour < 15) return 'Selamat Siang,';
    if (hour < 18) return 'Selamat Sore,';
    return 'Selamat Malam,';
  };

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex flex-col relative">
      <div className="flex-1 p-6 pb-[100px] max-w-lg mx-auto w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-5">
          <div>
            <p className="text-sm text-[#64748B] mb-0.5">{getGreeting()}</p>
            <h1 className="text-xl font-extrabold text-[#1E293B] tracking-tight capitalize">
              {userName}
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-[14px] bg-white shadow-sm hover:bg-[#F8FAFC] transition-colors"
          >
            <svg className="w-5 h-5 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>

        {/* Therapy Row */}
        <div className="flex items-center gap-2 mb-5">
          <Link
            href="/release"
            className="flex-1 flex items-center bg-white rounded-2xl px-4 py-3 gap-3 shadow-sm hover:bg-[#F8FAFC] transition-colors"
          >
            <svg className="w-[18px] h-[18px] text-[#4F46E5]" fill="currentColor" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
            <span className="text-sm font-bold text-[#1E293B]">Mulai Sesi Release Emosi</span>
            <svg className="w-4 h-4 text-[#64748B] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
          <Link
            href="/release-history"
            className="p-3 rounded-2xl bg-white shadow-sm hover:bg-[#F8FAFC] transition-colors"
          >
            <svg className="w-[18px] h-[18px] text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </Link>
        </div>

        {/* Calendar */}
        {isLoading && !entries ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="animate-spin h-8 w-8 border-4 border-[#4F46E5] border-t-transparent rounded-full" />
          </div>
        ) : error && !entries ? (
          <div className="p-4 bg-[#FEE2E2] rounded-2xl">
            <p className="text-[#DC2626] text-center">Gagal memuat data calendar.</p>
          </div>
        ) : (
          <HeatmapCalendar
            year={currentYear}
            month={currentMonth}
            entries={entries || []}
            onDayPress={handleDayPress}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        )}
      </div>

      {/* Ebook Download */}
      <a
        href="/ebook/ebook-tenang.pdf"
        download
        className="fixed left-6 bottom-6 h-14 pl-4 pr-5 rounded-full bg-[#10B981] flex items-center gap-3 shadow-lg shadow-[#10B981]/40 hover:bg-[#059669] transition-all z-40 group"
        title="Download Ebook"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-white leading-tight">Download Ebook</span>
          <span className="text-[9px] text-white/80 leading-tight font-medium uppercase">ebook-tenang.pdf (24.949 KB)</span>
        </div>
      </a>

      {/* FAB */}
      <button
        onClick={handleAddToday}
        className="fixed right-6 bottom-6 w-16 h-16 rounded-full bg-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#4F46E5]/40 hover:bg-[#4338CA] transition-colors z-40"
      >
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </button>

      {/* Detail Modal */}
      <DayDetailModal
        visible={detailVisible}
        dateStr={selectedDateStr}
        entries={selectedDateEntries}
        onClose={() => setDetailVisible(false)}
        onAddEntry={handleAddFromDetail}
      />

      {/* Write Note Modal */}
      <QuickLogModal
        visible={quickLogVisible}
        dateStr={selectedDateStr}
        userId={userId}
        onClose={() => setQuickLogVisible(false)}
      />

      {/* Credit */}
      <a
        href="https://fauzihiz.github.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 left-0 right-0 text-center text-[10px] text-[#94A3B8]/70 z-10"
      >
        Built by <span className="font-semibold">Fauzihiz</span>
      </a>
    </div>
  );
}
