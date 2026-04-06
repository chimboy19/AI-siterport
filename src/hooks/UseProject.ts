import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsAPI } from "./../api/projects";
import { toast } from "react-hot-toast";

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({mutationFn: ({userId,name,desc,}: {userId: string;name: string;desc: string;
    }) => projectsAPI.createProject(userId, name, desc),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.userId],
      });
      toast.success("new project created");
    },
  });
};



export const useProject = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsAPI.getProjectById(projectId!),
    enabled: !!projectId,
  });
};

export const useUserProject = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["projects", userId],
    queryFn: () => projectsAPI.getProjectByUser(userId!),
    enabled: !!userId,
  });
};


export const useDeleteProject = (lang: string, userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      projectsAPI.deleteProjectByUser(projectId, userId),
    onSuccess: () => {
      toast.success(
        lang === "jp" ? "プロジェクトを削除しました" : "Project deleted",
      );
      queryClient.invalidateQueries({ queryKey: ["projects", userId] });
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(
        lang === "jp"
          ? "プロジェクトの削除に失敗しました"
          : error.message || "Failed to delete project",
      );
    },
  });
};

export const useUpdateProject = (lang: string, userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: { name: string; description: string } }) =>
      projectsAPI.updateProject(projectId, data),
    onSuccess: () => {
      toast.success(
        lang === "jp" ? "プロジェクトを更新しました" : "Project updated",
      );
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["projects", userId] });
      }
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(
        lang === "jp"
          ? "プロジェクトの更新に失敗しました"
          : error.message || "Failed to update project",
      );
    },
  });
};