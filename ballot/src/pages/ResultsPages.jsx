import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { voterAPI } from '../services/api';
import { SystemState } from './SystemStatePages';
import { io } from 'socket.io-client';
import {
  Button,
  Status,
  ResultBars,
  PollManagementNavigation,
  useToast
} from '../components/UI';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Download, ShieldCheck, Activity, CheckCircle2, Clock, Users } from 'lucide-react';

const PALETTE = ['#171717', '#C94B36', '#66745C', '#D8A84E'];

export function PollResults({ closed = false }) {
  const { id } = useParams();
  const { showToast } = useToast();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadResults = async () => {
    try {
      const res = await voterAPI.getResults(id);
      setResults(res);
    } catch (err) {
      console.warn('Could not load results:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();

    // Socket.io Real-Time Results Connection
    const socketHost = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);
    const socket = io(socketHost);
    socket.emit('join-poll', id);

    socket.on('vote-updated', (data) => {
      console.log('[Socket.io] Real-time vote update received:', data);
      loadResults();
    });

    return () => {
      socket.emit('leave-poll', id);
      socket.disconnect();
    };
  }, [id]);

  if (loading) {
    return <div className="card p-8 text-center font-mono">Loading verified results…</div>;
  }

  if (!results) {
    return <SystemState type="notfound" />;
  }

  const isClosed = closed || results.status === 'CLOSED';
  const totalVotes = results.totalVotes || 0;
  const sorted = [...(results.tallies || [])].sort((a, b) => b.pct - a.pct);
  const leader = sorted[0] || { optionText: 'No votes cast', pct: 0 };
  const runnerUp = sorted[1];
  const margin = runnerUp ? (leader.pct - runnerUp.pct).toFixed(1) : leader.pct;

  const chartData = (results.tallies || []).map((t) => ({
    name: t.optionText,
    votes: t.votes,
    pct: t.pct
  }));

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Option,Percentage,Vote Count\n' +
      (results.tallies || []).map((t) => `"${t.optionText}",${t.pct},${t.votes}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${results.pollId}-results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Results CSV exported successfully!');
  };

  return (
    <section className="mx-auto max-w-5xl py-4 space-y-6">
      <PollManagementNavigation pollId={results.pollId} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Status live={!isClosed}>{isClosed ? 'FINAL RESULTS' : 'LIVE SOCKET TALLY'}</Status>
            <span className="font-mono text-xs text-muted">Updated in real-time</span>
          </div>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl leading-tight">{results.title}</h1>
        </div>

        <div className="card p-4 text-right min-w-44">
          <div className="label">Authoritative Ballots</div>
          <div className="mt-1 font-mono text-3xl font-bold text-ink">{totalVotes.toLocaleString()}</div>
          <div className="text-xs text-muted">votes recorded</div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-warm p-6 text-sm text-muted leading-relaxed flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <b className="text-ink font-serif text-lg block mb-1">Result Overview & Participation Rate</b>
          <p>
            Leading choice: <b className="text-ink">{leader.optionText}</b> with <b>{leader.pct}%</b> of total votes.
            <span> Electorate Participation Rate: <b>{results.participationRate}%</b> ({totalVotes} / {results.totalEligible} eligible).</span>
          </p>
        </div>
        <Button variant="secondary" className="shrink-0 text-xs" onClick={handleExportCSV}>
          <Download size={15} />
          Export CSV
        </Button>
      </div>

      <div className="card p-6 md:p-8 space-y-8">
        <h3 className="font-serif text-2xl">Visual Vote Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#74736E' }}
                interval={0}
                tickFormatter={(val) => (val.length > 20 ? val.substring(0, 18) + '…' : val)}
              />
              <YAxis tick={{ fontSize: 11, fill: '#74736E' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFCF6',
                  borderColor: '#D6D0C5',
                  borderRadius: 12,
                  fontFamily: 'DM Sans, sans-serif'
                }}
              />
              <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border-t border-line pt-6 space-y-4">
          <h3 className="font-serif text-2xl mb-4">Percentage Breakdown</h3>
          {(results.tallies || []).map((t, i) => (
            <div key={t.id}>
              <div className="mb-2 flex justify-between gap-3 text-sm">
                <div className="flex gap-3 items-center">
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-medium text-ink">{t.optionText}</span>
                </div>
                <div className="font-mono text-sm">
                  <b className="text-ink">{t.pct}%</b>
                  <span className="ml-3 text-muted">{t.votes.toLocaleString()} votes</span>
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-paper border border-line">
                <div className="h-full bg-ink transition-all duration-700" style={{ width: `${t.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



export function PollActivity() {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await apiRequest(`/polls/${id}/audit-logs`);
        setLogs(res.logs || []);
      } catch (err) {
        // Fallback to empty if endpoint not specific
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [id]);

  return (
    <section className="mx-auto max-w-4xl py-4 space-y-6">
      <PollManagementNavigation pollId={id} />

      <div className="card p-6 md:p-8 space-y-6">
        <div>
          <h1 className="font-serif text-3xl">Poll Audit Timeline</h1>
          <p className="text-muted text-sm leading-relaxed mt-1">
            Immutable audit record of all lifecycle, electorate locking, and voting verification events for this poll.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 font-mono text-sm text-muted">Loading poll activity timeline…</div>
        ) : logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log, index) => {
              const isVote = log.eventType === 'VOTE_ACCEPTED';
              const isOtp = log.eventType.startsWith('OTP');
              const isPublish = log.eventType === 'POLL_PUBLISHED';
              const isClosed = log.eventType === 'POLL_CLOSED';

              const badgeColor = isVote || log.eventType === 'OTP_VERIFIED'
                ? 'bg-olive/15 text-olive border-olive/30'
                : isPublish
                ? 'bg-terra/15 text-terra border-terra/30'
                : isClosed
                ? 'bg-ink/10 text-ink border-line'
                : 'bg-warm text-muted border-line';

              return (
                <div key={log._id || index} className="flex items-start gap-4 pb-4 border-b border-line last:border-0">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="font-mono text-xs font-bold bg-paper border border-line px-2.5 py-1 rounded text-ink shadow-2xs">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="font-mono text-[10px] text-muted mt-1">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-bold border ${badgeColor}`}>
                        {log.eventType}
                      </span>
                      {log.metadata?.ballotId && (
                        <span className="font-mono text-[11px] text-muted bg-paper border border-line px-2 py-0.5 rounded">
                          Receipt: {String(log.metadata.ballotId).slice(-8)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1.5">
                      Actor: <span className="font-mono font-medium text-ink">{log.actorEmail || 'System/Anonymous'}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-warm p-6 text-center text-xs text-muted font-mono">
            Poll lifecycle events will populate as voters request OTPs and submit ballots.
          </div>
        )}
      </div>
    </section>
  );
}
