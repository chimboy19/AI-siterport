import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Folder, ChevronRight, FileText,
  Image as ImageIcon, Trash2, Edit3, Search, Sparkles, X,
} from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { ja, enUS } from 'date-fns/locale';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useCreateProject, useUserProject, useDeleteProject, useUpdateProject } from '../hooks/UseProject';
import { useUserReports } from '../hooks/UseReport';
import { useUserUsage } from '../hooks/UseUsage';
import type { Report, Project } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from '../components/ui/card';


// ─── i18n ──────────────────────────────────────────────────────────────────────

const translations = {
  en: {
    dashboard: 'Dashboard',
    welcome: 'Welcome back,',
    manage: 'Manage your site documentation and AI-generated reports.',
    newProject: 'New project',
    totalProjects: 'Total projects',
    aiReports: 'AI reports',
    imagesAnalyzed: 'Images analyzed',
    activeProjects: 'Active projects',
    activeProjectsDesc: "Projects you're documenting right now.",
    recentReports: 'Recent reports',
    recentReportsDesc: 'Your latest AI reports.',
    noProjects: 'No active projects',
    noProjectsDesc: 'Create a project to start uploading site photos.',
    createProject: 'Create project',
    noReports: 'No reports yet',
    noReportsDesc: 'Reports appear after you analyze images.',
    generateReport: 'Generate a report',
    generateReportDesc: 'Select a project, upload site images, and get an AI-powered report instantly.',
    getStarted: 'Get started',
    newProjectTitle: 'New project',
    editProjectTitle: 'Edit project',
    projectName: 'Project name',
    projectDesc: 'Description (optional)',
    scopePlaceholder: 'Briefly describe the project scope…',
    namePlaceholder: 'e.g., Downtown Plaza Renovation',
    cancel: 'Cancel',
    create: 'Create',
    creating: 'Creating…',
    save: 'Save',
    saving: 'Saving…',
    justNow: 'Just now',
    searchPlaceholder: 'Search projects',
    viewAll: 'View all',
    reportsUsed: 'of',
    reportsLabel: 'used',
    allUsed: 'Limit reached',
    upgradePlan: 'Upgrade plan',
  },
  jp: {
    dashboard: 'ダッシュボード',
    welcome: 'おかえりなさい、',
    manage: '現場ドキュメントとAI生成レポートを管理します。',
    newProject: '新規プロジェクト',
    totalProjects: '総プロジェクト数',
    aiReports: 'AIレポート',
    imagesAnalyzed: '分析済み画像',
    activeProjects: '進行中のプロジェクト',
    activeProjectsDesc: '現在記録中のプロジェクト。',
    recentReports: '最近のレポート',
    recentReportsDesc: '最新のAIレポート。',
    noProjects: 'プロジェクトなし',
    noProjectsDesc: '現場写真をアップロードするプロジェクトを作成してください。',
    createProject: 'プロジェクト作成',
    noReports: 'レポートなし',
    noReportsDesc: '画像を分析するとレポートが表示されます。',
    generateReport: 'レポート生成',
    generateReportDesc: 'プロジェクトを選択して現場画像をアップロードし、AIパワーのレポートを即座に生成します。',
    getStarted: '開始する',
    newProjectTitle: '新規プロジェクト',
    editProjectTitle: 'プロジェクト編集',
    projectName: 'プロジェクト名',
    projectDesc: '説明（任意）',
    scopePlaceholder: 'プロジェクトの範囲を簡単に説明してください…',
    namePlaceholder: '例：丸の内プラザ改修工事',
    cancel: 'キャンセル',
    create: '作成',
    creating: '作成中…',
    save: '保存',
    saving: '保存中…',
    justNow: 'たった今',
    searchPlaceholder: 'プロジェクトを検索',
    viewAll: 'すべて表示',
    reportsUsed: '/',
    reportsLabel: '使用済み',
    allUsed: '制限に達しました',
    upgradePlan: 'プランをアップグレード',
  },
};

// ─── Project Modal ─────────────────────────────────────────────────────────────

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  title: string;
  name: string;
  desc: string;
  onNameChange: (v: string) => void;
  onDescChange: (v: string) => void;
  submitLabel: string;
  cancelLabel: string;
  isPending: boolean;
  t: typeof translations.en;
}

