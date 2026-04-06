import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Folder, Search, Plus, Calendar, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserProject }from '../hooks/UseProject';
import { useUserReports } from '../hooks/UseReport';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const translations = {
  en: {
    title: "Projects",
    subtitle: "Manage all your construction projects",
    searchPlaceholder: "Search projects...",
    newProject: "New Project",
    noProjects: "No projects found.",
    reports: "reports",
    lastUpdated: "Last updated",
  },
  jp: {
    title: "プロジェクト",
    subtitle: "すべての建設プロジェクトを管理",
    searchPlaceholder: "プロジェクトを検索...",
    newProject: "新規プロジェクト",
    noProjects: "プロジェクトが見つかりません。",
    reports: "レポート",
    lastUpdated: "最終更新",
  },
};

const ProjectsListPage = () => {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const t = translations[lang as keyof typeof translations] || translations.en;

  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projects = [], isLoading: isProjectsLoading } = useUserProject(user?.uid);
  const { data: allReports = [], isLoading: isReportsLoading } = useUserReports(user?.uid);

  const isLoading = isProjectsLoading || isReportsLoading;

  const projectStats = useMemo(() => {
    const stats: Record<string, number> = {};
    allReports.forEach((report: any) => {
      stats[report.projectId] = (stats[report.projectId] || 0) + 1;
    });
    return stats;
  }, [allReports]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project: any) => 
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-display font-bold tracking-tighter text-ink mb-2 uppercase">
            {t.title}
          </h1>
          <p className="text-ink/60 font-medium italic serif">{t.subtitle}</p>
        </div>
        <Link 
          to={`/${lang}/dashboard`} 
          className="flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-none font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <Plus className="h-5 w-5" />
          {t.newProject}
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-line rounded-none font-bold focus:outline-none focus:border-ink transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        />
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-line/20 rounded-none animate-pulse border-2 border-line" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any, index: number) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/${lang}/project/${project.id}`}
                className="group block bg-white border-2 border-line rounded-none p-6 hover:border-ink transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-line rounded-none flex items-center justify-center group-hover:bg-ink group-hover:text-white transition-colors">
                    <Folder className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-ink/20 group-hover:text-ink transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold mb-1 group-hover:text-ink transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-ink/60 mb-4 line-clamp-1 italic serif">
                  {project.location}
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-line">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
                    <FileText className="h-3.5 w-3.5 opacity-40" />
                    <span>{projectStats[project.id] || 0} {t.reports}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
                    <Calendar className="h-3.5 w-3.5 opacity-40" />
                    <span>{project.createdAt?.toDate().toLocaleDateString() || '...'}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-line/10 rounded-none border-2 border-dashed border-line">
          <Folder className="h-12 w-12 text-ink/20 mx-auto mb-4" />
          <p className="text-ink/60 font-bold">{t.noProjects}</p>
        </div>
      )}
    </div>
  )
}

export default ProjectsListPage;
