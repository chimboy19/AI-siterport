import { projectsAPI } from "./projects";
import { reportsAPI } from "./reports";
import type { Project, Report } from "../types";

export const searchAPI = {

  globalSearch: async ( userId: string, query: string,): Promise<{ projects: Project[]; reports: Report[] }> => {
    if (!query.trim()) {
      return { projects: [], reports: [] };
    }

    const [projects, reports] = await Promise.all([
      projectsAPI.getProjectByUser(userId),
      reportsAPI.getUserReports(userId),
    ]);
    const normalizedQuery = query.toLowerCase();
    const filteredProjects = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.description?.toLowerCase().includes(normalizedQuery),
    );
    const filteredReports = reports.filter(
      (r) =>
        r.title.toLowerCase().includes(normalizedQuery) ||
        r.generatedReport?.toLowerCase().includes(normalizedQuery),
    );

    return {
      projects: filteredProjects,
      reports: filteredReports,
    };
  },
};
