import {Link, useLocation, useParams,  useNavigate} from 'react-router-dom'
import { motion } from 'framer-motion'
import { HardHat, LogIn, ShieldCheck, ArrowRight } from 'lucide-react';
import { useGoggleSignIn } from '../hooks/UseAuth';
// import { useState } from 'react';



const translations = {
    
  en: {
    accessPlatform: "ACCESS THE",
    platformItalic: "PLATFORM.",
    standard:
      "The professional standard for site documentation and AI-powered progress analysis.",
    encrypted: "Encrypted Data Storage",
    enterprise: "Enterprise-grade Security",
    realtime: "Real-time Sync",
    welcomeBack: "WELCOME BACK",
    authRequired: "Authentication required to access your projects.",
    authenticating: "AUTHENTICATING...",
    continueWithGoogle: "CONTINUE WITH GOOGLE",
    secureAuth: "Secure Authentication",
    secureAuthDesc:
      "We use Google's secure OAuth 2.0 protocol. Your credentials are never stored on our servers.",
    agreeTerms: "By continuing, you agree to our",
    terms: "Terms of Service",
    and: "and",
    privacy: "Privacy Policy",
    agreeTermsSuffix: "",
    returnHome: "Return to Home",
  },
  jp: {
    accessPlatform: "プラットフォームに",
    platformItalic: "アクセス。",
    standard: "現場ドキュメントとAI進捗分析のプロフェッショナルスタンダード。",
    encrypted: "暗号化されたデータストレージ",
    enterprise: "エンタープライズ級のセキュリティ",
    realtime: "リアルタイム同期",
    welcomeBack: "おかえりなさい",
    authRequired: "プロジェクトにアクセスするには認証が必要です。",
    authenticating: "認証中...",
    continueWithGoogle: "Googleで続行",
    secureAuth: "安全な認証",
    secureAuthDesc:
      "Googleの安全なOAuth 2.0プロトコルを使用しています。資格情報が当社のサーバーに保存されることはありません。",
    agreeTerms: "続行することで、当社の",
    terms: "利用規約",
    and: "および",
    privacy: "プライバシーポリシー",
    agreeTermsSuffix: "に同意したことになります。",
    returnHome: "ホームに戻る",
  },
};


const AuthPage = () => {
const { lang = "en" } = useParams<{ lang: string }>();
const t = translations[lang as keyof typeof translations] || translations.en;
// const [isSigningIn, setisSigninIn]= useState(false)
const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from?.pathname || `/${lang}/dashboard`;
  
  
  const { mutate: sigin, isPending } = useGoggleSignIn(lang)
  
  const handleSignIn = () => {
    sigin(undefined,{
      onSuccess: () => {
          navigate (from)
      }
    })
  
  }

    
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 bg-ink p-12 lg:p-24 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="grid-pattern absolute inset-0 opacity-10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-24">
            <div className="h-10 w-10 bg-white text-ink rounded flex items-center justify-center">
              <HardHat className="h-6 w-6" />
            </div>
            <span className="text-xl font-display font-bold tracking-tighter text-white">
              SITEREPORT
            </span>
          </div>

          <h1 className="text-6xl lg:text-8xl font-display font-bold tracking-tighter leading-[0.85] mb-12">
            {t.accessPlatform} <br />
            <span className="opacity-40 italic">{t.platformItalic}</span>
          </h1>

          <div className="max-w-md space-y-8">
            <p className="text-xl font-medium leading-relaxed opacity-60">
              {t.standard}
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 text-xs font-mono font-bold uppercase tracking-widest">
                <div className="h-1 w-1 bg-white rounded-full" />
                <span>{t.encrypted}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono font-bold uppercase tracking-widest">
                <div className="h-1 w-1 bg-white rounded-full" />
                <span>{t.enterprise}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono font-bold uppercase tracking-widest">
                <div className="h-1 w-1 bg-white rounded-full" />
                <span>{t.realtime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-24">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] opacity-30">
            © 2026 SITEREPORT TECHNOLOGIES
          </p>
        </div>
      </div>

      {/* Right Side - Auth */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="border border-ink p-12 relative">
            <div className="absolute -top-4 -left-4 bg-white border border-ink p-2">
              <LogIn className="h-6 w-6" />
            </div>

            <h2 className="text-4xl font-display font-bold tracking-tighter mb-4">
              {t.welcomeBack}
            </h2>
            <p className="text-ink/60 mb-12 font-medium">{t.authRequired}</p>

            <div className="space-y-8">
              <button
                onClick={handleSignIn}
                disabled={isPending}
                className="w-full brutal-button flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isPending ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="h-5 w-5"
                    referrerPolicy="no-referrer"
                  />
                )}
                {isPending ? t.authenticating : t.continueWithGoogle}
              </button>

              <div className="pt-8 border-t border-line">
                <div className="flex gap-4 items-start">
                  <ShieldCheck className="h-6 w-6 text-ink shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2">
                      {t.secureAuth}
                    </p>
                    <p className="text-xs text-ink/60 leading-relaxed">
                      {t.secureAuthDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ink/40 text-center leading-loose">
              {t.agreeTerms} <br />
              <span className="text-ink underline cursor-pointer">
                {t.terms}
              </span>{" "}
              {t.and}{" "}
              <span className="text-ink underline cursor-pointer">
                {t.privacy}
              </span>
              {lang === "jp" && t.agreeTermsSuffix}
            </p>

            <Link
              to={`/${lang}`}
              className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-ink/40 hover:text-ink transition-colors"
            >
              <ArrowRight className="h-3 w-3 rotate-180" />
              {t.returnHome}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthPage
