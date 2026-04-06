import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { getEmotionById, getCalmnessLabel } from '@/constants/emotions';

interface ReleaseSession {
  id: string;
  emotion_id: number;
  released_text: string;
  before_score: number;
  after_score: number;
  duration: number;
  created_at: string;
}

export default function ReleaseHistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ReleaseSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('release_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching release history:', error);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: ReleaseSession }) => {
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
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.emotionCircle}>
            <Text style={styles.emoji}>{emotion?.emoji || '😶'}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.dateText}>{dateStr} • {timeStr}</Text>
            <Text style={styles.emotionTitle}>{emotion?.label || 'Emosi'}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>
              {item.after_score} ({getCalmnessLabel(item.after_score)})
            </Text>
          </View>
        </View>

        {item.released_text ? (
          <View style={styles.contentBox}>
            <Text style={styles.contentText} numberOfLines={3}>
              "{item.released_text}"
            </Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <Ionicons name="timer-outline" size={14} color="#94A3B8" />
          <Text style={styles.footerText}>Durasi: {Math.floor(item.duration / 60)}m {item.duration % 60}s</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Riwayat Release Emosi</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="leaf-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyText}>Belum ada riwayat sesi release emosi.</Text>
          <TouchableOpacity 
            style={styles.startBtn}
            onPress={() => router.push('/release')}
          >
            <Text style={styles.startBtnText}>Mulai Sesi Pertama</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchHistory}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emotionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 2,
  },
  emotionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  scoreBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  contentBox: {
    backgroundColor: '#FDFBF7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  startBtn: {
    marginTop: 24,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
