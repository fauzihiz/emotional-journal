import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EntryRow } from '@/lib/api/entries';
import { getEmotionById } from '@/constants/emotions';

interface DayDetailModalProps {
  visible: boolean;
  dateStr: string;
  entries: EntryRow[];
  onClose: () => void;
  onAddEntry: () => void;
}

const EntryCard = ({ entry }: { entry: EntryRow }) => {
  const [expanded, setExpanded] = useState(false);
  const emotion = getEmotionById(entry.emotion_id);

  if (!emotion) return null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{emotion.emoji}</Text>
        <Text style={[styles.cardTitle, { color: emotion.color }]}>
          {emotion.label}
        </Text>
      </View>
      {entry.content ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setExpanded(!expanded)}
          style={styles.cardContentBox}
        >
          <Text
            style={styles.cardContent}
            numberOfLines={expanded ? undefined : 3}
          >
            {entry.content}
          </Text>
          <Text style={styles.expandHint}>
            {expanded ? 'Tutup' : 'Baca selengkapnya...'}
          </Text>
        </TouchableOpacity>
      ) : null}
      
      <Text style={styles.timeLabel}>
        {new Date(entry.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

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

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Jurnal Hari Ini</Text>
            <Text style={styles.subtitle}>{displayDate}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="journal-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>
                  Belum ada catatan emosi pada hari ini.
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.addButton} onPress={onAddEntry}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Tambah Entri Baru</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    height: '80%', // Fixed height giving lot of room
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
  },
  scrollArea: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    color: '#94A3B8',
    marginTop: 16,
  },
  list: {
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardContentBox: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  cardContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  expandHint: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'right',
  },
  footer: {
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
