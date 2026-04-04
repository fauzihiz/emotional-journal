import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EntryRow } from '@/lib/api/entries';
import { getEmotionById, getEmotionColor } from '@/constants/emotions';

interface Props {
  year: number;
  month: number; // 1-12
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
  // Build a map of date -> entry array for multiple entries per day
  const entryMap = useMemo(() => {
    const map: Record<string, EntryRow[]> = {};
    entries.forEach((e) => {
      if (!map[e.entry_date]) map[e.entry_date] = [];
      map[e.entry_date].push(e);
    });
    return map;
  }, [entries]);

  // Build calendar grid into rows
  const calendarRows = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();

    // Monday = 0 in our grid (ISO week)
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6; // Sunday -> 6

    const days: (number | null)[] = [];
    // Empty cells before the 1st
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);

    // Pad end of month to complete the row
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    // Chunk into rows of 7
    const rows: (number | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [year, month]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {/* Month navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={22} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS_ID[month - 1]} {year}
        </Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={22} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.weekRow}>
        {DAYS_ID.map((d) => (
          <View key={d} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid (flex=1 so it expands vertically) */}
      <View style={styles.grid}>
        {calendarRows.map((row, rIndex) => (
          <View key={`row-${rIndex}`} style={styles.calendarRow}>
            {row.map((day, cIndex) => {
              if (day === null) {
                return <View key={`empty-${rIndex}-${cIndex}`} style={styles.cellEmpty} />;
              }

              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEntries = entryMap[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isFuture = dateStr > todayStr;
              const hasEntry = dayEntries.length > 0;
              
              // Latest entry for emoji
              const latestEntry = dayEntries[dayEntries.length - 1];
              const emotion = latestEntry ? getEmotionById(latestEntry.emotion_id) : null;
              
              // Colors for the Galaxy Mesh
              const meshColors = dayEntries.map(e => getEmotionColor(e.emotion_id));

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.cell,
                    isToday && styles.todayCell,
                    !hasEntry && { backgroundColor: '#F1F5F9' },
                    isFuture && { opacity: 0.4 }
                  ]}
                  onPress={() => onDayPress(dateStr)}
                  activeOpacity={0.7}
                  disabled={isFuture}
                >
                  {/* Dynamic Galaxy Mesh logic */}
                  {hasEntry && (
                    <>
                      <LinearGradient
                        colors={meshColors.length > 1 ? meshColors : [meshColors[0], meshColors[0]]}
                        start={{ x: 0, y: 0.2 }}
                        end={{ x: 1, y: 0.8 }}
                        style={StyleSheet.absoluteFill}
                      />
                      {/* Aura layer for softer mesh effect */}
                      <LinearGradient
                         colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
                         start={{ x: 0, y: 0 }}
                         end={{ x: 1, y: 1 }}
                         style={StyleSheet.absoluteFill}
                      />
                    </>
                  )}

                  {/* Foreground Content */}
                  <View style={styles.cellContent}>
                    <Text
                      style={[
                        styles.dayText,
                        hasEntry && styles.dayTextWithEntry,
                        isToday && !hasEntry && styles.todayText,
                      ]}
                    >
                      {day}
                    </Text>
                    {emotion && dayEntries.length === 1 && (
                      <Text style={styles.cellEmoji}>{emotion.emoji}</Text>
                    )}
                    {dayEntries.length > 1 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{dayEntries.length}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24, // softer overall container
    padding: 20,
    marginBottom: 16,
    flex: 1, 
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  grid: {
    flex: 1,
    flexDirection: 'column',
  },
  calendarRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  cellEmpty: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cell: {
    flex: 1,
    borderRadius: 14, // more squircle feel
    overflow: 'hidden', 
    position: 'relative',
  },
  stripesContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  cellContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#4F46E5', // Warm Indigo
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  dayTextWithEntry: {
    color: '#ffffff',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  todayText: {
    color: '#4F46E5', // Warm Indigo
    fontWeight: '800',
  },
  cellEmoji: {
    fontSize: 12,
    marginTop: 1,
  },
  badge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  }
});
