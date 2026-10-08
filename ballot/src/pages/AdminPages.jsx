import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import {
  Button,
  PageHeader,
  Status,
  RoleBadge,
  AdminNavigation,
  ConfirmModal,
  State,
  useToast
} from '../components/UI';
import { Users, Shield, Search, FileSpreadsheet } from 'lucide-react';

export function AdminDashboard() {
  const nav = useNavigate();
  const [users, setUsers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [uRes, pRes, aRes] = await Promise.all([
          adminAPI.getUsers(),
          adminAPI.getAllPolls(),
          adminAPI.getAuditLogs()
        ]);
        setUsers(uRes.users || []);
        setPolls(pRes.polls || []);
        setActivity(aRes.logs || []);
      } catch (err) {
        console.warn('Failed to load admin dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activePolls = polls.filter((p) => p.status === 'OPEN');
  const closedPolls = polls.filter((p) => p.status === 'CLOSED' || p.status === 'ARCHIVED');
  const organizersCount = users.filter((u) => u.role === 'organizer' || u.role === 'admin').length;

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="System Administration" title="Admin Overview">
        <Button variant="secondary" onClick={() => nav('/app/admin/users')}>
          <Users size={16} />
          Manage Users
        </Button>
        <Button onClick={() => nav('/app/admin/polls')}>
          <FileSpreadsheet size={16} />
          Inspect All Polls
        </Button>
      </PageHeader>

      <AdminNavigation />

      {/* System Metric Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Registered Users', users.length.toString().padStart(2, '0')],
          ['Active Open Polls', activePolls.length.toString().padStart(2, '0')],
          ['Registered Organizers', organizersCount.toString().padStart(2, '0')],
          ['Closed & Archived', closedPolls.length.toString().padStart(2, '0')]
        ].map(([label, val]) => (
          <div className="card p-5" key={label}>
            <div className="text-muted text-xs font-mono tracking-wider uppercase">{label}</div>
            <div className="mt-2 font-mono text-3xl font-bold text-ink">{val}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="font-serif text-2xl">Recent System Audit Logs</h2>
            <Link to="/app/admin/activity" className="text-xs font-bold text-ink hover:text-terra">
              View full activity →
            </Link>
          </div>

          <div className="space-y-4">
            {activity.slice(0, 5).map((act, i) => (
              <div key={act._id || i} className="flex gap-4 items-start text-sm pb-3 border-b border-line last:border-0 last:pb-0">
                <span className="font-mono text-xs text-muted shrink-0 pt-0.5">
                  {new Date(act.timestamp).toLocaleTimeString()}
                </span>
                <div>
                  <div className="font-medium text-ink font-mono">{act.eventType}</div>
                  <div className="text-xs text-muted mt-0.5">Actor: {act.actorEmail || 'System'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="card p-6 space-y-5">
          <h2 className="font-serif text-2xl">System Operational Status</h2>
          <div className="rounded-xl border border-line bg-paper p-4 text-xs text-muted space-y-2">
            <b className="text-ink block font-semibold">MongoDB Backend Status</b>
            <p>All security endpoints operational. Atomic single-vote locks active.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function AdminUsers() {
  const { showToast } = useToast();
  const [usersList, setUsersList] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspendModal, setSuspendModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers();
      setUsersList(res.users || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUserStatus = async () => {
    if (!selectedUser) return;
    const nextStatus = selectedUser.status === 'suspended' ? 'active' : 'suspended';
    try {
      await adminAPI.updateUserStatus(selectedUser._id, nextStatus);
      showToast(`User ${selectedUser.name} status updated to ${nextStatus}`);
      setSuspendModal(false);
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  let filtered = usersList;
  if (search.trim()) {
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="System Administration" title="User Management" />
      <AdminNavigation />

      <div className="relative flex items-center max-w-md mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10 shrink-0" size={18} />
        <input
          className="field"
          style={{ paddingLeft: '2.75rem' }}
          placeholder="Search user name or email address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="card p-8 text-center font-mono">Loading platform users…</div>
      ) : filtered.length ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-warm shadow-sm">
          <div className="hidden grid-cols-[1.5fr_1.5fr_1fr_1fr_.8fr] gap-4 border-b border-line bg-paper px-6 py-3.5 text-xs font-mono font-bold text-muted md:grid">
            <span>USER NAME</span>
            <span>EMAIL</span>
            <span>ROLE</span>
            <span>STATUS</span>
            <span className="text-right">ACTIONS</span>
          </div>

          {filtered.map((u) => (
            <div
              key={u._id}
              className="grid gap-3 border-b border-line p-5 transition-colors hover:bg-paper md:grid-cols-[1.5fr_1.5fr_1fr_1fr_.8fr] md:items-center"
            >
              <div>
                <b className="font-semibold text-ink leading-snug block">{u.name}</b>
              </div>
              <span className="font-mono text-sm text-ink truncate">{u.email}</span>
              <div><RoleBadge role={u.role} /></div>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${
                    u.status === 'active' ? 'border-olive/30 bg-olive/10 text-olive' : 'border-terra/30 bg-terra/10 text-terra'
                  }`}
                >
                  {u.status}
                </span>
              </div>
              <div className="text-right">
                <Button
                  variant="secondary"
                  className="text-xs py-1.5 px-3"
                  onClick={() => {
                    setSelectedUser(u);
                    setSuspendModal(true);
                  }}
                >
                  {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <State type="empty" title="No users found" text="Try adjusting your search query." />
      )}

      <ConfirmModal
        open={suspendModal}
        title={selectedUser?.status === 'suspended' ? 'Reactivate user?' : 'Suspend user account?'}
        onClose={() => setSuspendModal(false)}
        onConfirm={toggleUserStatus}
        confirm={selectedUser?.status === 'suspended' ? 'Reactivate' : 'Suspend account'}
      >
        Are you sure you want to {selectedUser?.status === 'suspended' ? 'reactivate' : 'suspend'}{' '}
        <b>{selectedUser?.name}</b> ({selectedUser?.email})?
      </ConfirmModal>
    </section>
  );
}

export function AdminPolls() {
  const nav = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminAPI.getAllPolls();
        setPolls(res.polls || []);
      } catch (err) {
        console.warn('Failed to load system polls:', err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="System Administration" title="System-Wide Poll Management" />
      <AdminNavigation />

      {loading ? (
        <div className="card p-8 text-center font-mono">Loading system polls…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-warm shadow-sm">
          <div className="hidden grid-cols-[2fr_1fr_.8fr_.6fr] gap-4 border-b border-line bg-paper px-6 py-3.5 text-xs font-mono font-bold text-muted md:grid">
            <span>QUESTION</span>
            <span>CREATOR</span>
            <span>STATUS</span>
            <span className="text-right">ACTION</span>
          </div>

          {polls.map((p) => (
            <div key={p._id} className="grid gap-3 border-b border-line p-5 transition-colors hover:bg-paper md:grid-cols-[2fr_1fr_.8fr_.6fr] md:items-center">
              <b>{p.title}</b>
              <span className="font-mono text-sm">{p.organizerName}</span>
              <div><Status>{p.status}</Status></div>
              <div className="text-right">
                <Button variant="secondary" className="text-xs" onClick={() => nav(`/app/polls/${p._id}`)}>
                  Inspect
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function AdminPollDetail() { return null; }
export function AdminActivity() { return null; }
export function AdminSettings() { return null; }
