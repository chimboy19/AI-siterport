
import {auth} from '../firebase'
import { useNavigate ,Link,useParams } from 'react-router-dom';
import { HardHat, LogOut, User, Menu } from "lucide-react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { Logout } from '../firebase';
import toast from 'react-hot-toast';


const translations = {
  en: {
    signIn: "Sign In",
    logout: "Logout",
  },
  jp: {
    signIn: "ログイン",
    logout: "ログアウト",
  },
};


interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
    const { lang = "en" } = useParams<{ lang: string }>();
    const t =translations[lang as keyof typeof translations] || translations.en;
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

  
  const handleLogout = async () => {
       try {
         await Logout()
         toast.success('you have logout')
         navigate(`/${lang}`);
       } catch (error) {
          const err = error as Error;
        toast.error(err.message||'something happed while logging out ')
       }
   }

  return (
    <nav className="bg-white border-b border-line sticky top-0 z-40 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-ink/40 hover:text-ink transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link
              to={`/${lang}/dashboard`}
              className="flex items-center gap-2 lg:hidden"
            >
              <div className="h-8 w-8 bg-ink rounded-lg flex items-center justify-center">
                <HardHat className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold tracking-tighter text-ink">
                SITEREPORT
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-3 text-sm text-ink">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || ""}
                      className="h-8 w-8 rounded-full border border-line"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-8 w-8 p-1 rounded-full bg-line text-ink/60" />
                  )}
                  <span className="font-bold tracking-tight">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-ink/40 hover:text-ink transition-colors"
                  title={t.logout}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link
                to={`/${lang}/auth`}
                className="brutal-button !py-2 !px-4 !text-sm"
              >
                {t.signIn}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar
