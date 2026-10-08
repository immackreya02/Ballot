import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Plus, User, LogOut, Shield, FileText, Users, Play, Activity } from 'lucide-react';
import { Logo, Button, ToastProvider, RoleBadge } from './UI';
import { useAuth } from '../context/AuthContext';

const voterLinks = [
  ['/app/polls', 'My Workspace']
];

const organizerLinks = [
  ['/app/polls', 'My Polls'],
  ['/app/voter-groups', 'Voter Groups'],
  ['/app/audit-logs', 'Audit Logs']
];

const adminLinks = [
  ['/app/polls', 'My Workspace'],
  ['/app/voter-groups', 'Voter Groups'],
  ['/app/admin', 'Admin Dashboard'],
  ['/app/admin/users', 'Users'],
  ['/app/admin/polls', 'All Polls']
];

const publicLinks = [
  ['/how-it-works', 'How it works'],
  ['/security', 'Security'],
  ['/transparency', 'Audit Model']
];

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentRole = user?.role || 'voter';
  const navLinks =
    currentRole === 'admin'
      ? adminLinks
      : currentRole === 'organizer'
      ? organizerLinks
      : voterLinks;

  const handleSignOut = () => {
    logout();
    nav('/login');
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-3">
              <NavLink to="/app/polls" className="flex items-center gap-2">
                <Logo />
              </NavLink>

              {user && (
                <div className="hidden sm:flex items-center gap-1.5 ml-2">
                  <RoleBadge role={currentRole} />
                </div>
              )}
            </div>

            <div className="hidden items-center gap-6 lg:flex">
              {navLinks.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    isActive
                      ? 'font-bold text-ink border-b-2 border-terra py-4'
                      : 'text-muted hover:text-ink transition-colors'
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {(currentRole === 'organizer' || currentRole === 'admin') && (
                <Button onClick={() => nav('/app/polls/create')} className="hidden sm:flex">
                  <Plus size={17} />
                  Create poll
                </Button>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <NavLink
                    to="/app/profile"
                    className="flex items-center gap-2 rounded-xl border border-line bg-warm px-3 py-1.5 hover:border-ink transition-colors"
                    title="Profile & Account"
                  >
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-paper font-mono text-[10px] font-bold text-ink border border-line">
                      {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                    <span className="hidden md:inline font-medium text-xs text-ink">{user.name}</span>
                  </NavLink>

                  <button
                    onClick={handleSignOut}
                    className="p-2 text-muted hover:text-terra transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Button variant="secondary" onClick={() => nav('/login')}>
                  Sign in
                </Button>
              )}

              <button
                className="lg:hidden p-2 text-ink hover:text-terra"
                onClick={() => setOpen(!open)}
                aria-label="Toggle Navigation"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>

          {open && (
            <div className="border-t border-line bg-warm p-4 lg:hidden space-y-2 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <span className="font-bold text-sm">{user?.name || 'Voter User'}</span>
                <RoleBadge role={currentRole} />
              </div>
              {navLinks.map(([to, label]) => (
                <NavLink
                  onClick={() => setOpen(false)}
                  key={to}
                  to={to}
                  className="block rounded-lg px-3 py-2.5 font-medium hover:bg-paper"
                >
                  {label}
                </NavLink>
              ))}
              <NavLink
                onClick={() => setOpen(false)}
                to="/app/profile"
                className="block rounded-lg px-3 py-2.5 font-medium hover:bg-paper"
              >
                Profile & Settings
              </NavLink>
              {(currentRole === 'organizer' || currentRole === 'admin') && (
                <div className="pt-2 border-t border-line">
                  <Button onClick={() => { setOpen(false); nav('/app/polls/create'); }} className="w-full">
                    <Plus size={17} />
                    Create poll
                  </Button>
                </div>
              )}
              <div className="pt-2">
                <Button variant="secondary" onClick={handleSignOut} className="w-full text-xs">
                  <LogOut size={16} />
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">
          <Outlet />
        </main>

        <footer className="border-t border-line bg-paper px-4 py-6 text-center text-sm text-muted">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
            <div>BALLOT — Secure online voting & poll management system.</div>
            <div className="flex gap-4 text-xs font-mono">
              <NavLink to="/how-it-works" className="hover:text-ink">Process</NavLink>
              <NavLink to="/security" className="hover:text-ink">Security</NavLink>
              <NavLink to="/transparency" className="hover:text-ink">Transparency</NavLink>
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}

export function MarketingLayout() {
  const nav = useNavigate();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
            <NavLink to="/" className="flex items-center gap-2">
              <Logo />
            </NavLink>

            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => nav('/login')}>
                Organizer Login
              </Button>
              <Button onClick={() => nav('/signup')}>
                Host a Poll
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-line bg-paper px-4 py-8 text-center text-sm text-muted">
          <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>BALLOT — Secure Online Voting & Poll Management Platform.</div>
            <div className="text-xs font-mono text-muted">
              Built for high-trust voting & auditable results.
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
