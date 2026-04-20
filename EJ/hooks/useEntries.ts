import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEntriesByMonth, createEntry, deleteEntry } from '@/lib/api/entries';

export function useMonthEntries(userId: string | undefined, year: number, month: number) {
  const today = new Date();
  const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1);

  return useQuery({
    queryKey: ['entries', userId, year, month],
    queryFn: () => fetchEntriesByMonth(year, month),
    enabled: !!userId,
    staleTime: isPastMonth ? 1000 * 60 * 60 : 1000 * 60 * 5,
  });
}

export function useCreateEntry(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEntry,
    onSuccess: (data) => {
      const date = new Date(data.entry_date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      queryClient.invalidateQueries({
        queryKey: ['entries', userId, year, month],
      });
      
      queryClient.invalidateQueries({ queryKey: ['stats', userId] });
    },
  });
}

export function useDeleteEntry(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries', userId] });
      queryClient.invalidateQueries({ queryKey: ['stats', userId] });
    },
  });
}
