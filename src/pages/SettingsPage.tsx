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
  User, FileText, Trash2, LogOut, Save, Loader2,
  Sparkles, HardHat, Folder, Shield,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

const translations = {
  en: {
    settings: 'Settings',
    subtitle: 'Manage your profile, report defaults, and account.',
    profile: 'Profile',
    profileDesc: 'Your personal information used in reports.',
    reportDefaults: 'Report defaults',
    reportDefaultsDesc: 'Pre-fill values used when generating new reports.',
    account: 'Account',
    accountDesc: 'Manage your session and account data.',
    displayName: 'Display name',
    displayNamePlaceholder: 'e.g. John Smith',
    jobTitle: 'Job title',
    jobTitlePlaceholder: 'e.g. Site Engineer',
    companyName: 'Company name',
    companyNamePlaceholder: 'e.g. BuildCorp Ltd.',
    engineerName: 'Engineer name (in reports)',
    engineerNamePlaceholder: 'Name shown as "Site Engineer" in report header',
    engineerHint: 'Appears in the header of every AI-generated report.',
    defaultReportTitle: 'Default report title',
    defaultReportTitlePlaceholder: 'e.g. Daily Site Report',
    usageTitle: 'AI report usage',
    totalProjects: 'Total projects',
    totalReports: 'Total reports',
    signOut: 'Sign out',
    signingOut: 'Signing out…',
    deleteAccount: 'Delete account',
    deleteConfirm: 'Are you sure? This cannot be undone. All your projects and reports will be permanently deleted.',
    saveChanges: 'Save changes',
    saving: 'Saving…',
    signedInAs: 'Signed in as',
    dangerZone: 'Danger zone',
    dangerZoneDesc: 'Irreversible and destructive actions.',
    reportsUsed: 'reports used',
    of: 'of',
    limit: 'limit',
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
    engineerHint: 'AIが生成するすべてのレポートのヘッダーに表示されます。',
    defaultReportTitle: 'デフォルトのレポートタイトル',
    defaultReportTitlePlaceholder: '例：日次現場報告',
    usageTitle: 'AIレポート使用状況',
    totalProjects: 'プロジェクト総数',
    totalReports: 'レポート総数',
    signOut: 'サインアウト',
    signingOut: 'サインアウト中…',
    deleteAccount: 'アカウントを削除',
    deleteConfirm: '本当によろしいですか？この操作は取り消せません。すべてのプロジェクトとレポートが完全に削除されます。',
    saveChanges: '変更を保存',
    saving: '保存中…',
    signedInAs: 'ログイン中',
    dangerZone: '危険な操作',
    dangerZoneDesc: '元に戻せない破壊的な操作です。',
    reportsUsed: 'レポート使用',
    of: '/',
    limit: '上限',
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
  const isLimitReached = usageCount >= limit;

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [defaultReportTitle, setDefaultReportTitle] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    saveSettings({ displayName, jobTitle, companyName, engineerName, defaultReportTitle });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try { await signOut(auth); }
    catch { toast.error('Failed to sign out'); setIsSigningOut(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t.deleteConfirm)) return;
    if (!user) return;
    try { await deleteUser(user); toast.success('Account deleted.'); }
    catch { toast.error(lang === 'jp' ? '再ログインが必要です' : 'Please sign in again before deleting.'); }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t.settings}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="space-y-5">

          {/* ── Profile ──────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <User className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t.profile}</CardTitle>
                    <CardDescription className="text-xs">{t.profileDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t.displayName}</label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t.displayNamePlaceholder} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t.jobTitle}</label>
                    <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder={t.jobTitlePlaceholder} />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-sm font-medium">{t.companyName}</label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t.companyNamePlaceholder} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Report Defaults ──────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t.reportDefaults}</CardTitle>
                    <CardDescription className="text-xs">{t.reportDefaultsDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <HardHat className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.engineerName}
                  </label>
                  <Input value={engineerName} onChange={(e) => setEngineerName(e.target.value)} placeholder={t.engineerNamePlaceholder} />
                  <p className="text-xs text-muted-foreground">{t.engineerHint}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.defaultReportTitle}
                  </label>
                  <Input value={defaultReportTitle} onChange={(e) => setDefaultReportTitle(e.target.value)} placeholder={t.defaultReportTitlePlaceholder} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Save button ──────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? t.saving : t.saveChanges}
            </Button>
          </motion.div>

          {/* ── Account ──────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Sparkles className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t.account}</CardTitle>
                    <CardDescription className="text-xs">{t.accountDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-5">

                {/* Usage stats */}
                <div>
                  <p className="text-sm font-medium mb-3">{t.usageTitle}</p>
                  {isUsageLoading ? (
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="border-border">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-1">AI {t.reportsUsed}</p>
                          <p className="text-2xl font-bold">{usageCount}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={usageCount} max={limit} className={`flex-1 h-1.5 ${isLimitReached ? '[&>div]:bg-destructive' : ''}`} />
                            <span className="text-xs text-muted-foreground">{t.of} {limit}</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-border">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-1">{t.totalProjects}</p>
                          <p className="text-2xl font-bold">{isProjectsLoading ? '…' : (projects?.length || 0)}</p>
                          <Folder className="h-4 w-4 text-muted-foreground/40 mt-2" />
                        </CardContent>
                      </Card>
                      <Card className="border-border">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-1">{t.totalReports}</p>
                          <p className="text-2xl font-bold">{isReportsLoading ? '…' : (reports?.length || 0)}</p>
                          <FileText className="h-4 w-4 text-muted-foreground/40 mt-2" />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Signed in as */}
                <div className="rounded-lg bg-muted/60 px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-0.5">{t.signedInAs}</p>
                  <p className="text-sm font-medium text-foreground">{user?.email}</p>
                </div>

                <Separator />

                {/* Danger zone */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-medium text-destructive">{t.dangerZone}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{t.dangerZoneDesc}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut} className="gap-2">
                      {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                      {isSigningOut ? t.signingOut : t.signOut}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDeleteAccount}
                      className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t.deleteAccount}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
