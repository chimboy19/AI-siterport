import {Link,useLocation} from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, Camera, HardHat, Construction, Activity } from 'lucide-react';


const translations = {
  en: {
    marquee: [
      "SITE DOCUMENTATION",
      "AI ANALYSIS",
      "PROGRESS TRACKING",
      "EVIDENCE MANAGEMENT",
      "DAILY REPORTS",
      "RISK IDENTIFICATION",
    ],
    nav: ["Features", "How it Works"],
    signIn: "Sign In",
    heroTitle: "SITE REPORTS",
    heroSubtitle: "REIMAGINED.",
    heroDesc:
      "Professional site documentation powered by AI. Capture, analyze, and generate reports in seconds, not hours.",
    getStarted: "Get Started Free",
    explore: "[ Explore Features ]",
    mvpBanner: "🚧 Early Access MVP — New accounts receive 4 free AI report generations.",
    trialNote: "New users get 4 free AI report generations. No credit card required.",
    contactLabel: "Contact",
    capabilities: "Capabilities",
    builtForPrecision: "BUILT FOR PRECISION.",
    feature1Title: "Visual Evidence",
    feature1Desc:
      "Capture high-resolution photos directly from the field with automatic metadata tagging and AI-assisted descriptions.",
    feature2Title: "AI Generation",
    feature2Desc:
      "Our advanced AI analyzes your notes and photos to draft comprehensive technical reports that meet industry standards.",
    feature3Title: "Secure Storage",
    feature3Desc:
      "All your projects and reports are encrypted and stored securely in the cloud with full audit trails and versioning.",
    workflow: "01. Workflow",
    captureTitle: "CAPTURE DATA ON THE GO.",
    captureDesc:
      "Use our mobile-optimized interface to record site conditions, take notes, and snap photos. No more carrying heavy clipboards or losing loose papers.",
    workflowItems: [
      "Real-time progress monitoring",
      "Offline support for remote sites",
      "Safety compliance tracking",
    ],
    intelligence: "02. Intelligence",
    aiTitle: "AI-POWERED ANALYSIS.",
    aiDesc:
      "Our AI doesn't just transcribe; it understands. It identifies risks, suggests improvements, and formats everything into a professional document ready for your clients.",
    tryAi: "Try AI Generation",
    howToUse: "03. Guide",
    howToUseTitle: "HOW TO USE IT.",
    howToUseSubtitle: "From sign-up to AI report — in four simple steps.",
    steps: [
      {
        number: "01",
        title: "Create an Account",
        desc: "Sign in with your Google account. No setup or configuration needed — you are ready in seconds.",
        detail: "Your account is secured via Google Authentication. All your data is private and only accessible to you."
      },
      {
        number: "02",
        title: "Create a Project",
        desc: "From the Dashboard, tap \"New Project\" and give it a name — e.g. \"Block A Foundation\". Projects group all your reports together by job.",
        detail: "You can have as many projects as needed. Each project keeps its reports, photos, and history organized and searchable."
      },
      {
        number: "03",
        title: "Add Photos & Notes",
        desc: "Inside a project, open \"Create Report\". Upload up to 7 site photos and add a note to each one describing what is happening in that image.",
        detail: "Notes are crucial — the AI reads them alongside your photos to produce an accurate, detailed report. The more context you give, the better the output."
      },
      {
        number: "04",
        title: "Generate & Save",
        desc: "Hit \"Generate AI Report\". In seconds, a full professional site report is created. Review it, make any edits, and then hit Save.",
        detail: "Your report is saved to the cloud and accessible any time from the Report Editor. You can also share or export it directly."
      },
    ],
    footerDesc:
      "Modernizing construction site documentation with state-of-the-art AI technology.",
    product: "Product",
    social: "Social",
    legal: "Legal",
    status: "Status: Operational",
  },

  jp: {
    marquee: ["現場ドキュメント","AI分析","進捗管理","エビデンス管理","日報作成","リスク特定",],
    nav: ["機能", "ワークフロー"],
    signIn: "ログイン",
    heroTitle: "現場レポートを",
    heroSubtitle: "再定義する。",
    heroDesc:"AIを活用したプロフェッショナルな現場ドキュメント。数時間ではなく数秒でレポートを作成、分析、生成します。",
    getStarted: "無料で始める",
    explore: "[ 機能を探索する ]",
    mvpBanner: "🚧 早期アクセスMVP — 新規アカウントにはAIレポート生成が4回無料でご利用いただけます。",
    trialNote: "新規ユースケ4回AIレポート無料。クレジットカード不要。",
    contactLabel: "コンタクト",
    capabilities: "機能紹介",
    builtForPrecision: "精密な設計。",
    feature1Title: "視覚的エビデンス",
    feature1Desc:"現場から直接高解像度の写真を撮影。自動メタデータタグ付けとAIによる説明文生成をサポートします。",
    feature2Title: "AIレポート生成",
    feature2Desc:"高度なAIがメモや写真を分析し、業界標準に準拠した包括的な技術レポートをドラフトします。",
    feature3Title: "安全なストレージ",
    feature3Desc:"すべてのプロジェクトとレポートは暗号化され、クラウドに安全に保存されます。監査証跡とバージョン管理も万全です。",
    workflow: "01. ワークフロー",
    captureTitle: "外出先でデータをキャプチャ。",
    captureDesc:"モバイルに最適化されたインターフェースで、現場の状況を記録し、メモを取り、写真を撮影。重いクリップボードを持ち歩く必要はありません。",
    workflowItems: ["リアルタイムの進捗モニタリング","遠隔地向けのオフラインサポート","安全コンプライアンス管理",],
    intelligence: "02. インテリジェンス",
    aiTitle: "AIによる分析。",
    aiDesc:"当社のAIは単なる文字起こしではありません。リスクを特定し、改善を提案し、クライアント向けのプロフェッショナルなドキュメントに整形します。",
    tryAi: "AI生成を試す",
    howToUse: "03. ガイド",
    howToUseTitle: "使い方。",
    howToUseSubtitle: "サインアップからAIレポートまで、4つのステップで完結します。",
    steps: [
      {
        number: "01",
        title: "アカウントを作成",
        desc: "Googleアカウントでサインイン。設定は不要で、数秒で準備完了です。",
        detail: "アカウントはGoogle認証で保護されており、データはすべてプライベートで自分だけがアクセスできます。"
      },
      {
        number: "02",
        title: "プロジェクトを作成",
        desc: "ダッシュボードから\"新規プロジェクト\"をタップし、名前を付けます（例：\"A棟基礎工事\"）。プロジェクト単位でレポートを管理します。",
        detail: "プロジェクトは必要な数だけ作成可能。各プロジェクトのレポート、写真、履歴が整理されて保存されます。"
      },
      {
        number: "03",
        title: "写真とメモを追加",
        desc: "プロジェクト内の\"レポート作成\"を開き、現場写真を最大7枚アップロード。各写真にその内容を説明するメモを追加します。",
        detail: "メモはとても重要です。AIが写真とメモを合わせて読み込み、正確で詳細なレポートを生成します。より多くの情報を提供するほど、出力品質が向上します。"
      },
      {
        number: "04",
        title: "生成して保存",
        desc: "\"AIレポートを生成\"を押すと、数秒でプロフェッショナルな現場報告書が完成します。確認・編集後、保存してください。",
        detail: "レポートはクラウドに保存され、レポートエディタからいつでもアクセス可能。共有やエクスポートも直接行えます。"
      },
    ],
    footerDesc: "最先端のAI技術で建設現場のドキュメント作成を近代化します。",
    product: "製品",
    social: "ソーシャル",
    legal: "法的情報",
    status: "ステータス: 稼働中",
  },
};

