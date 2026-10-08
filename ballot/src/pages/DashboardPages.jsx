import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { pollAPI } from '../services/api';
import { Button, PageHeader, PollCard, SearchFilter, State } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { Plus, Save, BarChart3, CheckCircle2, FileText, Vote } from 'lucide-react';

export function Dashboard() {
  const nav = useNavigate();
  const { user } = useAuth();
  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await pollAPI.getAll();
        setPolls(res.polls || []);
      } catch (err) {
        console.warn('Could not load organizer polls:', err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activePolls = polls.filter((p) => p.status === 'OPEN');
  const draftPolls = polls.filter((p) => p.status === 'DRAFT');
  const closedPolls = polls.filter((p) => p.status === 'CLOSED' || p.status === 'ARCHIVED');
  const totalParticipation = polls.reduce((acc, p) => acc + (p.totalVotes || 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Poll Publisher Workspace"
        title={`Good day, ${user?.name || 'Organizer'}.`}
      >
        {isOrganizer && (
          <Button onClick={() => nav('/app/polls/create')}>
            <Plus size={17} />
            Create poll
          </Button>
        )}
      </PageHeader>

      {/* Summary Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Active open polls', activePolls.length.toString().padStart(2, '0')],
          ['Draft polls', draftPolls.length.toString().padStart(2, '0')],
          ['Closed & Archived', closedPolls.length.toString().padStart(2, '0')],
          ['Total participation', totalParticipation.toLocaleString()]
        ].map(([a, b]) => (
          <div className="card p-5" key={a}>
            <div className="text-muted text-sm">{a}</div>
            <div className="mt-3 font-mono text-3xl font-bold text-ink">{b}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Overview */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="card p-6 space-y-5">
          <h2 className="font-serif text-3xl">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button onClick={() => nav('/app/polls/create')}>
              <Plus size={16} />
              New poll
            </Button>
            <Button variant="secondary" onClick={() => nav('/app/polls/drafts')}>
              <Save size={16} />
              Open drafts
            </Button>
            <Button variant="secondary" onClick={() => nav('/app/polls')}>
              <FileText size={16} />
              Manage all polls
            </Button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-serif text-2xl">Participation overview</h2>
          <p className="mt-2 text-muted text-sm">
            Total voter ballots recorded across your published polls: <b>{totalParticipation}</b>
          </p>
        </div>
      </section>
    </>
  );
}

export function PollList({ mode = 'all' }) {
  const nav = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';

  let activeTab = mode;
  if (location.pathname.endsWith('/active')) activeTab = 'active';
  if (location.pathname.endsWith('/drafts')) activeTab = 'drafts';
  if (location.pathname.endsWith('/closed')) activeTab = 'closed';

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState(
    activeTab === 'active'
      ? 'OPEN'
      : activeTab === 'drafts'
      ? 'DRAFT'
      : activeTab === 'closed'
      ? 'CLOSED'
      : 'all'
  );
  const [sortVal, setSortVal] = useState('date');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await pollAPI.getAll();
        setPolls(res.polls || []);
      } catch (err) {
        console.warn('Failed to load polls:', err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  let filteredList = polls;

  if (activeTab === 'active') {
    filteredList = filteredList.filter((p) => p.status === 'OPEN');
  } else if (activeTab === 'drafts') {
    filteredList = filteredList.filter((p) => p.status === 'DRAFT');
  } else if (activeTab === 'closed') {
    filteredList = filteredList.filter((p) => p.status === 'CLOSED' || p.status === 'ARCHIVED');
  }

  if (filterVal !== 'all' && activeTab === 'all') {
    filteredList = filteredList.filter((p) => p.status === filterVal);
  }

  if (searchVal.trim()) {
    filteredList = filteredList.filter(
      (p) =>
        p.title.toLowerCase().includes(searchVal.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchVal.toLowerCase())) ||
        p.pollCode.toLowerCase().includes(searchVal.toLowerCase())
    );
  }

  const tabLinks = [
    { label: 'All Polls', path: '/app/polls', key: 'all' },
    { label: 'Active', path: '/app/polls/active', key: 'active' },
    { label: 'Drafts', path: '/app/polls/drafts', key: 'drafts' },
    { label: 'Closed & Archived', path: '/app/polls/closed', key: 'closed' }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Poll workspace"
        title={
          activeTab === 'active'
            ? 'Active open polls'
            : activeTab === 'drafts'
            ? 'Draft polls'
            : activeTab === 'closed'
            ? 'Closed & Archived polls'
            : 'My polls'
        }
      >
        {isOrganizer && (
          <Button onClick={() => nav('/app/polls/create')}>
            <Plus size={16} />
            Create poll
          </Button>
        )}
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-4">
        {tabLinks.map((tab) => (
          <Link
            key={tab.key}
            to={tab.path}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-ink text-white font-semibold'
                : 'bg-warm border border-line text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <SearchFilter
        placeholder="Search title, Poll Code or description…"
        searchVal={searchVal}
        onSearchChange={setSearchVal}
        sortVal={sortVal}
        onSortChange={setSortVal}
        filterVal={filterVal}
        onFilterChange={setFilterVal}
      />

      {loading ? (
        <div className="card p-8 text-center font-mono">Loading polls…</div>
      ) : filteredList.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredList.map((p) => {
            const mappedPoll = {
              id: p._id,
              question: p.title,
              status: p.status,
              votes: p.totalVotes || 0,
              owner: p.organizerName,
              closes: p.endAt ? new Date(p.endAt).toLocaleString() : 'No end date',
              options: p.options ? p.options.map((o) => [o.optionText, o.voteCount]) : []
            };
            return (
              <PollCard
                key={p._id}
                poll={mappedPoll}
                onOpen={() => nav(`/app/polls/${p._id}`)}
              />
            );
          })}
        </div>
      ) : (
        <State
          type="empty"
          title="No matching polls found"
          text="Create a new poll or adjust your search filter options."
          action="Create poll"
          onAction={() => nav('/app/polls/create')}
        />
      )}
    </>
  );
}
