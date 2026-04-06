import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import QuickLogModal from '@/components/QuickLogModal';
import DayDetailModal from '@/components/DayDetailModal';
import { useMonthEntries } from '@/hooks/useEntries';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  
  // States for modals
  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  // Fetch entries
  const { data: entries, isLoading, error } = useMonthEntries(currentYear, currentMonth);

  // Helper to get entries for a specific date
  const getEntriesForDate = (dateStr: string) => {
    if (!entries) return [];
    return entries.filter((e) => e.entry_date === dateStr);
  };

  const selectedDateEntries = useMemo(() => {
    return getEntriesForDate(selectedDateStr);
  }, [entries, selectedDateStr]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
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

  // When a day on the calendar is pressed
  const handleDayPress = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const dayEntries = getEntriesForDate(dateStr);
    
    if (dayEntries.length === 0) {
      // Frictionless: Empty day goes straight to Add Log
      setQuickLogVisible(true);
    } else {
      // Show details for the day
      setDetailVisible(true);
    }
  };

  // When FAB "+" is pressed (always means Add for Today)
  const handleAddToday = () => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDateStr(todayStr);
    setQuickLogVisible(true);
  };

  // When user clicks "Tambah" from inside the Detail Modal
  const handleAddFromDetail = () => {
    setDetailVisible(false);
    // Add small delay to avoid layered modal overlapping on mobile devices
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>{getGreeting()}</Text>
            <Text style={styles.email}>{user?.email?.split('@')[0] || 'Teman'}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.therapyRow}>
          <View style={styles.therapyLabel}>
            <Ionicons name="leaf" size={18} color="#4F46E5" />
            <Text style={styles.therapyLabelText}>Sesi Release Emosi</Text>
          </View>
          <View style={styles.therapyActions}>
            <TouchableOpacity 
              style={styles.therapyStartBtnSmall}
              onPress={() => router.push('/release')}
            >
              <Text style={styles.therapyStartBtnTextSmall}>Mulai</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.therapyHistoryBtnSmall}
              onPress={() => router.push('/release-history')}
            >
              <Ionicons name="time-outline" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Gagal memuat data calendar.</Text>
          </View>
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
      </View>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleAddToday}
        activeOpacity={0.8}
      >
        <Ionicons name="pencil" size={28} color="#fff" />
      </TouchableOpacity>

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
        onClose={() => setQuickLogVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7', // Warmer background
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 100, // Make room for FAB
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24, // reduced for compactness
    marginTop: 20, 
  },
  welcome: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  email: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  logoutButton: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4F46E5', // Warm Indigo
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  therapyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  therapyLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  therapyLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  therapyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  therapyStartBtnSmall: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  therapyStartBtnTextSmall: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  therapyHistoryBtnSmall: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
});
