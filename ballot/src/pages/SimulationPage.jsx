import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { Button, PageHeader, useToast } from '../components/UI';
import { ShieldCheck, Play, CheckCircle2, AlertTriangle, Clock, Activity, Cpu } from 'lucide-react';

export function SimulationPage() {
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState(null);

  const handleRunSimulation = async () => {
    setRunning(true);
    setReport(null);
    try {
      showToast('Executing 11 Security Test Scenarios on Backend…');
      const res = await apiRequest('/simulation/run', 'POST');
      setReport(res);
      showToast(`Simulation complete: ${res.summary.passed}/${res.summary.totalScenarios} Scenarios PASSED`);
    } catch (err) {
      showToast(err.message || 'Simulation execution failed.', 'error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Simulation & Security Testing Module" title="Automated Security Test Suite">
        <Button onClick={handleRunSimulation} disabled={running}>
          <Play size={16} />
          {running ? 'Running Scenarios…' : 'Run Full Security Simulation'}
        </Button>
      </PageHeader>

      <p className="text-muted text-sm max-w-3xl leading-relaxed">
        This simulation suite executes real backend service logic and database constraints against 11 security scenarios including ineligible access, wrong/expired OTPs, double-voting, forwarded invitation link exploits, and parallel concurrent vote attempts.
      </p>

      {/* SUMMARY METRICS BANNER */}
      {report && (
        <div className="grid gap-4 md:grid-cols-4 animate-in fade-in">
          <div className="card p-5 bg-warm border-2 border-line">
            <div className="text-muted text-xs font-mono uppercase">Total Scenarios Tested</div>
            <div className="mt-2 font-mono text-3xl font-bold text-ink">{report.summary.totalScenarios}</div>
          </div>
          <div className="card p-5 bg-olive/10 border border-olive/30">
            <div className="text-olive font-bold text-xs font-mono uppercase">Scenarios Passed</div>
            <div className="mt-2 font-mono text-3xl font-bold text-olive">{report.summary.passed} / {report.summary.totalScenarios}</div>
          </div>
          <div className="card p-5 bg-paper border border-line">
            <div className="text-muted text-xs font-mono uppercase">Duplicate Vote Acceptance</div>
            <div className="mt-2 font-mono text-3xl font-bold text-ink">{report.summary.duplicateVoteAcceptanceRate}</div>
            <div className="text-[11px] text-olive font-bold">TARGET: 0%</div>
          </div>
          <div className="card p-5 bg-paper border border-line">
            <div className="text-muted text-xs font-mono uppercase">Unauthorized Vote Acceptance</div>
            <div className="mt-2 font-mono text-3xl font-bold text-ink">{report.summary.unauthorizedVoteAcceptanceRate}</div>
            <div className="text-[11px] text-olive font-bold">TARGET: 0%</div>
          </div>
        </div>
      )}

      {/* SCENARIO RESULTS TABLE */}
      {report ? (
        <div className="card p-6 md:p-8 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-line pb-4">
            <h3 className="font-serif text-2xl">Scenario Execution Log</h3>
            <span className="font-mono text-xs text-muted">Executed in {report.summary.executionTimeMs} ms</span>
          </div>

          <div className="space-y-4">
            {report.scenarios.map((s) => (
              <div
                key={s.scenarioNumber}
                className={`p-4 rounded-xl border transition-all ${
                  s.status === 'PASS'
                    ? 'border-olive/30 bg-warm hover:border-olive'
                    : 'border-terra/40 bg-terra/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-terra bg-paper border border-line px-2 py-1 rounded">
                      #{String(s.scenarioNumber).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="font-semibold text-ink text-base">{s.name}</h4>
                      <p className="text-xs text-muted mt-0.5">{s.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-muted">{s.responseTimeMs} ms</span>
                    <span
                      className={`font-mono text-xs font-bold px-3 py-1 rounded-full uppercase border ${
                        s.status === 'PASS'
                          ? 'bg-olive text-white border-olive'
                          : 'bg-terra text-white border-terra'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-2 text-xs font-mono pt-3 border-t border-line/60">
                  <div>
                    <span className="text-muted block">EXPECTED RESULT:</span>
                    <span className="text-ink font-semibold">{s.expected}</span>
                  </div>
                  <div>
                    <span className="text-muted block">ACTUAL DATABASE RESULT:</span>
                    <span className={s.status === 'PASS' ? 'text-olive font-semibold' : 'text-terra font-semibold'}>
                      {s.actual}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center space-y-4 bg-warm border-2 border-dashed border-line">
          <Cpu size={48} className="mx-auto text-muted" />
          <h3 className="font-serif text-2xl">Security Simulation Engine Ready</h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            Click the button above to run real database constraint tests across all 11 security scenarios.
          </p>
          <Button onClick={handleRunSimulation} disabled={running}>
            <Play size={16} />
            {running ? 'Running Engine…' : 'Start Simulation Test Suite'}
          </Button>
        </div>
      )}
    </section>
  );
}