const LandingPage = () => {

    const location = useLocation()
    const lang = location.pathname.startsWith('/jp') ? 'jp' : 'en'
    const t = translations[lang]
    
    const marqueeItems=[...t.marquee, ...t.marquee]




  return (
    <div className="min-h-screen bg-white text-ink overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-line"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 bg-ink rounded-lg flex items-center justify-center">
                <HardHat className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold tracking-tighter">SITEREPORT</span>
            </motion.div>
            <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
              {t.nav.map((item, i) => (
                <motion.a 
                  key={item}
                  href={`#${translations.en.nav[i].toLowerCase().replace(/\s+/g, '-')}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="hover:text-ink/60 transition-colors"
                >
                  {item}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link to={`/${lang}/auth`} className="brutal-button !py-2 !px-4 !text-xs">{t.signIn}</Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* MVP Notice Banner */}
      <div className="bg-ink text-white px-4 py-3 text-center mt-16">
        <p className="text-xs font-mono font-bold uppercase tracking-widest">
          {t.mvpBanner}
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 px-4">
        <div className="grid-pattern absolute inset-0 opacity-40 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.h1 
              initial={{ scale: 1.5, y: 100, opacity: 0, skewX: -10 }}
              animate={{ scale: 1, y: 0, opacity: 1, skewX: 0 }}
              transition={{ 
                duration: 1.2, 
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1
              }}
              className="text-6xl md:text-8xl lg:text-[10rem] font-display font-extrabold leading-[0.8] tracking-tighter mb-12"
            >
              {t.heroTitle} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink to-ink/40">{t.heroSubtitle}</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="max-w-2xl mx-auto text-xl md:text-2xl text-ink/60 mb-16 font-medium leading-relaxed"
            >
              {t.heroDesc}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8"
            >
              <Link to={`/${lang}/auth`} className="brutal-button text-2xl px-12 py-6 flex items-center gap-4 group">
                {t.getStarted}
                <ArrowRight className="h-7 w-7 group-hover:translate-x-2 transition-transform" />
              </Link>
              <a href="#features" className="text-lg font-mono font-bold uppercase tracking-widest hover:underline underline-offset-8 decoration-2">
                {t.explore}
              </a>
            </motion.div>
            {/* Trial note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="text-sm font-mono font-bold uppercase tracking-widest opacity-40 mt-6"
            >
              {t.trialNote}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="bg-ink py-6 border-y border-white/10 overflow-hidden relative">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ 
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear"
            }
          }}
          className="flex whitespace-nowrap gap-12"
        >
          {marqueeItems.map((item, i) => (
            <span key={i} className="text-white text-sm font-mono font-bold uppercase tracking-[0.3em] opacity-40">
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-24 text-center lg:text-left"
          >
            <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] opacity-40 mb-4 block">{t.capabilities}</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tighter">{t.builtForPrecision}</h2>
            <div className="h-1 w-32 bg-white mx-auto lg:mx-0" />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <FeatureCard 
              index={0}
              icon={<Camera className="h-10 w-10" />}
              title={t.feature1Title}
              description={t.feature1Desc}
            />
            <FeatureCard 
              index={1}
              icon={<Zap className="h-10 w-10" />}
              title={t.feature2Title}
              description={t.feature2Desc}
            />
            <FeatureCard 
              index={2}
              icon={<Shield className="h-10 w-10" />}
              title={t.feature3Title}
              description={t.feature3Desc}
            />
          </div>
        </div>
      </section>

      {/* Split Layout Section */}
      <section id="how-it-works" className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white p-12 md:p-24 lg:p-32 flex flex-col justify-center border-r border-line"
        >
          <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] mb-8 opacity-40">{t.workflow}</span>
          <h2 className="text-5xl md:text-8xl font-display font-bold mb-10 leading-[0.85] tracking-tighter">
            {t.captureTitle}
          </h2>
          <p className="text-xl text-ink/60 leading-relaxed mb-12 font-medium">
            {t.captureDesc}
          </p>
          <div className="space-y-6">
            {[
              { icon: Activity, text: t.workflowItems[0] },
              { icon: Construction, text: t.workflowItems[1] },
              { icon: HardHat, text: t.workflowItems[2] }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 * i, duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <div className="h-10 w-10 border border-ink flex items-center justify-center">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-bold uppercase tracking-widest text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-ink p-12 md:p-24 lg:p-32 flex flex-col justify-center text-white relative overflow-hidden"
        >
          <div className="grid-pattern absolute inset-0 opacity-10" />
          <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] mb-8 opacity-40">{t.intelligence}</span>
          <h2 className="text-5xl md:text-8xl font-display font-bold mb-10 leading-[0.85] tracking-tighter">
            {t.aiTitle}
          </h2>
          <p className="text-xl text-white/60 leading-relaxed mb-12 font-medium">
            {t.aiDesc}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to={`/${lang}/auth`} className="brutal-button bg-white text-ink w-fit text-lg px-10 py-5">
              {t.tryAi}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── HOW TO USE SECTION ── */}
      <section id="how-to-use" className="py-32 bg-white border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-24"
          >
            <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] opacity-40 mb-4 block">{t.howToUse}</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-6">{t.howToUseTitle}</h2>
            <p className="text-xl text-ink/60 font-medium max-w-2xl">{t.howToUseSubtitle}</p>
            <div className="h-1 w-32 bg-ink mt-8" />
          </motion.div>

          {/* Steps */}
          <div className="space-y-0">
            {t.steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`grid grid-cols-1 lg:grid-cols-[auto_1fr_1fr] gap-0 border border-line ${
                  i % 2 === 0 ? 'bg-white' : 'bg-ink text-white'
                }`}
              >
                {/* Step Number */}
                <div className={`flex items-center justify-center p-8 lg:p-16 border-b lg:border-b-0 lg:border-r ${
                  i % 2 === 0 ? 'border-line' : 'border-white/10'
                }`}>
                  <span className={`text-7xl md:text-9xl font-display font-extrabold tracking-tighter leading-none ${
                    i % 2 === 0 ? 'text-ink/10' : 'text-white/10'
                  }`}>
                    {step.number}
                  </span>
                </div>

                {/* Step Content */}
                <div className={`p-10 lg:p-16 border-b lg:border-b-0 lg:border-r ${
                  i % 2 === 0 ? 'border-line' : 'border-white/10'
                }`}>
                  <h3 className="text-3xl font-display font-bold tracking-tight mb-4">{step.title}</h3>
                  <p className={`text-lg font-medium leading-relaxed ${
                    i % 2 === 0 ? 'text-ink/70' : 'text-white/70'
                  }`}>{step.desc}</p>
                </div>

                {/* Step Detail */}
                <div className="p-10 lg:p-16 flex items-center">
                  <div className={`flex gap-4 ${
                    i % 2 === 0 ? '' : ''
                  }`}>
                    <div className={`w-0.5 flex-shrink-0 ${
                      i % 2 === 0 ? 'bg-ink/20' : 'bg-white/20'
                    }`} />
                    <p className={`text-sm font-medium leading-relaxed ${
                      i % 2 === 0 ? 'text-ink/50' : 'text-white/50'
                    }`}>{step.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA at bottom of guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 flex flex-col sm:flex-row items-center gap-6"
          >
            <Link to={`/${lang}/auth`} className="brutal-button text-lg px-10 py-5 flex items-center gap-3 group">
              {t.getStarted}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            <span className="text-sm font-mono font-bold uppercase tracking-widest opacity-40">
              {lang === 'jp' ? '4つのステップで完了' : '4 steps. No setup required.'}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 bg-white border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-ink rounded-lg flex items-center justify-center">
                  <HardHat className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-display font-bold tracking-tighter">SITEREPORT</span>
              </div>
              <p className="max-w-xs text-ink/60 font-medium leading-relaxed">
                {t.footerDesc}
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
              <div className="space-y-6">
                <h4 className="text-xs font-mono font-bold uppercase tracking-[0.3em] opacity-40">{t.product}</h4>
                <ul className="space-y-4 font-bold text-sm">
                  <li><a href="#features" className="hover:underline">{t.nav[0]}</a></li>
                  <li><a href="#how-it-works" className="hover:underline">{t.nav[1]}</a></li>
                  <li><Link to={`/${lang}/auth`} className="hover:underline">{t.signIn}</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-mono font-bold uppercase tracking-[0.3em] opacity-40">{t.social}</h4>
                <ul className="space-y-4 font-bold text-sm">
                  <li><a href="#" className="hover:underline">Twitter</a></li>
                  <li><a href="#" className="hover:underline">LinkedIn</a></li>
                  <li><a href="#" className="hover:underline">Instagram</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-mono font-bold uppercase tracking-[0.3em] opacity-40">{t.legal}</h4>
                <ul className="space-y-4 font-bold text-sm">
                  <li><a href="#" className="hover:underline">Privacy</a></li>
                  <li><a href="#" className="hover:underline">Terms</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-mono font-bold uppercase tracking-[0.3em] opacity-40">{t.contactLabel}</h4>
                <ul className="space-y-4 font-bold text-sm">
                  <li>
                    <a href="mailto:nickooraezu@gmail.com" className="hover:underline break-all">
                      nickooraezu@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-line flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-ink/40 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
              © 2026 SITEREPORT TECHNOLOGIES. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-40">
              <a href="mailto:nickooraezu@gmail.com" className="hover:opacity-100 transition-opacity normal-case">
                nickooraezu@gmail.com
              </a>
              <span className="flex items-center gap-2">
                {t.status}
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );


};


export default LandingPage;


function FeatureCard({ icon, title, description, index }: { icon: React.ReactNode, title: string, description: string, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -15, borderColor: "rgba(0,0,0,1)" }}
            className="group p-10 border border-line transition-all duration-500 bg-white"
        >
            <div className="mb-8 text-ink group-hover:scale-110 transition-transform duration-500 w-fit">
                <div className="p-4 border border-line group-hover:bg-ink group-hover:text-white transition-colors">
                    {icon}
                </div>
            </div>
            <h3 className="text-3xl font-display font-bold mb-6 tracking-tight">{title}</h3>
            <p className="text-ink/60 leading-relaxed font-medium">
                {description}
            </p>
        </motion.div>
    );
    
}