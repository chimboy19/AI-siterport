import { useQuery } from "@tanstack/react-query";
import { searchAPI } from "../api/search";

export const useGlobalSearch = (userId: string | undefined, searchQuery: string) => {
  return useQuery({
    queryKey: ["global-search", userId, searchQuery],
    queryFn: () => searchAPI.globalSearch(userId!, searchQuery),
    enabled: !!userId && searchQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
