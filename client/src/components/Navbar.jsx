import { Link, useNavigate } from 'react-router-dom';
import { Bus, MapPinned, LayoutDashboard, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-[1000] border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex items-center gap-2 font-[var(--font-display)] text-lg font-extrabold tracking-tight text-[var(--color-ink)]">
        <span className="grid place-items-center h-9 w-9 rounded-xl bg-[var(--color-primary)] text-white">
          <Bus size={20} strokeWidth={2.5} />
        </span>
        Where's My Bus
      </Link>

      <div className="flex items-center gap-2 md:gap-4 text-sm font-medium">
        {user && (
          <Link to="/search" className="hidden sm:flex items-center gap-1.5 text-[var(--color-ink-dim)] hover:text-[var(--color-primary)] transition px-2 py-1.5">
            <MapPinned size={17} /> Find a bus
          </Link>
        )}
        <Link to="/map" className="hidden sm:flex items-center gap-1.5 text-[var(--color-ink-dim)] hover:text-[var(--color-primary)] transition px-2 py-1.5">
          <Bus size={17} /> Live Map
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="flex items-center gap-1.5 text-[var(--color-ink-dim)] hover:text-[var(--color-primary)] transition px-2 py-1.5">
            <LayoutDashboard size={17} /> <span className="hidden sm:inline">Admin</span>
          </Link>
        )}

        {user && <NotificationBell />}

        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border-2 border-[var(--color-border)] px-3 py-1.5 text-[var(--color-ink-dim)] hover:border-[var(--color-stop)] hover:text-[var(--color-stop)] transition font-semibold"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] text-white px-4 py-2 font-bold hover:bg-[var(--color-primary-dark)] transition shadow-sm"
          >
            <LogIn size={16} /> Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}