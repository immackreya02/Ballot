import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { voterAPI } from '../services/api';
import { Button, Status, ResultBars, useToast } from '../components/UI';
import {
  LockKeyhole,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  BarChart3,
  ArrowRight
} from 'lucide-react';

export function VotingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const codeParam = searchParams.get('code') || '';
  const tokenParam = searchParams.get('token') || '';

  const [step, setStep] = useState(1); // 1: Email Input, 2: OTP Input, 3: Ballot, 4: Confirmation/Results
  const [pollInfo, setPollInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [voterToken, setVoterToken] = useState('');
  const [ballotOptions, setBallotOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch Poll Info on load
  useEffect(() => {
    async function loadInfo() {
      setLoading(true);
      setErrorMsg('');
      try {
        if (!codeParam && !tokenParam) {
          setErrorMsg('No Poll Code or invitation token provided. Please enter a Poll Code on the home page.');
          setLoading(false);
          return;
        }
        const data = await voterAPI.getPollInfo(codeParam, tokenParam);
        setPollInfo(data.poll);
        if (data.prefilledEmail) {
          setEmail(data.prefilledEmail);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Poll not found or invalid access token.');
      } finally {
        setLoading(false);
      }
    }
    loadInfo();
  }, [codeParam, tokenParam]);

  // Step 1: Submit Email for Eligibility Check & OTP Dispatch
  const handleCheckEligibility = async (e) => {
    e?.preventDefault();
    if (!email || !email.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await voterAPI.checkEligibility({
        pollCode: codeParam,
        invitationToken: tokenParam,
        email: email.trim()
      });
      showToast(res.message);
      if (res.devOtpHint) {
        setOtp(res.devOtpHint); // Auto fill OTP in dev mode for convenient testing
      }
      setStep(2);
    } catch (err) {
      if (err.message.includes('already cast your vote')) {
        showToast('You have already voted in this poll.', 'error');
        // Fetch results directly if allowed
        loadResults();
        setStep(4);
      } else {
        setErrorMsg(err.message);
        showToast(err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length < 6) {
      showToast('Please enter the 6-digit OTP verification code.', 'error');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await voterAPI.verifyOTP({
        pollId: pollInfo.id,
        email: email.trim(),
        otp: otp.trim()
      });
      showToast('OTP Verified! Access Granted.');
      setVoterToken(res.voterToken);
      setBallotOptions(res.poll.options);
      setStep(3);
    } catch (err) {
      setErrorMsg(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Cast Vote
  const handleCastVote = async () => {
    if (!selectedOptionId) {
      showToast('Please select one option before casting your vote.', 'error');
      return;
    }

    setSubmittingVote(true);
    try {
      const res = await voterAPI.castVote({ optionId: selectedOptionId }, voterToken);
      showToast('Vote cast successfully!');
      if (res.tallies) {
        setResultsData(res);
      } else {
        await loadResults();
      }
      setStep(4);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingVote(false);
    }
  };

  const loadResults = async () => {
    try {
      if (pollInfo) {
        const res = await voterAPI.getResults(pollInfo.id);
        setResultsData(res);
      }
    } catch (err) {
      console.warn('Could not load results:', err.message);
    }
  };

  if (loading && !pollInfo) {
    return (
      <div className="mx-auto grid min-h-[400px] max-w-xl place-items-center text-center p-8">
        <div>
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-terra border-t-transparent" />
          <h2 className="font-serif text-2xl">Loading Poll Portal…</h2>
        </div>
      </div>
    );
  }

  if (errorMsg && !pollInfo) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4">
        <div className="card p-8 text-center space-y-4">
          <AlertTriangle className="mx-auto text-terra" size={40} />
          <h2 className="font-serif text-3xl">Access Error</h2>
          <p className="text-muted">{errorMsg}</p>
          <Button onClick={() => navigate('/')}>Return to Home Page</Button>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl py-8 px-4">
      {/* STEP HEADER INDICATOR */}
      <div className="mb-8 flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <span className={`px-2.5 py-1 rounded-full ${step === 1 ? 'bg-ink text-white font-bold' : 'bg-warm'}`}>1. Identity</span>
          <span>→</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 2 ? 'bg-ink text-white font-bold' : 'bg-warm'}`}>2. OTP Verification</span>
          <span>→</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 3 ? 'bg-ink text-white font-bold' : 'bg-warm'}`}>3. Ballot</span>
          <span>→</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 4 ? 'bg-olive text-white font-bold' : 'bg-warm'}`}>4. Confirmation</span>
        </div>
        <Status>{pollInfo?.status || 'OPEN'}</Status>
      </div>

      {/* POLL TITLE CARD */}
      <div className="card p-6 md:p-8 space-y-6">
        <div>
          <div className="label mb-2">BALLOT CODE: {pollInfo?.pollCode}</div>
          <h1 className="font-serif text-3xl md:text-4xl leading-snug">{pollInfo?.title}</h1>
          {pollInfo?.description && <p className="mt-2 text-muted leading-relaxed">{pollInfo.description}</p>}
          <div className="mt-4 text-xs font-mono text-muted">Organizer: {pollInfo?.organizerName}</div>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-terra/30 bg-terra/10 p-4 text-sm text-terra flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: EMAIL ELIGIBILITY CHECK */}
        {step === 1 && (
          <form onSubmit={handleCheckEligibility} className="border-t border-line pt-6 space-y-5 animate-in fade-in">
            <div className="rounded-xl border border-line bg-paper p-4 text-xs text-muted leading-relaxed">
              <b className="text-ink block font-semibold mb-1">Restricted Poll Verification:</b>
              Only voter emails authorized by the organizer are eligible. Your email will be checked against the poll's electorate before an OTP is sent.
            </div>

            <div>
              <label className="label block mb-1">Enter your authorized email address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-muted pointer-events-none z-10" size={18} />
                <input
                  required
                  type="email"
                  className="field"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="voter@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Checking Eligibility…' : 'Check Eligibility & Send OTP →'}
            </Button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="border-t border-line pt-6 space-y-5 animate-in fade-in">
            <div className="rounded-xl border border-olive/30 bg-olive/10 p-4 text-xs text-ink leading-relaxed flex items-center justify-between">
              <div>
                <b>OTP Code Dispatched:</b> Code sent to <b className="underline">{email}</b>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-terra font-mono font-bold hover:underline"
              >
                Change Email
              </button>
            </div>

            <div>
              <label className="label block mb-1 text-center">Enter 6-Digit Verification Code</label>
              <input
                required
                maxLength={6}
                className="field text-center font-mono text-3xl tracking-[.4em] py-3 uppercase"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-muted pt-1">
              <span>Code valid for 5 minutes</span>
              <button
                type="button"
                onClick={handleCheckEligibility}
                className="text-terra font-semibold hover:underline"
              >
                Resend OTP Code
              </button>
            </div>

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Verifying OTP…' : 'Verify Code & Access Ballot →'}
            </Button>
          </form>
        )}

        {/* STEP 3: BALLOT OPTION SELECTION */}
        {step === 3 && (
          <div className="border-t border-line pt-6 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-muted font-mono">
              <span>NEUTRAL OPTION PRESENTATION</span>
              <span>SELECT EXACTLY ONE CHOICE</span>
            </div>

            <div className="space-y-3">
              {ballotOptions.map((opt, i) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`poll-option w-full text-left flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedOptionId === opt.id
                      ? 'border-2 border-ink bg-warm shadow-md font-semibold'
                      : 'border-line hover:border-ink/50 bg-paper'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-base text-ink">{opt.optionText}</span>
                  </div>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${selectedOptionId === opt.id ? 'border-ink bg-ink text-white' : 'border-line'}`}>
                    {selectedOptionId === opt.id && <span className="text-xs">✓</span>}
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleCastVote}
              disabled={!selectedOptionId || submittingVote}
              className="w-full py-4 text-lg"
            >
              {submittingVote ? 'Submitting Ballot…' : 'Cast Ballot Now'}
            </Button>

            <div className="text-center text-xs text-muted">
              <LockKeyhole size={13} className="inline mr-1 text-olive" />
              Once submitted, your vote is recorded atomically and cannot be changed or cast again.
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMATION & RESULTS */}
        {step === 4 && (
          <div className="border-t border-line pt-6 space-y-6 text-center animate-in fade-in">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-olive/10 text-olive border border-olive/30">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="font-serif text-3xl">Vote Successfully Cast!</h2>
              <p className="mt-2 text-sm text-muted">
                Your ballot has been recorded anonymously. Thank you for participating.
              </p>
            </div>

            {resultsData && resultsData.tallies && (
              <div className="card text-left p-6 bg-warm border border-line space-y-4">
                <div className="flex justify-between items-center border-b border-line pb-2">
                  <span className="font-serif font-bold text-lg">Current Verified Tally</span>
                  <span className="font-mono text-xs text-muted">{resultsData.totalVotes} total votes</span>
                </div>
                <div className="space-y-4">
                  {resultsData.tallies.map((t) => (
                    <div key={t.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{t.optionText}</span>
                        <span className="font-mono">{t.pct}% ({t.votes} votes)</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-paper">
                        <div className="h-full bg-ink transition-all duration-500" style={{ width: `${t.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="secondary" onClick={() => navigate('/')}>
              Return to Public Portal
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
