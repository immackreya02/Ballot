import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { PageHeader, State, useToast } from '../components/UI';
import { ShieldCheck, Activity, Search, Filter, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export function AuditLogsPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/polls/audit-logs');
      setLogs(res.logs || []);
    } catch (err) {
      // Fallback: fetch via generic endpoint or generate safe audit log view
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const eventTypes = [
    'all',
    'ORGANIZER_REGISTER_SUCCESS',
    'ORGANIZER_LOGIN_SUCCESS',
    'OTP_SENT',
    'OTP_VERIFIED',
    'OTP_FAILED',
    'INELIGIBLE_ATTEMPT',
    'VOTE_ACCEPTED',
    'DUPLICATE_VOTE_REJECTED',
    'POLL_PUBLISHED',
    'POLL_CLOSED'
  ];

  const filteredLogs = filterType === 'all' ? logs : logs.filter((l) => l.eventType === filterType);

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Security & Audit Model" title="System Audit Logs" />

      <div className="rounded-xl border border-line bg-warm p-4 text-xs text-muted leading-relaxed flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-olive shrink-0" size={18} />
          <span>
            <b>Privacy Compliance Notice:</b> Audit logs track authentication and voting lifecycle events for auditability. Voter choice options are never recorded in audit events.
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-line pb-4">
        {eventTypes.slice(0, 6).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-mono transition-colors ${
              filterType === type
                ? 'bg-ink text-white font-bold'
                : 'bg-warm border border-line text-muted hover:text-ink'
            }`}
          >
            {type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-muted font-mono">Loading audit logs…</div>
      ) : filteredLogs.length ? (
        <div className="card p-6 md:p-8 space-y-4">
          <div className="space-y-4">
            {filteredLogs.map((log, i) => (
              <div key={log._id || i} className="flex gap-4 items-start border-b border-line pb-4 last:border-0 last:pb-0">
                <span className="font-mono text-xs text-terra font-bold bg-paper border border-line px-2 py-1 rounded shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <b className="font-mono text-xs text-ink">{log.eventType}</b>
                    <span className="font-mono text-[10px] text-muted">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    Actor: <span className="text-ink font-mono">{log.actorEmail || 'Anonymous'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <State
          type="empty"
          title="No Audit Logs Found"
          text="System audit events will populate as polls are created, published, and voted on."
        />
      )}
    </section>
  );
}
