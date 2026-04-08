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
  Folder,
  ArrowLeft,
  Camera,
  X,
  Sparkles,
  FileText,
  Save,
  Loader2,
  Calendar,
  ImageIcon
} from "lucide-react";
import { generateSiteReport } from "../services/gemini";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const MAX_IMAGES = 7;

const translations = {
  en: {
    backToProject: "Back to Project",
    createReport: "CREATE REPORT.",
    reportTitle: "Report Title",
    reportDate: "Date",
    addImages: "Add Images",
    selectImages: "Select Images",
    imageNote: "Add a note for this image...",
    generateReport: "Generate AI Report",
    generating: "Generating...",
    saveReport: "Save Report",
    saving: "Saving...",
    generatedPreview: "Generated Report Preview",
    noImages: "Add some images to generate a report.",
    fillRequired: "Please answer all required fields.",
    maxImagesReached: "Maximum limit of {{max}} images reached.",
    trialEnded: "TRIAL ENDED.",
    trialDesc: "You have reached the limit of 4 AI-generated reports. Please share your feedback to help us improve.",
    trialUsed: "Trial Reports Used",
    allUsed: "All trial reports used",
    reportsLeft: "reports left",
    reportsUsed: "reports used",
    trialLeft: "left",
    feedbackHelpful: "Was the tool helpful in generating reports?",
    feedbackFeatures: "Is there any feature you will like us to add?",
    feedbackCustom: "Would you like your own personal tool that does this for your company?",
    feedbackPay: "Would you be willing to pay for this?",
    yes: "Yes",
    no: "No",
    maybe: "Maybe",
    submitFeedback: "Submit Feedback",
    submitting: "Submitting...",
    thankYou: "Thank you for your feedback!",
    thankYouDesc: "We will use your input to build a better tool for you.",
  },
  jp: {
    backToProject: "プロジェクトに戻る",
    createReport: "レポートを作成",
    reportTitle: "レポートのタイトル",
    reportDate: "日付",
    addImages: "画像を追加",
    selectImages: "画像を選択",
    imageNote: "この画像のメモをここに追加...",
    generateReport: "AIレポートを生成",
    generating: "生成中...",
    saveReport: "レポートを保存",
    saving: "保存中...",
    generatedPreview: "生成されたレポートのプレビュー",
    noImages: "レポートを生成するには画像を追加してください。",
    fillRequired: "必須項目をすべて入力してください。",
    maxImagesReached: "最大{{max}}枚の画像制限に達しました。",
    trialEnded: "トライアル終了",
    trialDesc: "AIレポート生成の制限（4回）に達しました。改善のためのフィードバックをお願いします。",
    trialUsed: "使用済みトライアル数",
    allUsed: "トライアル分をすべて使用しました",
    reportsLeft: "回分の残り",
    reportsUsed: "回使用済み",
    trialLeft: "残り",
    feedbackHelpful: "レポート作成においてこのツールは役に立ちましたか？",
    feedbackFeatures: "追加してほしい機能はありますか？",
    feedbackCustom: "自社専用のカスタムツールとして利用したいと思いますか？",
    feedbackPay: "このツールに費用を支払う用意はありますか？",
    yes: "はい",
    no: "いいえ",
    maybe: "検討中",
    submitFeedback: "フィードバックを送信",
    submitting: "送信中...",
    thankYou: "フィードバックありがとうございます！",
    thankYouDesc: "頂いた内容は今後の開発の参考にさせていただきます。",
  },
};

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

  // Pre-fill title from settings when they load
  useEffect(() => {
    if (settings?.defaultReportTitle && !title) {
      setTitle(settings.defaultReportTitle);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // Feedback state
  const [feedback, setFeedback] = useState({
    helpful: "",
    features: "",
    customTool: "",
    willingToPay: "",
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Double Safety: Check both persistent usage AND existing reports list
  const isTrialEnded = userUsage && userReports ? Math.max(userUsage.count, userReports.length) >= limit : false;
  
  if (!user) {
    navigate(`/${lang}/dashboard`);
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentCount = images.length;
    const incomingFiles = Array.from(files);
    const availableSlots = MAX_IMAGES - currentCount;

    if (availableSlots <= 0) {
      toast.error(t.maxImagesReached.replace("{{max}}", MAX_IMAGES.toString()));
      return;
    }

    if (incomingFiles.length > availableSlots) {
      toast.error(t.maxImagesReached.replace("{{max}}", MAX_IMAGES.toString()));
    }

    incomingFiles.slice(0, availableSlots).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setImages((prev) => [
          ...prev,
          {
            url: "", 
            path: "", 
            localData: base64Data, 
            note: ""
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNoteChange = (index: number, note: string) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index].note = note;
      return newImages;
    });
  };

  const handleGenerate = async () => {
    if (!project || !title || images.length === 0) {
      toast.error(t.fillRequired);
      return;
    }

    if (isTrialEnded) {
      toast.error(lang === 'jp' ? "トライアル制限に達しました" : "Trial limit reached");
      return;
    }

    setIsGenerating(true);
    try {
      const text = await generateSiteReport(
        project.name,
        title,
        date,
        settings?.engineerName || user?.displayName || "Site Engineer",
        images,
        lang
      );
      setGeneratedReport(text);
      
      // Increment persistently and wait for it
      if (user?.uid) {
        try {
          await incrementUsage(user.uid);
        } catch (incrementErr) {
          console.error("Failed to increment usage:", incrementErr);
         
        }
      }

      toast.success(lang === 'jp' ? "完了しました" : "Generation successful");
    } catch (err) {
      console.error(err);
      toast.error(lang === 'jp' ? "AIによる生成が失敗しました" : "AI Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title || !date || (!generatedReport && images.length === 0)) {
      toast.error(t.fillRequired);
      return;
    }

    setIsSavingInProgress(true);
    try {
      // 1. Upload local images to Storage in PARALLEL
      const uploadPromises = images.map(async (img) => {
        if (img.localData) {
          const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const storagePath = `reports/${user.uid}/${projectId}/${fileId}`;
          const storageRef = ref(storage, storagePath);

          // Upload Base64 dataURL
          await uploadString(storageRef, img.localData, 'data_url');
          const downloadUrl = await getDownloadURL(storageRef);

          return {
            url: downloadUrl,
            path: storagePath,
            note: img.note
          };
        }
        return img; 
      });

      const uploadedImages = await Promise.all(uploadPromises);

      
      createReport({
        projectId: projectId!,
        ownerId: user.uid,
        title,
        date,
        images: uploadedImages,
        generatedReport
      }, {
        onSuccess: (newReportId: string) => {
           navigate(`/${lang}/report/${newReportId}`);
        },
        onError: () => {
          setIsSavingInProgress(false);
        }
      });

    } catch (error) {
      console.error("Save error:", error);
      toast.error(lang === 'jp' ? "保存に失敗しました" : "Failed to save");
      setIsSavingInProgress(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      toast.error(lang === 'jp' ? "ログインが必要です" : "User session expired. Please log in again.");
      return;
    }

    console.log("Submitting feedback for user:", user.uid);
    setIsSubmittingFeedback(true);
    try {
      await feedbackAPI.submitFeedback({
        userId: user.uid,
        ...feedback,
        lang
      });
      setFeedbackSubmitted(true);
      toast.success(t.thankYou);
    } catch (err) {
      console.error(err);
      toast.error(lang === 'jp' ? "送信に失敗しました" : "Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Only block the whole page with feedback if trial ended AND no report was generated yet
  if (isTrialEnded && !feedbackSubmitted && !generatedReport) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link
            to={`/${lang}/project/${projectId}`}
            className="inline-flex items-center gap-2 text-ink/60 hover:text-ink transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            {t.backToProject}
          </Link>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter mb-4">
              {t.trialEnded}
            </h1>
            <p className="text-ink/60 text-lg max-w-2xl">
              {t.trialDesc}
            </p>
          </header>

          <form onSubmit={handleSubmitFeedback} className="space-y-12 bg-paper p-8 md:p-12 border border-line">
            {/* Question 1 */}
            <div className="space-y-4">
              <label className="block font-bold text-lg">{t.feedbackHelpful}</label>
              <div className="flex gap-6">
                {["yes", "no", "maybe"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="helpful"
                      required
                      value={opt}
                      checked={feedback.helpful === opt}
                      onChange={(e) => setFeedback({ ...feedback, helpful: e.target.value })}
                      className="accent-ink w-4 h-4"
                    />
                    <span className="group-hover:text-ink transition-colors">{t[opt as keyof typeof t]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-4">
              <label className="block font-bold text-lg">{t.feedbackFeatures}</label>
              <textarea
                required
                className="w-full bg-white border border-line p-4 focus:border-ink outline-none transition-colors min-h-[120px] resize-none"
                value={feedback.features}
                onChange={(e) => setFeedback({ ...feedback, features: e.target.value })}
                placeholder="..."
              />
            </div>

            {/* Question 3 */}
            <div className="space-y-4">
              <label className="block font-bold text-lg">{t.feedbackCustom}</label>
              <div className="flex gap-6">
                {["yes", "no", "maybe"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="customTool"
                      required
                      value={opt}
                      checked={feedback.customTool === opt}
                      onChange={(e) => setFeedback({ ...feedback, customTool: e.target.value })}
                      className="accent-ink w-4 h-4"
                    />
                    <span className="group-hover:text-ink transition-colors">{t[opt as keyof typeof t]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 4 */}
            <div className="space-y-4">
              <label className="block font-bold text-lg">{t.feedbackPay}</label>
              <div className="flex gap-6">
                {["yes", "no", "maybe"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="willingToPay"
                      required
                      value={opt}
                      checked={feedback.willingToPay === opt}
                      onChange={(e) => setFeedback({ ...feedback, willingToPay: e.target.value })}
                      className="accent-ink w-4 h-4"
                    />
                    <span className="group-hover:text-ink transition-colors">{t[opt as keyof typeof t]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={isSubmittingFeedback}
                className="bg-ink text-white px-10 py-4 font-bold tracking-widest uppercase hover:bg-ink/90 transition-colors flex items-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50"
              >
                {isSubmittingFeedback ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {isSubmittingFeedback ? t.submitting : t.submitFeedback}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (feedbackSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full border border-ink p-12 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="h-20 w-20 bg-ink text-white rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">{t.thankYou}</h2>
          <p className="text-ink/60 mb-10 leading-relaxed">
            {t.thankYouDesc}
          </p>
          <Link
            to={`/${lang}/dashboard`}
            className="inline-block bg-ink text-white px-8 py-3 font-bold uppercase tracking-widest text-sm hover:translate-y-[-2px] transition-all"
          >
            {t.backToProject}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        <Link
          to={`/${lang}/project/${projectId}`}
          className="inline-flex items-center gap-2 text-ink/60 hover:text-ink transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          {t.backToProject}
        </Link>
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter mb-4">
            {t.createReport}
          </h1>
          <div className="flex items-center gap-4 mb-4">
            {project && (
              <div className="inline-flex items-center gap-2 bg-ink text-white px-4 py-2 text-sm font-bold tracking-widest uppercase">
                <Folder className="h-4 w-4" />
                {project.name}
              </div>
            )}
          </div>
          {/* Trial Status Badge */}
          <div className="mt-6 flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 border ${(userUsage?.count ?? 0) >= limit ? 'border-red-500 bg-red-50 text-red-700' : 'border-ink bg-ink/5 text-ink'} text-xs font-bold uppercase tracking-widest`}>
              <Sparkles className={`h-3.5 w-3.5 ${(userUsage?.count ?? 0) >= limit ? 'text-red-600' : ''}`} />
              <span>
                {(userUsage?.count ?? 0) >= limit 
                  ? t.allUsed 
                  : `${limit - (userUsage?.count ?? 0)} ${t.reportsLeft}`
                }
              </span>
            </div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-tighter opacity-40">
              {userUsage?.count ?? 0} / {limit} {t.reportsUsed}
            </div>
          </div>
        </header>

        <div className="space-y-12">
          {/* Metadata Section */}
          <section className="space-y-6 bg-paper p-8 border border-line">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t.reportTitle}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-line p-4 focus:border-ink outline-none transition-colors"
                  placeholder="e.g. Daily Progress Report"
                />
              </div>

              <div>
                <label className="block text-sm font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t.reportDate}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-line p-4 focus:border-ink outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Media Section */}
          <section className="bg-paper p-8 border border-line">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {t.addImages}
                <span className={`text-sm font-sans font-medium ml-2 ${images.length >= MAX_IMAGES ? 'text-red-500' : 'text-ink/40'}`}>
                  ({images.length} / {MAX_IMAGES})
                </span>
              </h2>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/jpeg, image/png, image/webp"
                  multiple
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= MAX_IMAGES}
                  className="bg-ink text-white px-6 py-3 font-bold hover:bg-ink/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-4 w-4" />
                  {t.selectImages}
                </button>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="border-2 border-dashed border-line p-12 text-center">
                <Camera className="h-12 w-12 text-line mx-auto mb-4" />
                <p className="text-ink/40 font-medium">{t.noImages}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {images.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative bg-white border border-line flex flex-col"
                    >
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-white text-ink p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-line hover:bg-ink hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="aspect-square relative flex-shrink-0">
                        <img
                          src={img.localData || img.url}
                          alt="Upload"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <textarea
                          placeholder={t.imageNote}
                          value={img.note || ""}
                          onChange={(e) => handleNoteChange(index, e.target.value)}
                          className="w-full text-sm bg-transparent outline-none resize-none flex-grow min-h-[60px]"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* AI Generation Trigger */}
          <div className="flex justify-center">
             <button
                onClick={handleGenerate}
                disabled={images.length === 0 || isGenerating}
                className="bg-ink text-white px-8 py-5 font-bold tracking-widest uppercase hover:bg-ink/90 transition-colors flex items-center gap-3 disabled:opacity-50"
             >
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {isGenerating ? t.generating : t.generateReport}
             </button>
          </div>

          {/* AI Generated Content Preview */}
          <AnimatePresence>
             {generatedReport && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-white border border-line p-8"
                >
                  <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2 border-b border-line pb-4">
                     <FileText className="h-5 w-5" />
                     {t.generatedPreview}
                  </h2>
                  <div className="prose prose-sm max-w-none text-ink/80 prose-headings:font-display">
                     <ReactMarkdown>{generatedReport}</ReactMarkdown>
                  </div>
                </motion.section>
             )}
          </AnimatePresence>

          {/* Trial ended banner — save report before feedback */}
          {isTrialEnded && generatedReport && !feedbackSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-red-500 bg-red-50 p-6"
            >
              <p className="font-bold text-red-700 mb-1">
                {lang === 'jp' ? '⚠ トライアル上限に達しました' : '⚠ Trial limit reached'}
              </p>
              <p className="text-sm text-red-600 mb-4">
                {lang === 'jp'
                  ? 'このレポートを保存してから、フィードバックをお送りください。'
                  : 'Save this report below before it is lost, then share your feedback.'}
              </p>
              <button
                onClick={handleSave}
                disabled={isSavingInProgress}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSavingInProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSavingInProgress ? t.saving : t.saveReport}
              </button>
            </motion.div>
          )}

          {/* Inline feedback form when trial ended after generating a report */}
          {isTrialEnded && generatedReport && !feedbackSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <form onSubmit={handleSubmitFeedback} className="space-y-10 bg-paper p-8 md:p-12 border border-line">
                <div>
                  <h3 className="text-2xl font-display font-bold mb-2">{t.trialEnded}</h3>
                  <p className="text-ink/60">{t.trialDesc}</p>
                </div>
                <div className="space-y-4">
                  <label className="block font-bold text-lg">{t.feedbackHelpful}</label>
                  <div className="flex gap-6">
                    {["yes", "no", "maybe"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="helpful" required value={opt}
                          checked={feedback.helpful === opt}
                          onChange={(e) => setFeedback({ ...feedback, helpful: e.target.value })}
                          className="accent-ink w-4 h-4" />
                        <span className="group-hover:text-ink transition-colors">{t[opt as keyof typeof t]}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block font-bold text-lg">{t.feedbackFeatures}</label>
                  <textarea required
                    className="w-full bg-white border border-line p-4 focus:border-ink outline-none transition-colors min-h-[100px] resize-none"
                    value={feedback.features}
                    onChange={(e) => setFeedback({ ...feedback, features: e.target.value })}
                    placeholder="..." />
                </div>
                <div className="space-y-4">
                  <label className="block font-bold text-lg">{t.feedbackCustom}</label>
                  <div className="flex gap-6">
                    {["yes", "no", "maybe"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="customTool" required value={opt}
                          checked={feedback.customTool === opt}
                          onChange={(e) => setFeedback({ ...feedback, customTool: e.target.value })}
                          className="accent-ink w-4 h-4" />
                        <span className="group-hover:text-ink transition-colors">{t[opt as keyof typeof t]}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block font-bold text-lg">{t.feedbackPay}</label>
                  <div className="flex gap-6">
                    {["yes", "no", "maybe"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="willingToPay" required value={opt}
                          checked={feedback.willingToPay === opt}
                          onChange={(e) => setFeedback({ ...feedback, willingToPay: e.target.value })}
                          className="accent-ink w-4 h-4" />
                        <span className="group-hover:text-ink transition-colors">{t[opt as keyof typeof t]}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={isSubmittingFeedback}
                  className="bg-ink text-white px-10 py-4 font-bold tracking-widest uppercase hover:bg-ink/90 transition-colors flex items-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50">
                  {isSubmittingFeedback ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {isSubmittingFeedback ? t.submitting : t.submitFeedback}
                </button>
              </form>
            </motion.div>
          )}

          {/* Action Row */}
          <div className="flex justify-end pt-8 border-t border-line mt-12 gap-4">
             <button
                onClick={handleSave}
                disabled={isSavingInProgress || (images.length === 0 && !generatedReport)}
                className="bg-ink text-white px-8 py-4 font-bold tracking-widest uppercase hover:bg-ink/90 transition-colors flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 disabled:shadow-none disabled:transform-none"
             >
                {isSavingInProgress ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {isSavingInProgress ? t.saving : t.saveReport}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
