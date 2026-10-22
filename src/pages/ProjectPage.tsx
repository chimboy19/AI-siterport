import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useProject, useDeleteProject, useUpdateProject } from '../hooks/UseProject';
import { useProjectReports, useDeleteReport } from '../hooks/UseReport';
import type { Report } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import { auth } from "../firebase";
import {
  Plus, FileText, Calendar, ChevronRight, ArrowLeft,
  Trash2, ImageIcon, Folder, Edit3, Search, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

const translations = {
  en: {
    backToDashboard: "Back",
    editProject: "Edit",
    deleteProject: "Delete",
    noDescription: "No description provided.",
    generateReport: "Generate report",
    reports: "Reports",
    evidence: "Evidence",
    lastActivity: "Last activity",
    status: "Status",
    active: "Active",
    dailyProgressReports: "Reports",
    deleteReportConfirm: "Are you sure you want to delete this report?",
    deleteProjectConfirm: "Are you sure you want to delete this project? All associated reports will also be deleted.",
    deleteProjectFailed: "Failed to delete project.",
    noReportsYet: "No reports yet",
    startDocumenting: "Start documenting site progress by creating your first AI-powered report.",
    createFirstReport: "Create first report",
    editProjectTitle: "Edit project",
    projectName: "Project name",
    description: "Description (optional)",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving…",
    placeholderName: "e.g., Downtown Plaza Renovation",
    placeholderDesc: "Briefly describe the project scope…",
    na: "N/A",
    searchPlaceholder: "Search reports…",
  },
  jp: {
    backToDashboard: "戻る",
    editProject: "編集",
    deleteProject: "削除",
    noDescription: "説明はありません。",
    generateReport: "レポートを作成",
    reports: "レポート",
    evidence: "エビデンス",
    lastActivity: "最終アクティビティ",
    status: "ステータス",
    active: "アクティブ",
    dailyProgressReports: "レポート",
    deleteReportConfirm: "このレポートを削除してもよろしいですか？",
    deleteProjectConfirm: "このプロジェクトを削除してもよろしいですか？関連するすべてのレポートも削除されます。",
    deleteProjectFailed: "プロジェクトの削除に失敗しました。",
    noReportsYet: "レポートはまだありません",
    startDocumenting: "最初のAIレポートを作成して、現場の進捗状況の記録を開始しましょう。",
    createFirstReport: "最初のレポートを作成",
    editProjectTitle: "プロジェクト編集",
    projectName: "プロジェクト名",
    description: "説明（任意）",
    cancel: "キャンセル",
    save: "保存",
    saving: "保存中…",
    placeholderName: "例：ダウンタウンプラザ改修工事",
    placeholderDesc: "プロジェクトの範囲を簡単に説明してください…",
    na: "なし",
    searchPlaceholder: "レポートを検索…",
  },
};

const ProjectPage = () => {
  const { lang = "en", projectId } = useParams<{ lang: string; projectId: string }>();
  const t = translations[lang as keyof typeof translations] || translations.en;
  const dateLocale = lang === "jp" ? ja : enUS;

  const [user] = useAuthState(auth);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const { data: reports = [], isLoading: isReportsLoading } = useProjectReports(projectId, user?.uid);
  const { mutate: deleteproject } = useDeleteProject(lang, user?.uid || "");
  const { mutate: updateproject, isPending: isUpdating } = useUpdateProject(lang, user?.uid);
  const { mutate: deletereport } = useDeleteReport(projectId, lang);

  const loading = isProjectLoading || isReportsLoading;

  useEffect(() => {
    if (!isProjectLoading && (!project || !user)) navigate(`/${lang}/dashboard`);
  }, [project, isProjectLoading, user, navigate, lang]);

  const handleDeleteReport = (reportId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm(t.deleteReportConfirm)) return;
    deletereport(reportId);
  };

  const handleDeleteProject = () => {
    if (!projectId || !window.confirm(t.deleteProjectConfirm)) return;
    deleteproject(projectId, { onSuccess: () => navigate(`/${lang}/dashboard`) });
  };

  const handleEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !editName.trim()) return;
    updateproject({ projectId, data: { name: editName.trim(), description: editDesc.trim() } }, {
      onSuccess: () => setIsEditModalOpen(false),
    });
  };

  const openEditModal = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDesc(project.description || "");
    setIsEditModalOpen(true);
  };

  const totalImages = (reports as Report[]).reduce((acc, r) => acc + r.images.length, 0);
  const lastActivity = reports.length > 0 ? new Date(reports[0].date) : null;

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return (reports as Report[]).filter((r) => r.title.toLowerCase().includes(q));
  }, [reports, searchQuery]);

  if (loading) return <div className="min-h-screen bg-[#f5f5f4]"><LoadingSpinner /></div>;

  const stats = [
    { label: t.reports, value: reports.length },
    { label: t.evidence, value: totalImages },
    { label: t.lastActivity, value: lastActivity ? format(lastActivity, "MMM d", { locale: dateLocale }) : t.na },
    { label: t.status, value: t.active, isBadge: true },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Back link */}
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground gap-1.5 mb-6 -ml-2 h-8">
          <Link to={`/${lang}/dashboard`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.backToDashboard}
          </Link>
        </Button>

        {/* ── Project header card ───────────────────────────────────── */}
        <Card className="bg-white mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Folder className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">{project?.name}</h1>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {project?.description || t.noDescription}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={openEditModal} className="gap-1.5">
                  <Edit3 className="h-3.5 w-3.5" />
                  {t.editProject}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteProject} className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                  {t.deleteProject}
                </Button>
                <Button size="sm" asChild className="gap-1.5 bg-foreground text-background hover:bg-foreground/90">
                  <Link to={`/${lang}/project/${projectId}/create-report`}>
                    <Plus className="h-4 w-4" />
                    {t.generateReport}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-border">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  {s.isBadge ? (
                    <Badge variant="success" className="text-xs">{s.value}</Badge>
                  ) : (
                    <p className="text-2xl font-bold tracking-tight text-foreground">{s.value}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Reports section ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{t.dailyProgressReports}</h2>
            <Badge variant="secondary" className="text-xs">{reports.length}</Badge>
          </div>
          <div className="relative max-w-xs w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white w-full sm:w-56"
            />
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(filteredReports as Report[]).map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link to={`/${lang}/report/${report.id}`}>
                  <Card className="bg-white hover:shadow-md hover:border-primary/30 transition-all duration-200 group cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                          <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => handleDeleteReport(report.id, e)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                        {report.title}
                      </h3>

                      <div className="flex items-center gap-3 pt-3 border-t border-border text-xs text-muted-foreground mt-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(new Date(report.date), "MMM d, yyyy", { locale: dateLocale })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span>{report.images.length} {t.evidence}</span>
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
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t.noReportsYet}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">{t.startDocumenting}</p>
              <Button asChild className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                <Link to={`/${lang}/project/${projectId}/create-report`}>
                  <Plus className="h-4 w-4" />
                  {t.createFirstReport}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Edit Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
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
                    <CardTitle className="text-lg">{t.editProjectTitle}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(false)} className="h-8 w-8 -mr-1 -mt-1">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <form onSubmit={handleEditProject}>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">{t.projectName}</label>
                      <Input required value={editName} onChange={(e) => setEditName(e.target.value)} placeholder={t.placeholderName} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">{t.description}</label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder={t.placeholderDesc}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">{t.cancel}</Button>
                    <Button type="submit" disabled={isUpdating} className="flex-1">{isUpdating ? t.saving : t.save}</Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectPage;