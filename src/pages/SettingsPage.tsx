import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { useSettings, useSaveSettings } from '../hooks/UseSettings';
import { useUserUsage } from '../hooks/UseUsage';
import { useUserReports } from '../hooks/UseReport';
import { useUserProject } from '../hooks/UseProject';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  User, FileText, Trash2,
  LogOut, Save, Loader2, Sparkles, HardHat
} from 'lucide-react';

const translations = {
  en: {
    settings: 'SETTINGS.',
    subtitle: 'Manage your profile, report defaults, and account.',
    // Sections
    profile: 'Profile',
    profileDesc: 'Your personal information used in reports.',
    reportDefaults: 'Report Defaults',
    reportDefaultsDesc: 'Pre-fill values used when generating new reports.',
    account: 'Account',
    accountDesc: 'Manage your session and account data.',
    // Profile fields
    displayName: 'Display Name',
    displayNamePlaceholder: 'e.g. John Smith',
    jobTitle: 'Job Title',
    jobTitlePlaceholder: 'e.g. Site Engineer',
    companyName: 'Company Name',
    companyNamePlaceholder: 'e.g. BuildCorp Ltd.',
    // Report Default fields
    engineerName: 'Engineer Name (in Reports)',
    engineerNamePlaceholder: 'Name shown as "Site Engineer" in report header',
    defaultReportTitle: 'Default Report Title',
    defaultReportTitlePlaceholder: 'e.g. Daily Site Report',
    // Account fields
    usageTitle: 'AI Report Usage',
    usageDesc: 'Your current trial usage.',
    totalProjects: 'Total Projects',
    totalReports: 'Total Reports',
    signOut: 'Sign Out',
    signingOut: 'Signing out...',
    deleteAccount: 'Delete Account',
    deleteConfirm: 'Are you sure? This cannot be undone. All your projects and reports will be permanently deleted.',
    // Actions
    saveChanges: 'Save Changes',
    saving: 'Saving...',
  },
  jp: {
    settings: '設定',
    subtitle: 'プロファイル、レポートのデフォルト設定、アカウントを管理します。',
    profile: 'プロファイル',
    profileDesc: 'レポートに使用される個人情報です。',
    reportDefaults: 'レポートのデフォルト',
    reportDefaultsDesc: '新規レポート生成時に事前入力される値です。',
    account: 'アカウント',
    accountDesc: 'セッションとアカウントデータを管理します。',
    displayName: '表示名',
    displayNamePlaceholder: '例：山田 太郎',
    jobTitle: '役職',
    jobTitlePlaceholder: '例：現場エンジニア',
    companyName: '会社名',
    companyNamePlaceholder: '例：株式会社ビルドコープ',
    engineerName: 'エンジニア名（レポート内）',
    engineerNamePlaceholder: 'レポートヘッダーに表示される名前',
    defaultReportTitle: 'デフォルトのレポートタイトル',
    defaultReportTitlePlaceholder: '例：日次現場報告',
    usageTitle: 'AIレポート使用状況',
    usageDesc: '現在のトライアル使用状況です。',
    totalProjects: 'プロジェクト総数',
    totalReports: 'レポート総数',
    signOut: 'サインアウト',
    signingOut: 'サインアウト中...',
    deleteAccount: 'アカウントを削除',
    deleteConfirm: '本当によろしいですか？この操作は取り消せません。すべてのプロジェクトとレポートが完全に削除されます。',
    saveChanges: '変更を保存',
    saving: '保存中...',
  },
};

export default function SettingsPage() {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const t = translations[lang as keyof typeof translations] || translations.en;
  const [user] = useAuthState(auth);

  const { data: settings } = useSettings(user?.uid);
  const { mutate: saveSettings, isPending: isSaving } = useSaveSettings(user?.uid, lang);
  const { data: userUsage, isLoading: isUsageLoading } = useUserUsage(user?.uid);
  const { data: projects, isLoading: isProjectsLoading } = useUserProject(user?.uid);
  const { data: reports, isLoading: isReportsLoading } = useUserReports(user?.uid);

  const limit = userUsage?.limit || 4;
  const usageCount = userUsage?.count ?? 0;

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [defaultReportTitle, setDefaultReportTitle] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Populate form from saved settings
  useEffect(() => {
    if (settings) {
      setDisplayName(settings.displayName || '');
      setJobTitle(settings.jobTitle || '');
      setCompanyName(settings.companyName || '');
      setEngineerName(settings.engineerName || '');
      setDefaultReportTitle(settings.defaultReportTitle || '');
    } else if (user) {
      setDisplayName(user.displayName || '');
      setEngineerName(user.displayName || '');
    }
  }, [settings, user]);

  const handleSave = () => {
    saveSettings({
      displayName,
      jobTitle,
      companyName,
      engineerName,
      defaultReportTitle,
    });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut(auth);
    } catch {
      toast.error('Failed to sign out');
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t.deleteConfirm)) return;
    if (!user) return;
    try {
      await deleteUser(user);
      toast.success('Account deleted.');
    } catch {
      toast.error(lang === 'jp' ? '再ログインが必要です' : 'Please sign in again before deleting your account.');
    }
  };

  // No blocking loading state — form renders immediately, data populates when ready

  const sectionClass = "bg-white border-2 border-line p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
  const labelClass = "block text-xs font-mono font-bold uppercase tracking-widest mb-2 text-ink/60";
  const inputClass = "w-full px-4 py-3 border border-line focus:border-ink outline-none transition-all font-medium bg-white";

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="text-sm font-mono font-bold uppercase tracking-widest opacity-40 mb-2 block">
            {lang === 'jp' ? 'アカウント' : 'Account'}
          </span>
          <h1 className="text-5xl font-display font-bold tracking-tighter">{t.settings}</h1>
          <p className="text-ink/60 mt-3 text-lg">{t.subtitle}</p>
        </motion.header>

        <div className="space-y-8">

          {/* ── SECTION 1: Profile ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
              <div className="h-10 w-10 bg-ink flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">{t.profile}</h2>
                <p className="text-xs text-ink/40 font-medium">{t.profileDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t.displayName}</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t.displayNamePlaceholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t.jobTitle}</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder={t.jobTitlePlaceholder}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>{t.companyName}</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t.companyNamePlaceholder}
                  className={inputClass}
                />
              </div>
            </div>
          </motion.section>

          {/* ── SECTION 2: Report Defaults ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
              <div className="h-10 w-10 bg-ink flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">{t.reportDefaults}</h2>
                <p className="text-xs text-ink/40 font-medium">{t.reportDefaultsDesc}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <HardHat className="h-3.5 w-3.5" />
                    {t.engineerName}
                  </span>
                </label>
                <input
                  type="text"
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  placeholder={t.engineerNamePlaceholder}
                  className={inputClass}
                />
                <p className="text-[11px] text-ink/40 mt-1.5 font-medium">
                  {lang === 'jp'
                    ? 'AIが生成するすべてのレポートのヘッダーに表示されます。'
                    : 'Appears in the header of every AI-generated report.'}
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {t.defaultReportTitle}
                  </span>
                </label>
                <input
                  type="text"
                  value={defaultReportTitle}
                  onChange={(e) => setDefaultReportTitle(e.target.value)}
                  placeholder={t.defaultReportTitlePlaceholder}
                  className={inputClass}
                />
              </div>
            </div>
          </motion.section>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex justify-end"
          >
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-3 bg-ink text-white px-8 py-4 font-bold tracking-widest uppercase hover:bg-ink/90 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 disabled:shadow-none disabled:transform-none"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {isSaving ? t.saving : t.saveChanges}
            </button>
          </motion.div>

          {/* ── SECTION 3: Account ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
              <div className="h-10 w-10 bg-ink flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">{t.account}</h2>
                <p className="text-xs text-ink/40 font-medium">{t.accountDesc}</p>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="mb-8">
              <p className="text-xs font-mono font-bold uppercase tracking-widest opacity-40 mb-4">{t.usageTitle}</p>
              <div className="grid grid-cols-3 gap-4">
                {/* AI Reports Used */}
                {isUsageLoading ? (
                  <>
                    <div className="border border-line p-4 h-24 animate-pulse bg-line/20" />
                    <div className="border border-line p-4 h-24 animate-pulse bg-line/20" />
                    <div className="border border-line p-4 h-24 animate-pulse bg-line/20" />
                  </>
                ) : (
                  <>
                    <div className="border border-line p-4">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mb-1">
                        {lang === 'jp' ? 'AI使用数' : 'AI Reports Used'}
                      </p>
                      <p className="text-3xl font-display font-bold">{usageCount}</p>
                      <p className="text-[10px] font-mono opacity-40 mt-1">/ {limit} {lang === 'jp' ? '上限' : 'limit'}</p>
                      <div className="mt-3 h-1.5 bg-line">
                        <div
                          className={`h-full transition-all ${usageCount >= limit ? 'bg-red-500' : 'bg-ink'}`}
                          style={{ width: `${Math.min((usageCount / limit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="border border-line p-4">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mb-1">{t.totalProjects}</p>
                      <p className="text-3xl font-display font-bold">{isProjectsLoading ? '...' : (projects?.length || 0)}</p>
                    </div>
                    <div className="border border-line p-4">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mb-1">{t.totalReports}</p>
                      <p className="text-3xl font-display font-bold">{isReportsLoading ? '...' : (reports?.length || 0)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Account Email */}
            <div className="mb-8 p-4 bg-line/10 border border-line">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mb-1">
                {lang === 'jp' ? 'ログイン中のアカウント' : 'Signed in as'}
              </p>
              <p className="font-bold text-sm">{user?.email}</p>
            </div>

            {/* Danger Zone */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex items-center gap-2 px-6 py-3 border-2 border-ink font-bold hover:bg-ink hover:text-white transition-all"
              >
                {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                {isSigningOut ? t.signingOut : t.signOut}
              </button>

              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 px-6 py-3 border-2 border-red-500 text-red-600 font-bold hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 className="h-4 w-4" />
                {t.deleteAccount}
              </button>
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
}
