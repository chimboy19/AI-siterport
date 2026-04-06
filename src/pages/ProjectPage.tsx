import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useProject, useDeleteProject, useUpdateProject } from '../hooks/UseProject';
import { useProjectReports, useDeleteReport } from '../hooks/UseReport';
import type { Report } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import { auth } from "../firebase";
import {
  Plus,
  FileText,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Trash2,
  ImageIcon,
  BarChart3,
  Folder,
  Edit3,
  ArrowRight,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const translations = {
  en: {
    backToDashboard: "Back to Dashboard",
    editProject: "Edit Project",
    deleteProject: "Delete Project",
    noDescription: "No description provided.",
    generateReport: "Generate Report",
    reports: "Reports",
    evidence: "Evidence",
    lastActivity: "Last Activity",
    status: "Status",
    active: "Active",
    dailyProgressReports: "DAILY PROGRESS REPORTS",
    deleteReportConfirm: "Are you sure you want to delete this report?",
    deleteProjectConfirm:
      "Are you sure you want to delete this project? All associated reports will also be deleted.",
    deleteProjectFailed: "Failed to delete project.",
    noReportsYet: "NO REPORTS YET.",
    startDocumenting:
      "Start documenting site progress by creating your first AI-powered report.",
    createFirstReport: "Create First Report",
    editProjectTitle: "EDIT PROJECT.",
    projectName: "Project Name",
    description: "Description (Optional)",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    placeholderName: "e.g., Downtown Plaza Renovation",
    placeholderDesc: "Briefly describe the project scope...",
    na: "N/A",
    searchPlaceholder: "Search reports...",
  },
  jp: {
    backToDashboard: "ダッシュボードに戻る",
    editProject: "プロジェクトを編集",
    deleteProject: "プロジェクトを削除",
    noDescription: "説明はありません。",
    generateReport: "レポートを作成",
    reports: "レポート",
    evidence: "エビデンス",
    lastActivity: "最終アクティビティ",
    status: "ステータス",
    active: "アクティブ",
    dailyProgressReports: "日次進捗レポート",
    deleteReportConfirm: "このレポートを削除してもよろしいですか？",
    deleteProjectConfirm:
      "このプロジェクトを削除してもよろしいですか？関連するすべてのレポートも削除されます。",
    deleteProjectFailed: "プロジェクトの削除に失敗しました。",
    noReportsYet: "レポートはまだありません。",
    startDocumenting:
      "最初のAIレポートを作成して、現場の進捗状況の記録を開始しましょう。",
    createFirstReport: "最初のレポートを作成",
    editProjectTitle: "プロジェクト編集",
    projectName: "プロジェクト名",
    description: "説明（任意）",
    cancel: "キャンセル",
    save: "保存",
    saving: "保存中...",
    placeholderName: "例：ダウンタウンプラザ改修工事",
    placeholderDesc: "プロジェクトの範囲を簡単に説明してください...",
    na: "なし",
    searchPlaceholder: "レポートを検索...",
  },
};

 const  ProjectPage=() =>{
  const { lang = "en", projectId } = useParams<{
    lang: string;
    projectId: string;
  }>();
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
    if (!isProjectLoading && (!project || !user)) {
      navigate(`/${lang}/dashboard`);
    }
  }, [project, isProjectLoading, user, navigate, lang]);

  const handleDeleteReport = (reportId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm(t.deleteReportConfirm)) return;
    deletereport(reportId);
  };

  const handleDeleteProject = () => {
    if (!projectId) return;
    if (!window.confirm(t.deleteProjectConfirm)) return;
    deleteproject(projectId, {
      onSuccess: () => navigate(`/${lang}/dashboard`)
    });
  };

  const handleEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !editName.trim()) return;

    updateproject({
      projectId,
      data: {
        name: editName.trim(),
        description: editDesc.trim(),
      }
    }, {
      onSuccess: () => setIsEditModalOpen(false)
    });
  };

  const openEditModal = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDesc(project.description || "");
    setIsEditModalOpen(true);
  };

  const totalImages = (reports as Report[]).reduce(
    (acc: number, report: Report) => acc + report.images.length,
    0,
  );
  const lastActivity = reports.length > 0 ? new Date(reports[0].date) : null;

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const query = searchQuery.toLowerCase();
    return (reports as Report[]).filter((r: Report) => r.title.toLowerCase().includes(query));
  }, [reports, searchQuery]);

  if (loading)
    return (
      <div className="min-h-screen bg-white">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to={`/${lang}/dashboard`}
          className="inline-flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mb-12 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {t.backToDashboard}
        </Link>

        {/* Project Header Card */}
        <div className="border border-ink p-10 mb-16 relative">
          <div className="grid-pattern absolute inset-0 opacity-5 -z-10" />
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 bg-ink rounded-none flex items-center justify-center">
                  <Folder className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter">
                  {project?.name}
                </h1>
                <div className="flex items-center gap-1">
                  <button
                    onClick={openEditModal}
                    className="p-2 text-ink/20 hover:text-ink transition-colors"
                    title={t.editProject}
                  >
                    <Edit3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="p-2 text-ink/20 hover:text-red-600 transition-colors"
                    title={t.deleteProject}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-ink/60 text-lg max-w-3xl leading-relaxed">
                {project?.description || t.noDescription}
              </p>
            </div>
            <Link
              to={`/${lang}/project/${projectId}/create-report`}
              className="brutal-button flex items-center justify-center gap-2 shrink-0"
            >
              <Plus className="h-5 w-5" />
              {t.generateReport}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-12 pt-10 border-t border-line">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mb-2">
                {t.reports}
              </p>
              <p className="text-3xl font-display font-bold">
                {reports.length}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mb-2">
                {t.evidence}
              </p>
              <p className="text-3xl font-display font-bold">{totalImages}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mb-2">
                {t.lastActivity}
              </p>
              <p className="text-3xl font-display font-bold">
                {lastActivity
                  ? format(lastActivity, "MMM d", { locale: dateLocale })
                  : t.na}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mb-2">
                {t.status}
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest bg-ink text-white">
                {t.active}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-4 gap-4">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <BarChart3 className="h-6 w-6" />
              {t.dailyProgressReports}
            </h2>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/20 group-focus-within:text-ink transition-colors" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-line focus:border-ink outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(filteredReports as Report[]).map((report: Report, i: number) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <Link
                    to={`/${lang}/report/${report.id}`}
                    className="block border border-line p-8 hover:border-ink transition-all relative"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="h-10 w-10 bg-line flex items-center justify-center group-hover:bg-ink transition-colors">
                        <FileText className="h-5 w-5 text-ink group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDeleteReport(report.id, e)}
                          className="p-2 text-ink/20 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          title={t.deleteReportConfirm}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-5 w-5 text-ink/20 group-hover:text-ink transition-colors" />
                      </div>
                    </div>

                    <h3 className="text-xl font-display font-bold mb-4 group-hover:underline underline-offset-4 decoration-2">
                      {report.title}
                    </h3>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-line">
                      <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(report.date), "MMM d, yyyy", {
                              locale: dateLocale,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ImageIcon className="h-3 w-3" />
                          <span>
                            {report.images.length} {t.evidence}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-line p-20 flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-line mb-6" />
              <h3 className="text-xl font-display font-bold mb-2">
                {t.noReportsYet}
              </h3>
              <p className="text-ink/40 text-sm max-w-xs mb-10">
                {t.startDocumenting}
              </p>
              <Link
                to={`/${lang}/project/${projectId}/create-report`}
                className="brutal-button"
              >
                {t.createFirstReport}
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md border border-ink shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-10"
            >
              <h2 className="text-3xl font-display font-bold mb-8">
                {t.editProjectTitle}
              </h2>
              <form onSubmit={handleEditProject} className="space-y-6">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest mb-2">
                    {t.projectName}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={t.placeholderName}
                    className="w-full px-4 py-3 border border-line focus:border-ink outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest mb-2">
                    {t.description}
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder={t.placeholderDesc}
                    rows={3}
                    className="w-full px-4 py-3 border border-line focus:border-ink outline-none transition-all resize-none font-medium"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-3 font-bold text-ink/40 hover:text-ink transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 brutal-button"
                  >
                    {isUpdating ? t.saving : t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default  ProjectPage