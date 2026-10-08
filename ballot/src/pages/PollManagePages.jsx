import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { pollAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SystemState } from './SystemStatePages';
import {
  Button,
  Status,
  PageHeader,
  ResultBars,
  ConfirmModal,
  PollManagementNavigation,
  QRCodeSVG,
  useToast
} from '../components/UI';
import {
  Share2,
  Copy,
  BarChart3,
  Edit3,
  XCircle,
  Trash2,
  ExternalLink,
  Users,
  CheckCircle2,
  Clock,
  Lock,
  Vote
} from 'lucide-react';

export function PollDetails() {
  const nav = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [poll, setPoll] = useState(null);
  const [electorate, setElectorate] = useState([]);
  const [loading, setLoading] = useState(true);

  const [closeModal, setCloseModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const loadPoll = async () => {
    setLoading(true);
    try {
      const res = await pollAPI.getById(id);
      setPoll(res.poll);
      setElectorate(res.electorate || []);
    } catch (err) {
      console.warn('Could not load poll details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoll();
  }, [id]);

  const handleClosePoll = async () => {
    try {
      await pollAPI.close(poll._id);
      setCloseModal(false);
      showToast('Poll closed successfully');
      loadPoll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePoll = async () => {
    try {
      await pollAPI.archive(poll._id);
      setDeleteModal(false);
      showToast('Poll archived');
      nav('/app/polls');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div className="card p-8 text-center font-mono">Loading poll details…</div>;
  }

  if (!poll) {
    return <SystemState type="notfound" />;
  }

  const isOwner = user?.role === 'admin' || user?.id === poll.organizerId;
  const pollVoterUrl = `${window.location.origin}/vote?code=${poll.pollCode}`;

  return (
    <>
      <PageHeader eyebrow={`Poll Code: ${poll.pollCode}`} title={poll.title}>
        <Button onClick={() => nav(`/app/polls/${poll._id}/share`)}>
          <Share2 size={16} />
          Share & Invitations
        </Button>
      </PageHeader>

      <PollManagementNavigation pollId={poll._id} />

      <div className="grid gap-6 lg:grid-cols-[1fr_.65fr]">
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <Status>{poll.status}</Status>
              <span className="font-mono text-xs text-muted">CODE: {poll.pollCode}</span>
            </div>
            <Link
              to={`/vote?code=${poll.pollCode}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-bold text-ink hover:text-terra"
            >
              Open public voter portal <ExternalLink size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-line pb-6">
            <div>
              <div className="label">Total Participation</div>
              <div className="mt-1 font-mono text-3xl font-bold text-ink">
                {poll.totalVotes ? poll.totalVotes.toLocaleString() : 0}
              </div>
              <div className="text-xs text-muted">authoritative ballots</div>
            </div>

            <div>
              <div className="label">Electorate Size</div>
              <div className="mt-1.5 font-mono text-xl font-bold text-ink">{poll.totalEligibleCount || 0}</div>
              <div className="text-xs text-muted">eligible voters</div>
            </div>

            <div>
              <div className="label">Result Visibility</div>
              <div className="mt-1.5 font-mono text-sm font-bold text-ink">{poll.resultVisibility}</div>
              <div className="text-xs text-muted">mode</div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-2xl">Verified Ballot Tallies</h3>
              <Link to={`/app/polls/${poll._id}/results`} className="text-xs font-bold text-terra hover:underline">
                View detailed analytics →
              </Link>
            </div>
            
            <div className="space-y-4">
              {poll.options.map((opt) => {
                const pct = poll.totalVotes > 0 ? Number((opt.voteCount / poll.totalVotes * 100).toFixed(1)) : 0;
                return (
                  <div key={opt._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-ink">{opt.optionText}</span>
                      <span className="font-mono">{pct}% ({opt.voteCount} votes)</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-paper border border-line">
                      <div className="h-full bg-ink transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="card h-fit p-6 space-y-6">
          <h2 className="font-serif text-2xl">Poll Actions</h2>

          <div className="grid gap-3">
            <Button onClick={() => nav(`/app/polls/${poll._id}/results`)}>
              <BarChart3 size={16} />
              Live Results
            </Button>
            <Button variant="secondary" onClick={() => nav(`/app/polls/${poll._id}/share`)}>
              <Share2 size={16} />
              Share & Invitations
            </Button>

            {isOwner && poll.status === 'OPEN' && (
              <Button variant="secondary" onClick={() => setCloseModal(true)}>
                <XCircle size={16} />
                Close Poll
              </Button>
            )}

            {isOwner && (
              <Button
                variant="secondary"
                className="text-terra border-terra/30 hover:bg-terra/10"
                onClick={() => setDeleteModal(true)}
              >
                <Trash2 size={16} />
                Archive Poll
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-line bg-paper p-4 text-xs text-muted space-y-2">
            <b className="text-ink block">Audit Trail Info:</b>
            <p>Created on {new Date(poll.createdAt).toLocaleDateString()} by {poll.organizerName}</p>
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={closeModal}
        title="Close this poll?"
        onClose={() => setCloseModal(false)}
        onConfirm={handleClosePoll}
        confirm="Close Poll Now"
      >
        Closing this poll will prevent new votes from being accepted. The final tally will be locked and archived.
      </ConfirmModal>

      <ConfirmModal
        open={deleteModal}
        title="Archive this poll?"
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeletePoll}
        confirm="Archive Poll"
      >
        Are you sure you want to archive this poll?
      </ConfirmModal>
    </>
  );
}

export function Share() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [poll, setPoll] = useState(null);
  const [electorate, setElectorate] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await pollAPI.getById(id);
        setPoll(res.poll);
        setElectorate(res.electorate || []);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading || !poll) {
    return <div className="card p-8 text-center font-mono">Loading share details…</div>;
  }

  const pollCodeUrl = `${window.location.origin}/vote?code=${poll.pollCode}`;

  const copyToClipboard = (text, label = 'Link') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    showToast(`${label} copied to clipboard!`);
  };

  return (
    <section className="mx-auto max-w-4xl py-4 space-y-6">
      <PageHeader eyebrow={`Poll Code: ${poll.pollCode}`} title="Voter Invitations & Access" />

      <PollManagementNavigation pollId={poll._id} />

      <div className="grid gap-6 md:grid-cols-[1fr_.7fr]">
        <div className="card p-6 md:p-8 space-y-6">
          <div>
            <label className="label block mb-2">Direct Voter Access Link (Poll Code: {poll.pollCode})</label>
            <div className="flex gap-2">
              <input className="field font-mono text-sm font-bold text-ink" readOnly value={pollCodeUrl} />
              <Button onClick={() => copyToClipboard(pollCodeUrl, 'Voter link')}>
                <Copy size={16} />
                Copy
              </Button>
            </div>
          </div>

          <div className="border-t border-line pt-6">
            <h3 className="font-serif text-2xl mb-4">Locked Electorate Invitations ({electorate.length})</h3>
            <div className="rounded-xl border border-line bg-warm p-4 space-y-3 max-h-60 overflow-auto">
              {electorate.map((entry) => {
                const inviteUrl = `${window.location.origin}/vote?token=${entry.invitationToken}`;
                return (
                  <div key={entry._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs pb-2 border-b border-line last:border-0">
                    <div>
                      <b className="text-ink font-mono">{entry.email}</b>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(inviteUrl, `Invitation link for ${entry.email}`)}
                      className="text-terra font-semibold hover:underline mt-1 sm:mt-0"
                    >
                      Copy Individual Link Token →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="card p-6 flex flex-col items-center text-center space-y-4 bg-warm border-2 border-line">
          <div className="label">QR Code Access</div>
          <QRCodeSVG value={pollCodeUrl} size={180} />
          <p className="text-xs text-muted">Scan to open BALLOT voter portal with Poll Code {poll.pollCode}.</p>
        </aside>
      </div>
    </section>
  );
}
