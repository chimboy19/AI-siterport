import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useReport, useUpdateReport, useDeleteReport } from '../hooks/UseReport';
import { useProject } from '../hooks/UseProject';
import LoadingSpinner from "../components/LoadingSpinner";
import {
  ArrowLeft, Save, Copy, Check, FileText, Calendar,
  Edit3, Eye, Folder, ImageIcon, Trash2, FileDown, Sparkles, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import { toCanvas } from "html-to-image";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";


const translations = {
  en: {
    backToProject: "Back to project",
    evidenceImages: "evidence images",
    exportPdf: "Export PDF",
    exporting: "Exporting…",
    copy: "Copy",
    copied: "Copied!",
    preview: "Preview",
    edit: "Edit",
    deleteReport: "Delete",
    deleteConfirm: "Are you sure you want to delete this report?",
    refineReport: "Refine your site report…",
    siteEvidence: "Site evidence",
    note: "Note",
    discard: "Discard",
    saveChanges: "Save changes",
    saving: "Saving…",
    na: "N/A",
    reportContent: "Report content",
  },
  jp: {
    backToProject: "プロジェクトに戻る",
    evidenceImages: "枚のエビデンス画像",
    exportPdf: "PDFを書き出す",
    exporting: "書き出し中…",
    copy: "コピー",
    copied: "コピーしました",
    preview: "プレビュー",
    edit: "編集",
    deleteReport: "削除",
    deleteConfirm: "このレポートを削除してもよろしいですか？",
    refineReport: "レポートを修正してください…",
    siteEvidence: "現場エビデンス",
    note: "メモ",
    discard: "破棄",
    saveChanges: "変更を保存",
    saving: "保存中…",
    na: "なし",
    reportContent: "レポート内容",
  },
};

export default function ReportEditorPage() {
  const { lang = "en", reportId } = useParams<{ lang: string; reportId: string }>();
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
    if (!isReportLoading && (!report || !user)) navigate(`/${lang}/dashboard`);
  }, [isReportLoading, report, user, navigate, lang]);

  const handleSave = () => {
    if (!reportId) return;
    updatereport({ reportId, data: { generatedReport: editedContent } }, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !report) return;
    setIsExporting(true);
    const loadingToast = toast.loading(lang === "jp" ? "PDFを生成中..." : "Generating PDF…");
    try {
      const canvas = await toCanvas(reportRef.current, {
        pixelRatio: 2, backgroundColor: "#ffffff", skipFonts: false, fontEmbedCSS: "", cacheBust: true,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdfWidth = 210;
      const ratio = pdfWidth / canvas.width;
      const imgScaledHeight = canvas.height * ratio;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pdfWidth, imgScaledHeight] });
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgScaledHeight);
      pdf.save(`${report.title.replace(/\s+/g, "-").toLowerCase()}-${format(new Date(report.date), "yyyy-MM-dd")}.pdf`);
      toast.success(lang === "jp" ? "PDFを保存しました" : "PDF saved", { id: loadingToast });
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error(lang === "jp" ? "PDF生成に失敗" : "Failed to generate PDF", { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    if (!reportId || !report) return;
    if (!window.confirm(t.deleteConfirm)) return;
    deletereport(reportId, { onSuccess: () => navigate(`/${lang}/project/${report.projectId}`) });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-[#f5f5f4]"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-[#f5f5f4] pb-32 print:pb-0 print:bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-4">

        {/* Back link */}
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground gap-1.5 mb-6 -ml-2 h-8 print:hidden">
          <Link to={`/${lang}/project/${report?.projectId}`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.backToProject}
          </Link>
        </Button>

        {/* ── Report header card ─────────────────────────────────────── */}
        <Card className="bg-white mb-6 print:shadow-none print:border-0">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
              {/* Left: Title + meta */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{report?.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <Badge variant="secondary" className="text-xs gap-1.5 font-normal">
                      <Calendar className="h-3 w-3" />
                      {report?.date && format(new Date(report.date), "MMMM d, yyyy", { locale: dateLocale })}
                    </Badge>
                    <Badge variant="secondary" className="text-xs gap-1.5 font-normal">
                      <Folder className="h-3 w-3" />
                      {project?.name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs gap-1.5 font-normal">
                      <ImageIcon className="h-3 w-3" />
                      {report?.images.length} {t.evidenceImages}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
                <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting} className="gap-1.5">
                  {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                  {isExporting ? t.exporting : t.exportPdf}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t.copied : t.copy}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "default" : "outline"}
                  className="gap-1.5"
                >
                  {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                  {isEditing ? t.preview : t.edit}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDelete}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                  title={t.deleteReport}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Main content ───────────────────────────────────────────── */}
        <div ref={reportRef} className="print:p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Report body — left 8 cols */}
            <div className="lg:col-span-8">
              <Card className="bg-white print:shadow-none print:border-0">
                <CardContent className="p-6 md:p-10">
                  {isEditing ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-[700px] rounded-md border border-input bg-background p-4 text-sm font-mono resize-none leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:text-muted-foreground"
                      placeholder={t.refineReport}
                    />
                  ) : (
                    <div className="prose prose-lg">
                      <Markdown
                        components={{
                          img: ({ ...props }) => (
                            <img {...props} crossOrigin="anonymous" className="rounded-lg border border-border my-6" />
                          ),
                        }}
                      >
                        {editedContent}
                      </Markdown>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Evidence sidebar — right 4 cols */}
            <div className="lg:col-span-4 space-y-4 print:hidden">
              <div className="sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4.5 w-4.5 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">{t.siteEvidence}</h2>
                  <Badge variant="secondary" className="text-xs">{report?.images.length}</Badge>
                </div>

                <div className="space-y-3">
                  {report?.images.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                    >
                      <Card className="bg-white overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img
                            src={img.url}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className="text-[10px] font-mono bg-foreground/80 hover:bg-foreground/80 text-background border-0 px-1.5 py-0.5">
                              IMG_{index + 1}
                            </Badge>
                          </div>
                        </div>
                        {img.note && (
                          <CardContent className="p-3">
                            <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{t.note}</p>
                            <p className="text-xs text-foreground leading-relaxed italic">"{img.note}"</p>
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating save bar ────────────────────────────────────────── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] print:hidden"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-muted-foreground">
                {t.discard}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? t.saving : t.saveChanges}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
