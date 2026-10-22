import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, storage } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { useProject } from "../hooks/UseProject";
import { useCreateReport, useUserReports } from "../hooks/UseReport";
import { useUserUsage, useIncrementUsage } from "../hooks/UseUsage";
import { useSettings } from "../hooks/UseSettings";
import { feedbackAPI } from "../api/feedback";
import type { SiteImage } from "../types";
import {
  Folder, ArrowLeft, Camera, X, Sparkles, FileText,
  Save, Loader2, Calendar, ImageIcon,
} from "lucide-react";
import { generateSiteReport } from "../services/gemini";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";

const MAX_IMAGES = 7;

const translations = {
  en: {
    backToProject: "Back to project",
    createReport: "Create report",
    createReportDesc: "Upload site photos, add notes, and generate an AI-powered progress report.",
    reportTitle: "Report title",
    reportDate: "Date",
    addImages: "Site images",
    selectImages: "Select images",
    imageNote: "Add a note for this image…",
    generateReport: "Generate AI report",
    generating: "Generating…",
    saveReport: "Save report",
    saving: "Saving…",
    generatedPreview: "Generated report preview",
    noImages: "No images yet",
    noImagesDesc: "Upload site photos to include in your report.",
    fillRequired: "Please fill all required fields.",
    maxImagesReached: "Maximum of {{max}} images reached.",
    trialEnded: "Trial ended",
    trialDesc: "You have reached the limit of 4 AI-generated reports. Please share your feedback to help us improve.",
    trialUsed: "Trial reports used",
    allUsed: "Limit reached",
    reportsLeft: "reports left",
    reportsUsed: "used",
    trialLeft: "left",
    feedbackHelpful: "Was the tool helpful in generating reports?",
    feedbackFeatures: "Is there any feature you would like us to add?",
    feedbackCustom: "Would you like your own personal tool for your company?",
    feedbackPay: "Would you be willing to pay for this?",
    yes: "Yes",
    no: "No",
    maybe: "Maybe",
    submitFeedback: "Submit feedback",
    submitting: "Submitting…",
    thankYou: "Thank you for your feedback!",
    thankYouDesc: "We will use your input to build a better tool for you.",
    trialWarning: "Trial limit reached",
    trialWarningDesc: "Save this report below before it is lost, then share your feedback.",
    of: "of",
  },
  jp: {
    backToProject: "プロジェクトに戻る",
    createReport: "レポートを作成",
    createReportDesc: "現場写真をアップロードし、メモを追加して、AI生成の進捗レポートを作成します。",
    reportTitle: "レポートのタイトル",
    reportDate: "日付",
    addImages: "現場画像",
    selectImages: "画像を選択",
    imageNote: "この画像のメモをここに追加…",
    generateReport: "AIレポートを生成",
    generating: "生成中…",
    saveReport: "レポートを保存",
    saving: "保存中…",
    generatedPreview: "生成されたレポートのプレビュー",
    noImages: "画像がありません",
    noImagesDesc: "レポートに含める現場写真をアップロードしてください。",
    fillRequired: "必須項目をすべて入力してください。",
    maxImagesReached: "最大{{max}}枚の画像制限に達しました。",
    trialEnded: "トライアル終了",
    trialDesc: "AIレポート生成の制限（4回）に達しました。改善のためのフィードバックをお願いします。",
    trialUsed: "使用済みトライアル数",
    allUsed: "制限に達しました",
    reportsLeft: "回分の残り",
    reportsUsed: "使用済み",
    trialLeft: "残り",
    feedbackHelpful: "レポート作成においてこのツールは役に立ちましたか？",
    feedbackFeatures: "追加してほしい機能はありますか？",
    feedbackCustom: "自社専用のカスタムツールとして利用したいですか？",
    feedbackPay: "このツールに費用を支払う用意はありますか？",
    yes: "はい",
    no: "いいえ",
    maybe: "検討中",
    submitFeedback: "フィードバックを送信",
    submitting: "送信中…",
    thankYou: "フィードバックありがとうございます！",
    thankYouDesc: "頂いた内容は今後の開発の参考にさせていただきます。",
    trialWarning: "トライアル上限に達しました",
    trialWarningDesc: "このレポートを保存してから、フィードバックをお送りください。",
    of: "/",
  },
};

