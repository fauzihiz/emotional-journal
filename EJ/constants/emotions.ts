// Emotion data matching the Supabase `emotions` table
export interface Emotion {
  id: number;
  label: string;
  weight: number;
  color: string;
  emoji: string;
}

export const EMOTIONS: Emotion[] = [
  { id: 1,  label: 'Marah',    weight: 1,  color: '#EF4444', emoji: '😡' },
  { id: 2,  label: 'Takut',    weight: 2,  color: '#475569', emoji: '😨' },
  { id: 3,  label: 'Cemas',    weight: 3,  color: '#8B5CF6', emoji: '😰' },
  { id: 4,  label: 'Sedih',    weight: 4,  color: '#3B82F6', emoji: '😢' },
  { id: 5,  label: 'Kecewa',   weight: 5,  color: '#6B21A8', emoji: '😞' },
  { id: 6,  label: 'Bosan',    weight: 6,  color: '#94A3B8', emoji: '😐' },
  { id: 7,  label: 'Tenang',   weight: 7,  color: '#2DD4BF', emoji: '😌' },
  { id: 8,  label: 'Bahagia',  weight: 8,  color: '#4ADE80', emoji: '😊' },
  { id: 9,  label: 'Syukur',   weight: 9,  color: '#FACC15', emoji: '🙏' },
  { id: 10, label: 'Berani',   weight: 10, color: '#FB923C', emoji: '💪' },
  { id: 11, label: 'Semangat', weight: 11, color: '#F59E0B', emoji: '🔥' },
  { id: 12, label: 'Yakin',    weight: 12, color: '#10B981', emoji: '✨' },
];

export const getEmotionById = (id: number): Emotion | undefined =>
  EMOTIONS.find((e) => e.id === id);

export const getEmotionColor = (id: number): string =>
  getEmotionById(id)?.color ?? '#E2E8F0';
