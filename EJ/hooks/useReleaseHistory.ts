import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

export interface ReleaseSession {
  id: string;
  emotion_id: number;
  released_text: string | null;
  before_score: number;
  after_score: number;
  duration: number;
  created_at: string;
}

export function useReleaseHistory(userId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['release_history', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('release_sessions')
        .select('id, emotion_id, released_text, before_score, after_score, duration, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as ReleaseSession[]) ?? [];
    },
    enabled: !!userId,
  });
}
