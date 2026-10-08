import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { polls, getPollById } from '../data/polls';
import { SystemState } from './SystemStatePages';
import { Button, PageHeader, Status, SearchFilter, ResultBars, State } from '../components/UI';
import { Archive, ShieldCheck, CheckCircle2, ChevronRight, Lock } from 'lucide-react';

export function ArchiveList({ empty = false }) {
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date');

  if (empty) {
    return (
      <>
        <PageHeader eyebrow="Public record" title="Archive" />
        <State
          type="empty"
          title="No archived polls yet"
          text="When polls complete their voting period, their final tallies will appear here in the public archive."
          action="Create your first poll"
          onAction={() => nav('/app/polls/create')}
        />
      </>
    );
  }

  let list = polls;
  if (filter === 'CLOSED') list = list.filter((p) => p.status === 'CLOSED');
  if (filter === 'OPEN') list = list.filter((p) => p.status === 'OPEN');

  if (search.trim()) {
    list = list.filter((p) => p.question.toLowerCase().includes(search.toLowerCase()));
  }

  if (sort === 'votes') {
    list = [...list].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  } else if (sort === 'question') {
    list = [...list].sort((a, b) => a.question.localeCompare(b.question));
  }

  return (
    <>
      <PageHeader
        eyebrow="Public Record"
        title="Public Poll Archive"
      />

      <SearchFilter
        placeholder="Search public archive by topic or question…"
        searchVal={search}
        onSearchChange={setSearch}
        sortVal={sort}
        onSortChange={setSort}
        filterVal={filter}
        onFilterChange={setFilter}
      />

      {list.length ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-warm shadow-sm">
          <div className="hidden grid-cols-[2fr_.8fr_.8fr_.9fr_.5fr] gap-4 border-b border-line bg-paper px-6 py-3.5 text-xs font-mono font-bold text-muted md:grid">
            <span>POLL QUESTION</span>
            <span>STATUS</span>
            <span>PARTICIPATION</span>
            <span>LEADING RESULT</span>
            <span className="text-right">ACTION</span>
          </div>

          {list.map((p) => {
            const leader = [...p.options].sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
            return (
              <div
                key={p.id}
                className="grid gap-3 border-b border-line p-5 transition-colors hover:bg-paper md:grid-cols-[2fr_.8fr_.8fr_.9fr_.5fr] md:items-center"
              >
                <div>
                  <b className="font-semibold text-ink leading-snug block">{p.question}</b>
                  <div className="mt-1 font-mono text-xs text-muted flex items-center gap-2">
                    <span>{p.closes}</span>
                    <span>•</span>
                    <span>{p.owner}</span>
                  </div>
                </div>

                <div>
                  <Status>{p.status}</Status>
                </div>

                <span className="font-mono text-sm font-medium text-ink">
                  {p.votes ? p.votes.toLocaleString() : 0} votes
                </span>

                <div>
                  <b className="text-ink text-sm block">{leader[0]}</b>
                  <div className="font-mono text-xs text-muted">{leader[1]}% lead</div>
                </div>

                <div className="text-right">
                  <Button
                    variant="secondary"
                    className="text-xs py-1.5 px-3"
                    onClick={() => nav(`/archive/${p.id}`)}
                  >
                    View Record
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <State
          type="empty"
          title="No search results"
          text="Try adjusting your search query or clearing filter choices."
          action="Clear search"
          onAction={() => {
            setSearch('');
            setFilter('all');
          }}
        />
      )}
    </>
  );
}

export function ArchivedPoll() {
  const { id } = useParams();
  const nav = useNavigate();
  const poll = getPollById(id);

  if (!poll) {
    return <SystemState type="notfound" />;
  }

  return (
    <section className="mx-auto max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/archive" className="text-sm font-bold text-muted hover:text-ink">
          ← Back to Public Archive
        </Link>
        <span className="rounded-full border border-olive/30 bg-olive/10 px-3 py-1 font-mono text-xs font-bold text-olive flex items-center gap-1.5">
          <ShieldCheck size={14} />
          ARCHIVED POLL RECORD
        </span>
      </div>

      <div className="card p-6 md:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Status>CLOSED</Status>
            <span className="font-mono text-xs text-muted">Archived Poll Record</span>
          </div>
          <h1 className="font-serif text-4xl leading-tight">{poll.question}</h1>
          {poll.description && <p className="mt-3 text-muted leading-relaxed">{poll.description}</p>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-y border-line py-5">
          <div>
            <div className="label">Final Participation</div>
            <div className="mt-1 font-mono text-3xl font-bold text-ink">
              {poll.votes ? poll.votes.toLocaleString() : 0}
            </div>
          </div>

          <div>
            <div className="label">Closed Schedule</div>
            <div className="mt-1.5 font-medium text-sm text-ink">{poll.closes}</div>
          </div>

          <div>
            <div className="label">Publisher</div>
            <div className="mt-1.5 font-medium text-sm text-ink">{poll.owner}</div>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl mb-4">Final Poll Results</h3>
          <ResultBars poll={poll} />
        </div>
      </div>
    </section>
  );
}
