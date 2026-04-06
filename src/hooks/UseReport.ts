import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsAPI } from "../api/reports";
import { toast } from "react-hot-toast";
import type { Report } from "../types";

export const useUserReports = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["reports", "user", userId],
    queryFn: () => reportsAPI.getUserReports(userId!),
    enabled: !!userId,
  });
}

export const useProjectReports = (projectId: string | undefined, userId: string | undefined) => {
  return useQuery({
    queryKey: ["reports", projectId],
    queryFn: () => reportsAPI.getProjectReports(projectId!, userId!),
    enabled: !!projectId && !!userId,
  });
}

export const useReport = (reportId: string | undefined) => {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: () => reportsAPI.getReportById(reportId!),
    enabled: !!reportId,
  });
}

export const useCreateReport = (projectId: string | undefined, lang: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Report, "id" | "createdAt">) => reportsAPI.createReport(data),
    onSuccess: () => {
      toast.success(lang === 'jp' ? 'レポートを作成しました' : 'Report created');
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["reports", projectId] });
      }
    },
    onError: (error: any) => {
      console.error("Create report error:", error);
      toast.error(lang === 'jp' ? 'レポートの作成に失敗しました' : 'Failed to create report');
    }
  });
}

export const useUpdateReport = (lang: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string, data: Partial<Report> }) => reportsAPI.updateReport(reportId, data),
    onSuccess: (_, variables) => {
      toast.success(lang === 'jp' ? 'レポートを更新しました' : 'Report updated');
      queryClient.invalidateQueries({ queryKey: ["report", variables.reportId] });
    },
    onError: (error: any) => {
       console.error("Update report error:", error);
       toast.error(lang === 'jp' ? 'レポートの更新に失敗しました' : 'Failed to update report');
    }
  });
}

export const useDeleteReport = (projectId: string | undefined, lang: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => reportsAPI.deleteReport(reportId),
    onSuccess: () => {
      toast.success(lang === 'jp' ? 'レポートを削除しました' : 'Report deleted');
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["reports", projectId] });
      }
    },
    onError: (error: any) => {
      console.error("Delete report error:", error);
      toast.error(lang === 'jp' ? 'レポートの削除に失敗しました' : 'Failed to delete report');
    }
  });
}
