import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usageAPI } from '../api/usage';

export const useUserUsage = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userUsage', userId],
    queryFn: () => usageAPI.getUsage(userId!),
    enabled: !!userId,
  });
};

export const useIncrementUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usageAPI.incrementUsage(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['userUsage', userId] });
    },
  });
};