function ProjectModal({
  isOpen, onClose, onSubmit, title, name, desc,
  onNameChange, onDescChange, submitLabel, cancelLabel, isPending, t,
}: ProjectModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md"
          >
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mr-1 -mt-1">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <form onSubmit={onSubmit}>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t.projectName}</label>
                    <Input required value={name} onChange={(e) => onNameChange(e.target.value)} placeholder={t.namePlaceholder} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t.projectDesc}</label>
                    <textarea
                      value={desc}
                      onChange={(e) => onDescChange(e.target.value)}
                      placeholder={t.scopePlaceholder}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                  </div>
                </CardContent>
                <CardFooter className="gap-3">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">{cancelLabel}</Button>
                  <Button type="submit" disabled={isPending} className="flex-1">{isPending ? '…' : submitLabel}</Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const t = translations[lang as keyof typeof translations] || translations.en;
  const dateLocale = lang === 'jp' ? ja : enUS;

  const [user] = useAuthState(auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projects, isLoading: isProjectsLoading } = useUserProject(user?.uid);
  const { data: reports, isLoading: isReportsLoading } = useUserReports(user?.uid);
  const { data: userUsage, isLoading: isUsageLoading } = useUserUsage(user?.uid);
  const limit = userUsage?.limit || 4;
  const isLoading = isProjectsLoading || isReportsLoading || isUsageLoading;

  const { mutate: createproject, isPending: isCreating } = useCreateProject();
  const { mutate: deleteproject, isPending: isdeleting } = useDeleteProject(lang, user?.uid || '');
  const { mutate: updateproject, isPending: isUpdating } = useUpdateProject(lang, user?.uid);

  const handleCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    createproject({ userId: user.uid, name: newProjectName, desc: newProjectDesc });
    setNewProjectName(''); setNewProjectDesc(''); setIsModalOpen(false);
  };

  const handleUpdateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProject) return;
    updateproject({ projectId: editingProject.id, data: { name: newProjectName, description: newProjectDesc } });
    setNewProjectName(''); setNewProjectDesc(''); setEditingProject(null); setIsEditModalOpen(false);
  };

  const openEditModal = (project: Project, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setEditingProject(project); setNewProjectName(project.name); setNewProjectDesc(project.description || ''); setIsEditModalOpen(true);
  };

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    if (!user) { alert('User not authenticated'); return; }
    deleteproject(projectId);
  };

  const stats = useMemo(() => {
    const totalImages = reports?.reduce((sum: number, r: Report) => sum + (r.images?.length || 0), 0) || 0;
    return [
      { label: t.totalProjects, value: projects?.length || 0, icon: Folder },
      { label: t.aiReports, value: reports?.length || 0, icon: FileText },
      { label: t.imagesAnalyzed, value: totalImages, icon: ImageIcon },
    ];
  }, [projects, reports, t]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const sorted = [...projects].sort((a, b) => {
      const tA = a.updatedAt?.toMillis() || a.createdAt?.toMillis() || 0;
      const tB = b.updatedAt?.toMillis() || b.createdAt?.toMillis() || 0;
      return tB - tA;
    });
    if (!searchQuery.trim()) return sorted.slice(0, 4);
    const q = searchQuery.toLowerCase();
    return sorted.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)).slice(0, 4);
  }, [projects, searchQuery]);

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    if (!searchQuery.trim()) return reports.slice(0, 6);
    const q = searchQuery.toLowerCase();
    return reports.filter((r: Report) => r.title.toLowerCase().includes(q)).slice(0, 6);
  }, [reports, searchQuery]);

  if (isLoading) return <LoadingSpinner />;

  const usageCount = userUsage?.count ?? 0;
  const isLimitReached = usageCount >= limit;

  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Page heading ─────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t.dashboard}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.welcome} {user?.displayName || 'there'}. {t.manage}
          </p>
        </div>

        {/* ── Search + New project ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4" />
            {t.newProject}
          </Button>
        </div>

        {/* ── AI Reports Usage bar ──────────────────────────────────────── */}
        {!isUsageLoading && userUsage && (
          <Card className="mb-6 bg-white">
            <CardContent className="px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 shrink-0">
                  <Sparkles className="h-4.5 w-4.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{t.aiReports}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <Progress
                    value={usageCount}
                    max={limit}
                    className={`h-2 ${isLimitReached ? '[&>div]:bg-foreground' : '[&>div]:bg-foreground'}`}
                  />
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {usageCount} {t.reportsUsed} {limit} {t.reportsLabel}
                </span>
                {isLimitReached && (
                  <Badge className="shrink-0 bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
                    {t.allUsed}
                  </Badge>
                )}
                <Button size="sm" variant="outline" className="shrink-0 text-sm font-medium">
                  {t.upgradePlan}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <stat.icon className="h-4 w-4 text-muted-foreground/60" />
                  </div>
                  <p className="text-4xl font-bold tracking-tight text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Main two-column grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Active projects — left 8 cols */}
          <div className="lg:col-span-8">
            <Card className="bg-white h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">{t.activeProjects}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{t.activeProjectsDesc}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground h-7 px-2">
                    <Link to={`/${lang}/projects`}>{t.viewAll}</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {filteredProjects.length > 0 ? (
                  <div className="space-y-2">
                    {filteredProjects.map((project, i) => (
                      <motion.div key={project.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                        <Link to={`/${lang}/project/${project.id}`}>
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                              <Folder className="h-4.5 w-4.5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{project.name}</p>
                              {project.description && (
                                <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => openEditModal(project, e)}>
                                <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleDeleteProject(project.id, e)} disabled={isdeleting}>
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 text-center rounded-lg border border-dashed border-border">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                      <Folder className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{t.noProjects}</p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">{t.noProjectsDesc}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent reports — right 4 cols */}
          <div className="lg:col-span-4">
            <Card className="bg-white h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{t.recentReports}</CardTitle>
                <CardDescription className="text-xs">{t.recentReportsDesc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {filteredReports.length > 0 ? (
                  <div className="space-y-1">
                    {filteredReports.map((report: Report, i: number) => (
                      <motion.div key={report.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                        <Link
                          to={`/${lang}/report/${report.id}`}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors group"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground " />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{report.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {format(new Date(report.date), 'MMM d, yyyy', { locale: dateLocale })}
                            </p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 text-center rounded-lg border border-dashed border-border">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{t.noReports}</p>
                    <p className="text-xs text-muted-foreground max-w-[160px]">{t.noReportsDesc}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        title={t.newProjectTitle}
        name={newProjectName} desc={newProjectDesc}
        onNameChange={setNewProjectName} onDescChange={setNewProjectDesc}
        submitLabel={t.create} cancelLabel={t.cancel}
        isPending={isCreating} t={t}
      />
      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingProject(null); }}
        onSubmit={handleUpdateProject}
        title={t.editProjectTitle}
        name={newProjectName} desc={newProjectDesc}
        onNameChange={setNewProjectName} onDescChange={setNewProjectDesc}
        submitLabel={t.save} cancelLabel={t.cancel}
        isPending={isUpdating} t={t}
      />
    </div>
  );
};

export default Dashboard;