// ── Radio Group helper ─────────────────────────────────────────────────────────

function RadioGroup({
  name, value, onChange, options, t,
}: {
  name: string; value: string; onChange: (v: string) => void;
  options: string[]; t: typeof translations.en;
}) {
  return (
    <div className="flex gap-3">
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
            value === opt
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-white text-foreground hover:bg-muted"
          }`}
        >
          <input
            type="radio"
            name={name}
            required
            value={opt}
            checked={value === opt}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          {t[opt as keyof typeof t]}
        </label>
      ))}
    </div>
  );
}

// ── Feedback Form Card ──────────────────────────────────────────────────────────

function FeedbackForm({
  t, feedback, setFeedback, onSubmit, isSubmitting,
}: {
  t: typeof translations.en;
  feedback: { helpful: string; features: string; customTool: string; willingToPay: string };
  setFeedback: (f: typeof feedback) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg">{t.trialEnded}</CardTitle>
        <CardDescription>{t.trialDesc}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6 pt-0">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.feedbackHelpful}</label>
            <RadioGroup name="helpful" value={feedback.helpful} onChange={(v) => setFeedback({ ...feedback, helpful: v })} options={["yes", "no", "maybe"]} t={t} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.feedbackFeatures}</label>
            <textarea
              required value={feedback.features}
              onChange={(e) => setFeedback({ ...feedback, features: e.target.value })}
              placeholder="…"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.feedbackCustom}</label>
            <RadioGroup name="customTool" value={feedback.customTool} onChange={(v) => setFeedback({ ...feedback, customTool: v })} options={["yes", "no", "maybe"]} t={t} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.feedbackPay}</label>
            <RadioGroup name="willingToPay" value={feedback.willingToPay} onChange={(v) => setFeedback({ ...feedback, willingToPay: v })} options={["yes", "no", "maybe"]} t={t} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? t.submitting : t.submitFeedback}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────────

export default function CreateReportPage() {
  const { lang = "en", projectId } = useParams<{ lang: string; projectId: string }>();
  const t = translations[lang as keyof typeof translations] || translations.en;

  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: project } = useProject(projectId);
  const { data: userReports } = useUserReports(user?.uid);
  const { data: userUsage } = useUserUsage(user?.uid);
  const { data: settings } = useSettings(user?.uid);
  const limit = userUsage?.limit || 4;
  const { mutate: createReport } = useCreateReport(projectId, lang);
  const { mutateAsync: incrementUsage } = useIncrementUsage();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);
  const [images, setImages] = useState<SiteImage[]>([]);
  const [generatedReport, setGeneratedReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (settings?.defaultReportTitle && !title) setTitle(settings.defaultReportTitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const [feedback, setFeedback] = useState({ helpful: "", features: "", customTool: "", willingToPay: "" });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const usageCount = userUsage?.count ?? 0;
  const isTrialEnded = userUsage && userReports ? Math.max(usageCount, userReports.length) >= limit : false;

  if (!user) { navigate(`/${lang}/dashboard`); return null; }

  // ── handlers ──────────────────────────────────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const available = MAX_IMAGES - images.length;
    if (available <= 0) { toast.error(t.maxImagesReached.replace("{{max}}", String(MAX_IMAGES))); return; }
    const incoming = Array.from(files);
    if (incoming.length > available) toast.error(t.maxImagesReached.replace("{{max}}", String(MAX_IMAGES)));
    incoming.slice(0, available).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImages((prev) => [...prev, { url: "", path: "", localData: reader.result as string, note: "" }]);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));
  const handleNoteChange = (index: number, note: string) => setImages((prev) => { const n = [...prev]; n[index].note = note; return n; });

  const handleGenerate = async () => {
    if (!project || !title || images.length === 0) { toast.error(t.fillRequired); return; }
    if (isTrialEnded) { toast.error(lang === "jp" ? "トライアル制限に達しました" : "Trial limit reached"); return; }
    setIsGenerating(true);
    try {
      const text = await generateSiteReport(project.name, title, date, settings?.engineerName || user?.displayName || "Site Engineer", images, lang);
      setGeneratedReport(text);
      if (user?.uid) { try { await incrementUsage(user.uid); } catch (e) { console.error(e); } }
      toast.success(lang === "jp" ? "完了しました" : "Generation successful");
    } catch (err) { console.error(err); toast.error(lang === "jp" ? "AIによる生成が失敗しました" : "AI generation failed"); }
    finally { setIsGenerating(false); }
  };

  const handleSave = async () => {
    if (!title || !date || (!generatedReport && images.length === 0)) { toast.error(t.fillRequired); return; }
    setIsSavingInProgress(true);
    try {
      const uploadedImages = await Promise.all(images.map(async (img) => {
        if (img.localData) {
          const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const storagePath = `reports/${user.uid}/${projectId}/${fileId}`;
          const storageRef = ref(storage, storagePath);
          await uploadString(storageRef, img.localData, "data_url");
          const downloadUrl = await getDownloadURL(storageRef);
          return { url: downloadUrl, path: storagePath, note: img.note };
        }
        return img;
      }));
      createReport({ projectId: projectId!, ownerId: user.uid, title, date, images: uploadedImages, generatedReport }, {
        onSuccess: (newReportId: string) => navigate(`/${lang}/report/${newReportId}`),
        onError: () => setIsSavingInProgress(false),
      });
    } catch (error) { console.error(error); toast.error(lang === "jp" ? "保存に失敗しました" : "Failed to save"); setIsSavingInProgress(false); }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) { toast.error(lang === "jp" ? "ログインが必要です" : "Please log in again."); return; }
    setIsSubmittingFeedback(true);
    try { await feedbackAPI.submitFeedback({ userId: user.uid, ...feedback, lang }); setFeedbackSubmitted(true); toast.success(t.thankYou); }
    catch (err) { console.error(err); toast.error(lang === "jp" ? "送信に失敗しました" : "Failed to submit feedback"); }
    finally { setIsSubmittingFeedback(false); }
  };

  // ── Trial ended (full-page feedback) ──────────────────────────────────

  if (isTrialEnded && !feedbackSubmitted && !generatedReport) {
    return (
      <div className="min-h-screen bg-[#f5f5f4]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground gap-1.5 mb-6 -ml-2 h-8">
            <Link to={`/${lang}/project/${projectId}`}><ArrowLeft className="h-3.5 w-3.5" />{t.backToProject}</Link>
          </Button>
          <FeedbackForm t={t} feedback={feedback} setFeedback={setFeedback} onSubmit={handleSubmitFeedback} isSubmitting={isSubmittingFeedback} />
        </div>
      </div>
    );
  }

  // ── Feedback submitted thank-you ──────────────────────────────────────

  if (feedbackSubmitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f4] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-white max-w-md w-full text-center shadow-lg">
            <CardContent className="p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto mb-6">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t.thankYou}</h2>
              <p className="text-sm text-muted-foreground mb-8">{t.thankYouDesc}</p>
              <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
                <Link to={`/${lang}/dashboard`}>{t.backToProject}</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Main create report form ───────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f5f5f4] pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Back link */}
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground gap-1.5 mb-6 -ml-2 h-8">
          <Link to={`/${lang}/project/${projectId}`}><ArrowLeft className="h-3.5 w-3.5" />{t.backToProject}</Link>
        </Button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t.createReport}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.createReportDesc}</p>
          {project && (
            <Badge variant="secondary" className="mt-3 gap-1.5 text-xs font-normal">
              <Folder className="h-3 w-3" />
              {project.name}
            </Badge>
          )}
        </div>

        {/* Usage bar */}
        <Card className="bg-white mb-6">
          <CardContent className="px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 shrink-0">
                <Sparkles className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="text-sm font-medium">AI</span>
              </div>
              <div className="flex-1 min-w-0">
                <Progress value={usageCount} max={limit} className={`h-2 ${isTrialEnded ? '[&>div]:bg-destructive' : '[&>div]:bg-foreground'}`} />
              </div>
              <span className="text-sm text-muted-foreground shrink-0">
                {usageCount} {t.of} {limit} {t.reportsUsed}
              </span>
              {isTrialEnded ? (
                <Badge className="shrink-0 bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">{t.allUsed}</Badge>
              ) : (
                <Badge variant="secondary" className="shrink-0">{limit - usageCount} {t.reportsLeft}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">

          {/* ── Metadata ───────────────────────────────────────────── */}
          <Card className="bg-white">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.reportTitle}
                  </label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Daily Progress Report" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.reportDate}
                  </label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Images ─────────────────────────────────────────────── */}
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{t.addImages}</CardTitle>
                  <Badge variant={images.length >= MAX_IMAGES ? "destructive" : "secondary"} className="text-xs">
                    {images.length}/{MAX_IMAGES}
                  </Badge>
                </div>
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/jpeg, image/png, image/webp" multiple />
                  <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={images.length >= MAX_IMAGES} className="gap-1.5 bg-foreground text-background hover:bg-foreground/90">
                    <Camera className="h-3.5 w-3.5" />
                    {t.selectImages}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center rounded-lg border border-dashed border-border">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{t.noImages}</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">{t.noImagesDesc}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence>
                    {images.map((img, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card className="overflow-hidden group relative">
                          {/* Remove button */}
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 z-10 h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          {/* Badge */}
                          <div className="absolute top-2 left-2 z-10">
                            <Badge className="text-[10px] font-mono bg-foreground/80 hover:bg-foreground/80 text-background border-0 px-1.5 py-0.5">
                              IMG_{index + 1}
                            </Badge>
                          </div>
                          {/* Image */}
                          <div className="aspect-square overflow-hidden bg-muted">
                            <img src={img.localData || img.url} alt="Upload" className="w-full h-full object-cover" />
                          </div>
                          {/* Note */}
                          <CardContent className="p-3">
                            <textarea
                              placeholder={t.imageNote}
                              value={img.note || ""}
                              onChange={(e) => handleNoteChange(index, e.target.value)}
                              className="w-full text-xs bg-transparent outline-none resize-none min-h-[50px] placeholder:text-muted-foreground"
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Generate button ─────────────────────────────────────── */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={images.length === 0 || isGenerating || isTrialEnded}
              className="gap-2.5 bg-foreground text-background hover:bg-foreground/90 px-8"
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {isGenerating ? t.generating : t.generateReport}
            </Button>
          </div>

          {/* ── Generated preview ───────────────────────────────────── */}
          <AnimatePresence>
            {generatedReport && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-muted-foreground" />
                      <CardTitle className="text-base">{t.generatedPreview}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Separator className="mb-5" />
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{generatedReport}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Trial warning + inline feedback ─────────────────────── */}
          {isTrialEnded && generatedReport && !feedbackSubmitted && (
            <>
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-5">
                  <p className="font-semibold text-destructive text-sm mb-1">⚠ {t.trialWarning}</p>
                  <p className="text-xs text-muted-foreground mb-4">{t.trialWarningDesc}</p>
                  <Button size="sm" onClick={handleSave} disabled={isSavingInProgress} className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    {isSavingInProgress ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {isSavingInProgress ? t.saving : t.saveReport}
                  </Button>
                </CardContent>
              </Card>
              <FeedbackForm t={t} feedback={feedback} setFeedback={setFeedback} onSubmit={handleSubmitFeedback} isSubmitting={isSubmittingFeedback} />
            </>
          )}

          {/* ── Save action ─────────────────────────────────────────── */}
          <Separator />
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSavingInProgress || (images.length === 0 && !generatedReport)}
              className="gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              {isSavingInProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSavingInProgress ? t.saving : t.saveReport}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
