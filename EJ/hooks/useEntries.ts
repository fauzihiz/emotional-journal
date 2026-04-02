import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEntriesByMonth, createEntry, deleteEntry } from '@/lib/api/entries';

export function useMonthEntries(year: number, month: number) {
  return useQuery({
    queryKey: ['entries', year, month],
    queryFn: () => fetchEntriesByMonth(year, month),
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEntry,
    onSuccess: (data) => {
      const date = new Date(data.entry_date);
      // Invalidate the month cache so heatmap refreshes
      queryClient.invalidateQueries({
        queryKey: ['entries', date.getFullYear(), date.getMonth() + 1],
      });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => {
      // Invalidate all entry queries
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}
