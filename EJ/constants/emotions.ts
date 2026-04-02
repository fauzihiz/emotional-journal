// Emotion data matching the Supabase `emotions` table
export interface Emotion {
  id: number;
  label: string;
  weight: number;
  color: string;
  emoji: string;
}

export const EMOTIONS: Emotion[] = [
  { id: 1, label: 'Semangat', weight: 8, color: '#FFD700', emoji: '🔥' },
  { id: 2, label: 'Bahagia',  weight: 7, color: '#32CD32', emoji: '😊' },
  { id: 3, label: 'Tenang',   weight: 6, color: '#87CEEB', emoji: '😌' },
  { id: 4, label: 'Berani',   weight: 5, color: '#FFA500', emoji: '💪' },
  { id: 5, label: 'Bosan',    weight: 4, color: '#A9A9A9', emoji: '😐' },
  { id: 6, label: 'Sedih',    weight: 3, color: '#1E90FF', emoji: '😢' },
  { id: 7, label: 'Kecewa',   weight: 2, color: '#800080', emoji: '😞' },
  { id: 8, label: 'Marah',    weight: 1, color: '#FF4500', emoji: '😡' },
];

export const getEmotionById = (id: number): Emotion | undefined =>
  EMOTIONS.find((e) => e.id === id);

export const getEmotionColor = (id: number): string =>
  getEmotionById(id)?.color ?? '#E2E8F0';
