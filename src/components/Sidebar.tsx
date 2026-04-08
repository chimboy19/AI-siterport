import { Link, useLocation, useParams } from 'react-router-dom';
import { LayoutDashboard, Folder, Search, Settings, X, HardHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';


const translations = {
  en: {
    dashboard: "Dashboard",
    projects: "Projects",
    search: "Search",
    settings: "Settings",
  },
  jp: {
    dashboard: "ダッシュボード",
    projects: "プロジェクト",
    search: "検索",
    settings: "設定",
  },
};



interface SidebarProps{
    isOpen: boolean
    onClose: () =>void
}





const Sidebar = ({isOpen,onClose}:SidebarProps) => {
 

    const { lang = "en" } = useParams<{ lang: string }>();
    const t =translations[lang as keyof typeof translations] || translations.en;
    const location = useLocation();
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);



    useEffect(() => {
      const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const menuItems = [
      { icon: LayoutDashboard, label: t.dashboard, path: `/${lang}/dashboard` },
      { icon: Folder, label: t.projects, path: `/${lang}/projects` },
      { icon: Search, label: t.search, path: `/${lang}/search` },
      { icon: Settings, label: t.settings, path: `/${lang}/settings` },
    ];

    const sidebarVariants = {
      open: { x: 0 },
      closed: { x: "-100%" },
    };

    const content = (
        <div className="flex flex-col h-full">
            
        {/* Logo Section */}
        <div className="p-6 border-b border-line flex items-center justify-between">
          <Link
            to={`/${lang}/dashboard`}
            className="flex items-center gap-2"
            onClick={onClose}
          >
            <div className="h-8 w-8 bg-ink rounded-lg flex items-center justify-center">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold tracking-tighter text-ink">
              SITEREPORT
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-ink/40 hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

            
        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive
                    ? "bg-ink text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                    : "text-ink/60 hover:bg-line hover:text-ink"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${isActive ? "text-white" : "group-hover:text-ink"}`}
                />
                <span className="font-bold tracking-tight">{item.label}</span>
              </Link>
            );
          })}
            </nav>
            


        {/* Bottom Section */}
        <div className="p-4 border-t border-line">
          <div className="bg-line/50 rounded-lg p-4">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mb-1">
              Version
            </p>
            <p className="text-xs font-bold">1.0.0-beta</p>
          </div>
        </div>
      </div>
    );

    return (
        <>
            
            
        {/* Mobile Overlay */}
        <AnimatePresence>
          {isOpen && !isDesktop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 lg:hidden print:hidden"
              onClick={onClose}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        {!isDesktop && (
          <motion.aside
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            variants={sidebarVariants}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-64 bg-white border-r border-line z-50 lg:hidden print:hidden"
          >
            {content}
          </motion.aside>
        )}

        {/* Desktop Sidebar */}
        {isDesktop && (
          <aside className="hidden lg:block w-64 h-screen bg-white border-r border-line fixed top-0 left-0 z-30 print:hidden">
            {content}
          </aside>
        )}
      </>
    );
}

export default Sidebar
