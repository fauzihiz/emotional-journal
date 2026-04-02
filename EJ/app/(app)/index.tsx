import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import QuickLogModal from '@/components/QuickLogModal';
import DayDetailModal from '@/components/DayDetailModal';
import { useMonthEntries } from '@/hooks/useEntries';

export default function DashboardScreen() {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Halo,</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
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
      >
        <Ionicons name="add" size={32} color="#fff" />
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
    backgroundColor: '#F8FAFC',
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
    marginBottom: 24,
    marginTop: 20, 
  },
  welcome: {
    fontSize: 16,
    color: '#64748B',
  },
  email: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
