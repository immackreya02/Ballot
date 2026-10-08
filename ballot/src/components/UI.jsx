import React, { createContext, useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  ChevronRight,
  X,
  LoaderCircle,
  Copy,
  QrCode,
  ShieldCheck,
  BarChart2,
  Users,
  Clock,
  Settings,
  Share2,
  Lock,
  Eye,
  ArrowRight,
  ShieldAlert,
  Activity
} from 'lucide-react';

// Toast Context
const ToastContext = createContext({ showToast: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-warm px-4 py-3 shadow-lg font-sans text-sm animate-in fade-in slide-in-from-bottom-3"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-terra text-white text-xs">
              ✓
            </span>
            <span className="font-medium text-ink">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-2 text-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export const Logo = () => (
  <div className="flex items-center gap-2 font-bold tracking-wide">
    <span className="grid h-5 w-5 place-items-center rounded-sm bg-terra text-xs text-white">
      ✓
    </span>
    BALLOT
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', ...p }) => (
  <button className={`btn btn-${variant} ${className}`} {...p}>
    {children}
  </button>
);

export const Status = ({ children, live = false }) => {
  const isLive = live || children === 'OPEN' || children === 'LIVE';
  const isDraft = children === 'DRAFT';
  const isClosed = children === 'CLOSED';
  const isVoted = children === 'VOTED';

  let dotColorClass = isLive ? 'live-dot' : 'dot';
  if (isDraft) dotColorClass = 'w-1.5 h-1.5 rounded-full bg-mustard';
  if (isVoted) dotColorClass = 'w-1.5 h-1.5 rounded-full bg-olive';

  return (
    <span className="status">
      <span className={dotColorClass}></span>
      {children}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const r = (role || 'voter').toLowerCase();
  let bg = 'bg-paper text-muted border-line';
  if (r === 'admin') bg = 'bg-terra/10 text-terra border-terra/30 font-bold';
  if (r === 'organizer') bg = 'bg-olive/10 text-olive border-olive/30 font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${bg}`}>
      {r}
    </span>
  );
};

export const PageHeader = ({ eyebrow, title, children }) => (
  <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
    <div>
      {eyebrow && <div className="label mb-2">{eyebrow}</div>}
      <h1 className="font-serif text-4xl leading-tight md:text-5xl">{title}</h1>
    </div>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>
);

export function PollCard({ poll, onOpen }) {
  const { user } = useAuth();
  const isVoter = user?.role === 'voter';
  const leader = [...poll.options].sort((a, b) => b[1] - a[1])[0] || ['No options', 0];

  const actionText = isVoter
    ? poll.hasVoted || poll.status === 'CLOSED'
      ? 'View results'
      : 'Cast vote'
    : poll.status === 'DRAFT'
    ? 'Continue editing'
    : 'Manage poll';

  return (
    <article className="card p-5 flex flex-col justify-between transition-all hover:border-ink/40">
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Status>{poll.status}</Status>
            {poll.hasVoted && (
              <span className="rounded-full border border-olive/30 bg-olive/10 px-2 py-0.5 font-mono text-[10px] font-bold text-olive">
                VOTED
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-muted">
            {poll.votes ? poll.votes.toLocaleString() : 0} votes
          </span>
        </div>
        <h3 className="mb-2 text-lg font-semibold leading-snug text-ink">{poll.question}</h3>
        {poll.owner && (
          <div className="mb-4 text-xs font-mono text-muted">
            Organizer: <span className="text-ink font-medium">{poll.owner}</span>
          </div>
        )}
      </div>
      <div>
        <div className="border-t border-line pt-3.5 text-sm">
          <div className="mb-2 flex justify-between">
            <span className="text-muted text-xs">Leading choice</span>
            <span className="font-medium text-ink truncate max-w-[200px] text-xs">{leader[0]}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-paper">
            <div
              className="h-full bg-ink transition-all duration-500"
              style={{ width: `${leader[1]}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-xs text-muted">
            <span>{leader[1]}%</span>
            <span>{poll.closes}</span>
          </div>
        </div>
        <button
          onClick={onOpen}
          className="mt-4 flex w-full items-center justify-between rounded-lg border border-line bg-warm px-3.5 py-2 text-xs font-bold text-ink hover:bg-paper hover:border-ink transition-colors"
        >
          <span>{actionText}</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </article>
  );
}

export function SearchFilter({
  placeholder = 'Search polls…',
  searchVal = '',
  onSearchChange = () => {},
  sortVal = 'date',
  onSortChange = () => {},
  filterVal = 'all',
  onFilterChange = () => {},
  showDraftOption = true
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row">
      <div className="relative flex-1 flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10 shrink-0" size={18} />
        <input
          value={searchVal}
          onChange={(e) => onSearchChange(e.target.value)}
          className="field"
          style={{ paddingLeft: '2.75rem' }}
          placeholder={placeholder}
        />
      </div>
      <div className="flex gap-2">
        <select
          value={filterVal}
          onChange={(e) => onFilterChange(e.target.value)}
          className="field md:w-40"
        >
          <option value="all">All Polls</option>
          <option value="OPEN">Active</option>
          {showDraftOption && <option value="DRAFT">Drafts</option>}
          <option value="CLOSED">Closed</option>
        </select>
        <select
          value={sortVal}
          onChange={(e) => onSortChange(e.target.value)}
          className="field md:w-44"
        >
          <option value="date">Sort by date</option>
          <option value="votes">Most participation</option>
          <option value="question">Alphabetical</option>
        </select>
      </div>
    </div>
  );
}

export function ResultBars({ poll, live = false }) {
  const sorted = [...poll.options].sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-5">
      {sorted.map(([name, pct], i) => (
        <div key={name}>
          <div className="mb-2 flex justify-between gap-3 text-sm">
            <div className="flex gap-3 items-center">
              <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-medium text-ink">{name}</span>
            </div>
            <div className="font-mono text-sm">
              <b className="text-ink">{pct}%</b>
              <span className="ml-3 text-muted">
                {Math.round((poll.votes * pct) / 100).toLocaleString()} votes
              </span>
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-paper">
            <div
              className="h-full bg-ink transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function State({
  type = 'empty',
  title = 'Nothing here yet',
  text = 'Try again or change your filters.',
  action = 'Go back',
  onAction
}) {
  const icon =
    type === 'error' || type === 'network' ? (
      <AlertTriangle className="text-terra" />
    ) : type === 'loading' ? (
      <LoaderCircle className="animate-spin text-terra" />
    ) : (
      <Check className="text-olive" />
    );

  return (
    <div className="card grid min-h-[320px] place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-line bg-paper">
          {icon}
        </div>
        <h2 className="font-serif text-2xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-muted leading-relaxed">{text}</p>
        {action && (
          <Button
            variant="secondary"
            className="mt-5"
            onClick={onAction || (() => window.history.back())}
          >
            {action}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, children, onClose, onConfirm, confirm = 'Confirm' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="card w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <div className="my-4 text-muted leading-relaxed">{children}</div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>{confirm}</Button>
        </div>
      </div>
    </div>
  );
}

export function SettingsNavigation() {
  const navItems = [
    { to: '/app/settings', label: 'General' },
    { to: '/app/settings/security', label: 'Security' },
    { to: '/app/settings/notifications', label: 'Notifications' },
    { to: '/app/settings/privacy', label: 'Privacy & Data' }
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-4">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/app/settings'}
          className={({ isActive }) =>
            `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-ink text-white font-semibold'
                : 'bg-warm border border-line text-muted hover:text-ink'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

export function PollManagementNavigation({ pollId }) {
  const { user } = useAuth();
  const isVoter = user?.role === 'voter';

  if (isVoter) return null;

  const items = [
    { to: `/app/polls/${pollId}`, label: 'Overview', end: true },
    { to: `/app/polls/${pollId}/share`, label: 'Share' },
    { to: `/app/polls/${pollId}/results`, label: 'Live Results' },
    { to: `/app/polls/${pollId}/participants`, label: 'Participants' },
    { to: `/app/polls/${pollId}/activity`, label: 'Audit Timeline' }
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `rounded-lg px-3.5 py-1.5 text-xs font-mono tracking-wide uppercase transition-colors ${
              isActive
                ? 'bg-terra text-white font-bold'
                : 'bg-warm border border-line text-muted hover:text-ink'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

export function AdminNavigation() {
  const items = [
    { to: '/app/admin', label: 'Overview', end: true },
    { to: '/app/admin/users', label: 'User Management' },
    { to: '/app/admin/polls', label: 'System Polls' },
    { to: '/app/admin/activity', label: 'System Activity' },
    { to: '/app/admin/settings', label: 'Admin Settings' }
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `rounded-lg px-4 py-2 text-xs font-mono tracking-wider uppercase transition-colors ${
              isActive
                ? 'bg-ink text-white font-bold'
                : 'bg-warm border border-line text-muted hover:text-ink'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

export function QRCodeSVG({ value = '', size = 160 }) {
  return (
    <div
      className="grid place-items-center rounded-2xl border border-line bg-white p-4 shadow-sm"
      style={{ width: size + 32, height: size + 32 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" fill="#FFFFFF" />
        <path
          d="M10 10h30v30H10V10zm6 6v18h18V16H16zm6 6h6v6h-6v-6zm38-12h30v30H60V10zm6 6v18h18V16H66zm6 6h6v6h-6v-6zM10 60h30v30H10V60zm6 6v18h18V66H16zm6 6h6v6h-6v-6zm38 0h6v6h-6v-6zm12 0h6v6h-6v-6zm-12 12h6v6h-6v-6zm12 0h12v12H76V78zm-24-18h6v6h-6v-6zm12 0h12v6H64v-6zm-12 6h6v12h-6V66zm12 6h6v6h-6v-6z"
          fill="#171717"
        />
      </svg>
    </div>
  );
}
