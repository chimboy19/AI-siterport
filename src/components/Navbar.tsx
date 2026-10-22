import { auth } from '../firebase';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { LogOut, Menu, Settings } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Logout } from '../firebase';
import toast from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

const translations = {
  en: { signIn: 'Sign In', logout: 'Logout' },
  jp: { signIn: 'ログイン', logout: 'ログアウト' },
};

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const t = translations[lang as keyof typeof translations] || translations.en;
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await Logout();
      toast.success('Logged out successfully');
      navigate(`/${lang}`);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Something went wrong while logging out');
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-white px-5 print:hidden">
      {/* Mobile menu trigger */}
      {user && (
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden h-8 w-8">
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Mobile logo */}
      <Link to={`/${lang}/dashboard`} className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
          <svg className="h-4 w-4 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
          </svg>
        </div>
        <span className="text-sm font-bold">SiteReport</span>
      </Link>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Avatar + name */}
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 ring-1 ring-border">
                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} referrerPolicy="no-referrer" />
                <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-semibold text-foreground">
                {user.displayName || user.email}
              </span>
            </div>

            <Separator orientation="vertical" className="h-5" />

            {/* Settings / logout icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title={t.logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button asChild size="sm">
            <Link to={`/${lang}/auth`}>{t.signIn}</Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
