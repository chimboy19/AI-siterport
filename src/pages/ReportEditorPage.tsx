import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useReport, useUpdateReport, useDeleteReport } from '../hooks/UseReport';
import { useProject } from '../hooks/UseProject';
import LoadingSpinner from "../components/LoadingSpinner";
import {
  ArrowLeft,
  Save,
  Copy,
  Check,
  FileText,
  Calendar,
  Edit3,
  Eye,
  // Download,
  Folder,
  ImageIcon,
  Trash2,
  FileDown,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import { toCanvas } from "html-to-image";
const translations = {
  en: {
    backToProject: "Back to Project",
    evidenceImages: "Evidence Images",
    exportPdf: "Export PDF",
    exporting: "Exporting...",
    copy: "Copy",
    copied: "Copied",
    preview: "Preview",
    edit: "Edit",
    deleteReport: "Delete Report",
    deleteConfirm: "Are you sure you want to delete this report?",
    refineReport: "Refine your site report...",
    siteEvidence: "SITE EVIDENCE",
    note: "Note",
    discard: "Discard",
    saveChanges: "SAVE CHANGES",
    saving: "Saving...",
    na: "N/A",
  },
  jp: {
    backToProject: "プロジェクトに戻る",
    evidenceImages: "枚のエビデンス画像",
    exportPdf: "PDFを書き出す",
    exporting: "書き出し中...",
    copy: "コピー",
    copied: "コピーしました",
    preview: "プレビュー",
    edit: "編集",
    deleteReport: "レポートを削除",
    deleteConfirm: "このレポートを削除してもよろしいですか？",
    refineReport: "レポートを修正してください...",
    siteEvidence: "現場エビデンス",
    note: "メモ",
    discard: "破棄",
    saveChanges: "変更を保存",
    saving: "保存中...",
    na: "なし",
  },
};

export default function ReportEditorPage() {
  const { lang = "en", reportId } = useParams<{ lang: string;reportId: string;}>();
  const t = translations[lang as keyof typeof translations] || translations.en;
  const dateLocale = lang === "jp" ? ja : enUS;

  const [user] = useAuthState(auth);
  const { data: report, isLoading: isReportLoading } = useReport(reportId);
  const { data: project, isLoading: isProjectLoading } = useProject(report?.projectId);
  const { mutate: updatereport, isPending: isSaving } = useUpdateReport(lang);
  const { mutate: deletereport } = useDeleteReport(report?.projectId, lang);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);

  const loading = isReportLoading || isProjectLoading;

  useEffect(() => {
    if (report && !editedContent && !isEditing) {
      setEditedContent(report.generatedReport || "");
    }
  }, [report, editedContent, isEditing]);

  useEffect(() => {
    if (!isReportLoading && (!report || !user)) {
      navigate(`/${lang}/dashboard`);
    }
  }, [isReportLoading, report, user, navigate, lang]);

  const handleSave = () => {
    if (!reportId) return;
    updatereport({
      reportId,
      data: {
        generatedReport: editedContent,
      }
    }, {
      onSuccess: () => setIsEditing(false)
    });
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !report) return;
    setIsExporting(true);
    const loadingToast = toast.loading(lang === "jp" ? "PDFを生成中..." : "Generating PDF...");

    try {
      const element = reportRef.current;
      
      const canvas = await toCanvas(element, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        skipFonts: false,
        fontEmbedCSS: "",
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      
      const pdfWidth = 210;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const imgScaledHeight = imgHeight * ratio;
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, imgScaledHeight]
      });
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgScaledHeight);

      const fileName = `${report.title.replace(/\s+/g, "-").toLowerCase()}-${format(new Date(report.date), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);
      
      toast.success(lang === "jp" ? "PDFを保存しました" : "PDF saved successfully", { id: loadingToast });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error(lang === "jp" ? "PDFの生成に失敗しました" : "Failed to generate PDF", { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    if (!reportId || !report) return;
    if (!window.confirm(t.deleteConfirm)) return;

    deletereport(reportId, {
      onSuccess: () => navigate(`/${lang}/project/${report.projectId}`)
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-32 print:pb-0">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 print:py-4">
        <Link
          to={`/${lang}/project/${report?.projectId}`}
          className="inline-flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mb-12 group print:hidden"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {t.backToProject}
        </Link>

        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 print:mb-8">
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 bg-ink text-white rounded flex items-center justify-center shrink-0">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter mb-4">
                {report?.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {report?.date &&
                      format(new Date(report.date), "MMMM d, yyyy", {
                        locale: dateLocale,
                      })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span>{project?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>
                    {report?.images.length} {t.evidenceImages}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 print:hidden">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 border border-line px-6 py-3 font-mono font-bold uppercase tracking-widest text-xs hover:bg-line transition-all disabled:opacity-50"
            >
              <FileDown
                className={`h-4 w-4 ${isExporting ? "animate-bounce" : ""}`}
              />
              {isExporting ? t.exporting : t.exportPdf}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 border border-line px-6 py-3 font-mono font-bold uppercase tracking-widest text-xs hover:bg-line transition-all"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? t.copied : t.copy}
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center justify-center gap-2 px-6 py-3 font-mono font-bold uppercase tracking-widest text-xs transition-all ${
                isEditing
                  ? "bg-ink text-white"
                  : "border border-ink hover:bg-ink hover:text-white"
              }`}
            >
              {isEditing ? (
                <Eye className="h-4 w-4" />
              ) : (
                <Edit3 className="h-4 w-4" />
              )}
              {isEditing ? t.preview : t.edit}
            </button>
            <button
              onClick={handleDelete}
              className="p-3 text-ink/20 hover:text-red-600 transition-colors border border-line hover:border-red-600"
              title={t.deleteReport}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div ref={reportRef} className="bg-white p-4 print:p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Report Content */}
          <div className="lg:col-span-8">
            <div className="border border-ink p-8 md:p-16 relative">
              <div className="grid-pattern absolute inset-0 opacity-5 -z-10" />

              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-[800px] p-8 border border-line focus:border-ink outline-none transition-all font-mono text-sm resize-none bg-white leading-relaxed"
                  placeholder={t.refineReport}
                />
              ) : (
                <div className="bg-white">
                  <div className="prose prose-lg">
                    <Markdown
                      components={{
                        img: ({ ...props }) => (
                          <img {...props} crossOrigin="anonymous" className="rounded-lg border border-line my-8" />
                        ),
                      }}
                    >
                      {editedContent}
                    </Markdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Images */}
          <div className="lg:col-span-4 space-y-10">
            <div className="sticky top-24">
              <h2 className="text-xl font-display font-bold mb-8 border-b border-line pb-4 flex items-center gap-3">
                <Sparkles className="h-6 w-6" />
                {t.siteEvidence}
              </h2>
              <div className="space-y-10">
                {report?.images.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="border border-line p-4 group-hover:border-ink transition-all">
                      <div className="relative aspect-video overflow-hidden bg-line mb-4">
                        <img
                          src={img.url}
                          alt={`Evidence ${index}`}
                          className="w-full h-full object-cover transition-all duration-500"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-0 left-0">
                          <span className="bg-ink text-white text-[8px] font-mono font-bold px-2 py-1 uppercase tracking-widest">
                            IMG_{index + 1}
                          </span>
                        </div>
                      </div>
                      {img.note && (
                        <div className="pt-2">
                          <p className="text-xs font-mono font-bold uppercase tracking-widest opacity-40 mb-1">
                            {t.note}
                          </p>
                          <p className="text-sm text-ink leading-relaxed italic">
                            "{img.note}"
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink p-6 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] print:hidden"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-end gap-6">
              <button
                onClick={() => setIsEditing(false)}
                className="font-mono font-bold uppercase tracking-widest text-xs opacity-40 hover:opacity-100 transition-opacity"
              >
                {t.discard}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="brutal-button flex items-center gap-3 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {isSaving ? t.saving : t.saveChanges}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
