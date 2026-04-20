import { createClient } from '@/utils/supabase/client'

export interface EntryRow {
  id: string;
  user_id: string;
  emotion_id: number;
  content: string | null;
  entry_date: string; // 'YYYY-MM-DD'
  created_at: string;
}

export async function fetchEntriesByMonth(year: number, month: number) {
  const supabase = createClient();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  const { data, error } = await supabase
    .from('entries')
    .select('id, user_id, emotion_id, content, entry_date, created_at')
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: true });

  if (error) throw error;
  return (data as EntryRow[]) ?? [];
}

export async function createEntry(params: {
  emotion_id: number;
  content?: string;
  entry_date: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('entries')
    .insert({
      user_id: user.id,
      emotion_id: params.emotion_id,
      content: params.content || null,
      entry_date: params.entry_date,
    })
    .select()
    .single();

  if (error) throw error;
  return data as EntryRow;
}

export async function deleteEntry(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) throw error;
}
