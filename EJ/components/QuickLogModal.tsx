import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Emotion } from '@/constants/emotions';
import EmotionPicker from './EmotionPicker';
import { useCreateEntry } from '@/hooks/useEntries';

interface Props {
  visible: boolean;
  dateStr: string; // 'YYYY-MM-DD'
  onClose: () => void;
}

export default function QuickLogModal({ visible, dateStr, onClose }: Props) {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [note, setNote] = useState('');

  const createEntryMutation = useCreateEntry();

  // Reset state when modal opens
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

  // Format date display (e.g., '2023-10-25' -> '25 Okt 2023')
  const dateObj = new Date(dateStr);
  const displayDate = isNaN(dateObj.getTime())
    ? dateStr
    : dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        {/* Clickable backdrop to close the modal */}
        <TouchableOpacity
          style={{ flex: 1, width: '100%' }}
          onPress={onClose}
          activeOpacity={1}
        />

        {/* Actual Form Container */}
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Bagaimana perasaanmu?</Text>
            <Text style={styles.subtitle}>{displayDate}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <EmotionPicker
            selected={selectedEmotion?.id ?? null}
            onSelect={setSelectedEmotion}
          />

          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Apa yang kamu rasakan saat ini?</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Yuk ceritakan kejadian hari ini..."
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              !selectedEmotion && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!selectedEmotion || createEntryMutation.isPending}
          >
            {createEntryMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Simpan Jurnal</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    marginBottom: 24,
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
  noteContainer: {
    marginTop: 24,
  },
  noteLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
    borderRadius: 16,
    padding: 20,
    height: 120,
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#4F46E5', // Warm Indigo
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
