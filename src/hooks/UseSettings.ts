import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '../api/settings';
import { toast } from 'react-hot-toast';
import type { UserSettings } from '../types';

export const useSettings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['settings', userId],
    queryFn: () => settingsAPI.getSettings(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes — don't re-fetch on every page visit
  });
};

export const useSaveSettings = (userId: string | undefined, lang: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Omit<UserSettings, 'uid'>>) =>
      settingsAPI.saveSettings(userId!, data),
    onSuccess: () => {
      toast.success(lang === 'jp' ? '設定を保存しました' : 'Settings saved');
      queryClient.invalidateQueries({ queryKey: ['settings', userId] });
    },
    onError: () => {
      toast.error(lang === 'jp' ? '保存に失敗しました' : 'Failed to save settings');
    },
  });
};
