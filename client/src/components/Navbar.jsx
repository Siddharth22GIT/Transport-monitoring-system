import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, MapPinned, LayoutDashboard, LogOut, LogIn, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-[1000] border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur shadow-sm">
      <div className="px-4 md:px-8 py-3 flex items-center justify-between">
        <Link to="/" onClick={closeMobile} className="flex items-center gap-2 font-[var(--font-display)] text-lg font-extrabold tracking-tight text-[var(--color-ink)]">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-[var(--color-primary)] text-white">
            <Bus size={20} strokeWidth={2.5} />
          </span>
          Where's My Bus
        </Link>

        {/* Desktop nav - sm and up */}
        <div className="hidden sm:flex items-center gap-2 md:gap-4 text-sm font-medium">
          {user && (
            <Link to="/search" className="flex items-center gap-1.5 text-[var(--color-ink-dim)] hover:text-[var(--color-primary)] transition px-2 py-1.5">
              <MapPinned size={17} /> Find a bus
            </Link>
          )}
          <Link to="/map" className="flex items-center gap-1.5 text-[var(--color-ink-dim)] hover:text-[var(--color-primary)] transition px-2 py-1.5">
            <Bus size={17} /> Live Map
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-1.5 text-[var(--color-ink-dim)] hover:text-[var(--color-primary)] transition px-2 py-1.5">
              <LayoutDashboard size={17} /> Admin
            </Link>
          )}

          {user && <NotificationBell />}

          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border-2 border-[var(--color-border)] px-3 py-1.5 text-[var(--color-ink-dim)] hover:border-[var(--color-stop)] hover:text-[var(--color-stop)] transition font-semibold"
            >
              <LogOut size={16} /> Logout
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

        {/* Mobile controls - below sm */}
        <div className="flex sm:hidden items-center gap-2">
          {user && <NotificationBell />}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid place-items-center h-9 w-9 rounded-lg border-2 border-[var(--color-border)] text-[var(--color-ink)]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 flex flex-col gap-1 text-sm font-medium">
          {user && (
            <Link to="/search" onClick={closeMobile} className="flex items-center gap-2 py-2.5 text-[var(--color-ink)]">
              <MapPinned size={18} /> Find a bus
            </Link>
          )}
          <Link to="/map" onClick={closeMobile} className="flex items-center gap-2 py-2.5 text-[var(--color-ink)]">
            <Bus size={18} /> Live Map
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={closeMobile} className="flex items-center gap-2 py-2.5 text-[var(--color-ink)]">
              <LayoutDashboard size={18} /> Admin
            </Link>
          )}

          <div className="pt-2 mt-1 border-t border-[var(--color-border)]">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2.5 text-[var(--color-stop)] font-semibold w-full"
              >
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMobile}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] text-white py-2.5 font-bold"
              >
                <LogIn size={16} /> Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}