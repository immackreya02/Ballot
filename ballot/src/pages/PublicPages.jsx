import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Logo, useToast } from '../components/UI';
import { voterAPI } from '../services/api';
import {
  ShieldCheck,
  Eye,
  CheckCircle2,
  LockKeyhole,
  Share2,
  UserCheck,
  BarChart3,
  Archive,
  ArrowRight,
  KeyRound,
  FileSpreadsheet,
  Users,
  Sparkles
} from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pollCode, setPollCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinPoll = async (e) => {
    e?.preventDefault();
    if (!pollCode || !pollCode.trim()) {
      showToast('Please enter a Poll Code (e.g. BLT-2026)', 'error');
      return;
    }

    const cleanCode = pollCode.toUpperCase().trim();
    setLoading(true);
    try {
      const res = await voterAPI.getPollInfo(cleanCode);
      showToast(`Found poll: ${res.poll.title}`);
      navigate(`/vote?code=${cleanCode}`);
    } catch (err) {
      showToast(err.message || 'Poll Code not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      step: '01',
      title: 'Organizer Defines Electorate',
      description: 'Create a poll, set candidate choices, and import specific eligible voter emails or reuse a saved Voter Group.',
      icon: <FileSpreadsheet className="text-terra" size={24} />
    },
    {
      step: '02',
      title: 'Email OTP Authentication',
      description: 'Voters access the poll via Poll Code or link. 6-digit OTP verification codes are sent strictly to accredited emails.',
      icon: <UserCheck className="text-terra" size={24} />
    },
    {
      step: '03',
      title: 'Anonymous Single Vote & Live Tally',
      description: 'Atomic MongoDB locks guarantee one vote per person. Votes are stored decoupled from identity with live Socket.io tallies.',
      icon: <CheckCircle2 className="text-terra" size={24} />
    }
  ];

  return (
    <div className="space-y-16 py-8 md:py-12">
      {/* 1. HERO SECTION WITH DUAL GATEWAY (VOTER VS ORGANIZER) */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-warm px-3.5 py-1 text-xs font-mono font-medium text-muted">
            <Sparkles size={14} className="text-terra" /> Secure Online Voting Platform
          </div>

          <h1 className="font-serif text-5xl leading-[1.05] md:text-7xl">
            High-trust voting for every organization.
          </h1>

          <p className="text-lg leading-relaxed text-muted max-w-2xl mx-auto">
            Restricted, eligibility-based polling with email OTP authentication, atomic one-vote protection, and secret ballot privacy.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 pt-4">
          {/* VOTER GATEWAY CARD */}
          <div className="card p-8 shadow-xl bg-warm border-2 border-line space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="label text-terra">Voter Portal</span>
                <span className="rounded-full bg-olive/15 text-olive border border-olive/30 px-3 py-1 font-mono text-[11px] font-bold">
                  NO ACCOUNT REQUIRED
                </span>
              </div>

              <div>
                <h2 className="font-serif text-3xl">Voting in a Poll?</h2>
                <p className="mt-1 text-sm text-muted">
                  Enter your Poll Code below to access your ballot. You only need your authorized email — no password or account registration needed!
                </p>
              </div>

              <form onSubmit={handleJoinPoll} className="space-y-4 pt-2">
                <div>
                  <label className="label block mb-1">Enter Poll Code</label>
                  <input
                    required
                    className="field font-mono text-2xl tracking-wider uppercase text-center py-3.5 bg-paper font-bold text-ink"
                    placeholder="BLT-2026"
                    value={pollCode}
                    onChange={(e) => setPollCode(e.target.value.toUpperCase())}
                  />
                </div>

                <Button type="submit" className="w-full py-3.5 text-base" disabled={loading}>
                  {loading ? 'Verifying Code…' : 'Enter Voter Portal & Request OTP →'}
                </Button>
              </form>
            </div>

            <div className="rounded-xl border border-line bg-paper p-4 text-xs text-muted leading-relaxed">
              <b className="text-ink block font-semibold mb-1">How Voters Authenticate:</b>
              You will verify your identity using a 6-digit OTP sent to your authorized email address.
            </div>
          </div>

          {/* ORGANIZER WORKSPACE CARD */}
          <div className="card p-8 shadow-xl bg-paper border-2 border-line space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="label">Organizer Workspace</span>
                <span className="rounded-full bg-warm text-ink border border-line px-3 py-1 font-mono text-[11px] font-bold">
                  POLL MANAGEMENT
                </span>
              </div>

              <div>
                <h2 className="font-serif text-3xl">Hosting an Election?</h2>
                <p className="mt-1 text-sm text-muted">
                  Sign in to create polls, manage voter groups, lock eligible electorates, and monitor live, real-time results.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Button onClick={() => navigate('/login')} className="w-full py-3.5 text-base">
                  Organizer Sign In →
                </Button>
                <Button variant="secondary" onClick={() => navigate('/signup')} className="w-full py-3.5 text-base">
                  Create Organizer Account
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-warm p-4 text-xs text-muted leading-relaxed space-y-2">
              <b className="text-ink block font-semibold">Organizer Privileges:</b>
              <div className="grid gap-1 font-mono text-[11px]">
                <span>✓ Create & lock electorate email lists</span>
                <span>✓ Real-time Socket.io ballot tallies</span>
                <span>✓ Downloadable security audit logs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="border-y border-line bg-warm py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="label">Simple & Secure Process</p>
            <h2 className="font-serif text-4xl md:text-5xl">How BALLOT Works</h2>
            <p className="text-muted text-base">
              A streamlined 3-step workflow designed for organizers and delegates.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="card p-8 space-y-4 flex flex-col justify-between hover:border-ink/40 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-paper">
                      {s.icon}
                    </div>
                    <span className="font-mono text-xl font-bold text-terra">{s.step}</span>
                  </div>
                  <h3 className="font-serif text-2xl">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECURITY & PRIVACY PILLARS */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="label">Built-in Security Model</p>
          <h2 className="font-serif text-4xl md:text-5xl">Core Security & Privacy</h2>
          <p className="text-muted text-base">
            Engineered to guarantee election integrity, single-vote fairness, and secret ballot privacy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="card p-6 md:p-8 space-y-3">
            <div className="flex items-center gap-2 text-olive">
              <ShieldCheck size={24} />
              <h3 className="font-serif text-xl text-ink">Secret Ballot Privacy</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Voter authorization records and anonymous ballots are stored in separate MongoDB collections. No database link exists connecting a voter email to candidate selection.
            </p>
          </div>

          <div className="card p-6 md:p-8 space-y-3">
            <div className="flex items-center gap-2 text-terra">
              <LockKeyhole size={24} />
              <h3 className="font-serif text-xl text-ink">Atomic Concurrency Lock</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Atomic state updates (`isUsed: true`) guarantee that concurrent parallel vote attempts from the same delegate result in exactly one accepted vote.
            </p>
          </div>

          <div className="card p-6 md:p-8 space-y-3">
            <div className="flex items-center gap-2 text-ink">
              <BarChart3 size={24} />
              <h3 className="font-serif text-xl text-ink">Real-Time Tally Broadcasting</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Live poll tallies update instantaneously via WebSockets directly from authoritative ballot records, matching the organizer's configured visibility mode.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="card p-8 md:p-12 text-center bg-warm border-2 border-line space-y-6">
          <h2 className="font-serif text-4xl md:text-5xl">Ready to host your next election?</h2>
          <p className="max-w-xl mx-auto text-muted text-base">
            Create an organizer account, build custom voter groups, and run secure, eligibility-based polls in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button onClick={() => navigate('/login')} className="py-3 px-8 text-base">
              Sign In to Workspace →
            </Button>
            <Button variant="secondary" onClick={() => navigate('/signup')} className="py-3 px-8 text-base">
              Register Organizer Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function HowItWorks() {
  return <Landing />;
}

export function SecurityInfo() {
  return <Landing />;
}

export function TransparencyInfo() {
  return <Landing />;
}
