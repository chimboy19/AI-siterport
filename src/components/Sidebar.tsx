import { Link, useLocation, useParams } from 'react-router-dom';
import { LayoutDashboard, Folder, Search, Settings, X, HardHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const translations = {
  en: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    search: 'Search',
    settings: 'Settings',
  },
  jp: {
    dashboard: 'ダッシュボード',
    projects: 'プロジェクト',
    search: '検索',
    settings: '設定',
  },
};

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppSidebar = ({ isOpen, onClose }: AppSidebarProps) => {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const t = translations[lang as keyof typeof translations] || translations.en;
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: t.dashboard, path: `/${lang}/dashboard` },
    { icon: Folder, label: t.projects, path: `/${lang}/projects` },
    { icon: Search, label: t.search, path: `/${lang}/search` },
    { icon: Settings, label: t.settings, path: `/${lang}/settings` },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-border">
        <Link
          to={`/${lang}/dashboard`}
          onClick={onClose}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
            <HardHat className="h-5 w-5 text-background" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            SiteReport
          </span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">v1.0.0-beta</p>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden print:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      {!isDesktop && (
        <motion.aside
          initial={{ x: '-100%' }}
          animate={{ x: isOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 left-0 h-full w-64 z-50 lg:hidden print:hidden shadow-xl"
        >
          {sidebarContent}
        </motion.aside>
      )}

      {/* Desktop Sidebar */}
      {isDesktop && (
        <aside className="hidden lg:flex h-screen w-64 flex-col fixed top-0 left-0 z-30 print:hidden">
          {sidebarContent}
        </aside>
      )}
    </>
  );
};

export default AppSidebar;
