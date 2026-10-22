import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Folder, Search, Plus, Calendar, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserProject } from '../hooks/UseProject';
import { useUserReports } from '../hooks/UseReport';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';

const translations = {
  en: {
    title: 'Projects',
    subtitle: 'Manage all your construction projects.',
    searchPlaceholder: 'Search projects…',
    newProject: 'New project',
    noProjects: 'No projects found',
    noProjectsDesc: 'Create a project from the dashboard to get started.',
    reports: 'reports',
  },
  jp: {
    title: 'プロジェクト',
    subtitle: 'すべての建設プロジェクトを管理します。',
    searchPlaceholder: 'プロジェクトを検索…',
    newProject: '新規プロジェクト',
    noProjects: 'プロジェクトが見つかりません',
    noProjectsDesc: 'ダッシュボードからプロジェクトを作成してください。',
    reports: 'レポート',
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
    return projects.filter(
      (project: any) =>
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Search + New project */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Button asChild className="gap-2 bg-foreground text-background hover:bg-foreground/90">
            <Link to={`/${lang}/dashboard`}>
              <Plus className="h-4 w-4" />
              {t.newProject}
            </Link>
          </Button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project: any, index: number) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link to={`/${lang}/project/${project.id}`}>
                  <Card className="bg-white hover:shadow-md hover:border-primary/30 transition-all duration-200 group cursor-pointer h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                          <Folder className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                      </div>

                      <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-4">
                          {project.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          <span>{projectStats[project.id] || 0} {t.reports}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{project.createdAt?.toDate().toLocaleDateString() || '…'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed bg-white">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                <Folder className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{t.noProjects}</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">{t.noProjectsDesc}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectsListPage;
