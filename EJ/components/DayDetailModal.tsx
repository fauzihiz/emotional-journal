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
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // lighter overlay
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    height: '85%', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
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
    fontSize: 15,
    fontWeight: '500',
  },
  list: {
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardContentBox: {
    backgroundColor: '#FDFBF7',
    padding: 16,
    borderRadius: 12,
    marginTop: 4,
  },
  cardContent: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  expandHint: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'right',
  },
  footer: {
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
