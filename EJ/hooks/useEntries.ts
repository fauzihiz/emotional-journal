import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEntriesByMonth, createEntry, deleteEntry } from '@/lib/api/entries';

export function useMonthEntries(year: number, month: number) {
  const today = new Date();
  const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1);

  return useQuery({
    queryKey: ['entries', year, month],
    queryFn: () => fetchEntriesByMonth(year, month),
    // Past months rarely change, cache them for 1 hour. Current/Future months 5 mins (global default).
    staleTime: isPastMonth ? 1000 * 60 * 60 : 1000 * 60 * 5,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEntry,
    onSuccess: (data) => {
      const date = new Date(data.entry_date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      // Invalidate the specific month cache
      queryClient.invalidateQueries({
        queryKey: ['entries', year, month],
      });
      
      // Also invalidate stats or global if needed
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEntry,
    onSuccess: (_, entryId) => {
      // Since we don't know the exact date in the success callback easily without data, 
      // we invalidate all entries to be safe, but we could optimize this if we pass date.
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
