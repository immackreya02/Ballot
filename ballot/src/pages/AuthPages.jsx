import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button, Logo, useToast, RoleBadge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShieldCheck, Mail, KeyRound, AlertCircle, User, FileSpreadsheet, Shield } from 'lucide-react';

export function Auth({ type = 'login' }) {
  const navigate = useNavigate();
  const { token } = useParams();
  const { showToast } = useToast();
  const { login, register, verifyEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('organizer');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');
  const [verifyState, setVerifyState] = useState('pending');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      if (type === 'login') {
        const res = await login(email, password);
        showToast(`Welcome back, ${res.user.name}!`);
        if (res.user.role === 'admin') {
          navigate('/app/admin');
        } else {
          navigate('/app/polls');
        }
      } else if (type === 'signup') {
        const res = await register(name, email, password, confirmPassword, selectedRole);
        showToast(res.message);
        if (res.devOtpHint) {
          setDevOtpHint(res.devOtpHint);
        }
        navigate('/verify-email', { state: { email } });
      } else if (type === 'verify') {
        if (code.length < 6) {
          showToast('Please enter full 6-digit verification code', 'error');
          setLoading(false);
          return;
        }
        const res = await verifyEmail(email, code);
        setVerifyState('success');
        showToast(res.message);
        setTimeout(() => navigate('/app/polls'), 1500);
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: ['Sign in to BALLOT', 'Enter your permanent organizer credentials.', 'Sign in'],
    signup: ['Create Organizer Account', 'Register to create and manage eligibility-based polls.', 'Create account'],
    forgot: ['Forgot password?', 'Enter your email address to receive password recovery instructions.', 'Send reset link'],
    reset: ['Reset password', 'Enter your new password below.', 'Update password'],
    verify: ['Verify your email', 'Enter the six-digit verification code sent to your email inbox.', 'Verify email']
  };

  const config = titles[type] || titles.login;

  return (
    <div className="mx-auto grid min-h-[calc(100vh-128px)] max-w-6xl place-items-center p-4 md:grid-cols-2 gap-8 py-12">
      <div className="hidden md:block space-y-6">
        <p className="label">BALLOT — Secure Online Voting System</p>
        <h1 className="font-serif text-6xl leading-tight">Vote with confidence.</h1>
        <p className="max-w-md text-lg text-muted leading-relaxed">
          A focused civic-tech platform built for high-trust voting, neutral presentation, and auditable results.
        </p>

        <div className="space-y-4 pt-4 border-t border-line text-sm">
          <div className="flex items-start gap-3 text-muted">
            <User size={20} className="text-olive shrink-0 mt-0.5" />
            <div>
              <b className="text-ink font-medium block">Voter Access</b>
              <span>Voters access polls directly via Poll Code or invitation link with email OTP verification.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-muted">
            <FileSpreadsheet size={20} className="text-olive shrink-0 mt-0.5" />
            <div>
              <b className="text-ink font-medium block">Poll Organizer Account</b>
              <span>Create polls, manage reusable voter groups, lock electorates, and monitor live results.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card w-full max-w-md p-8 shadow-sm space-y-6">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">{config[0]}</h1>
          <p className="mt-2 text-muted text-sm">{config[1]}</p>
          {type === 'login' && (
            <div className="mt-3 rounded-xl border border-line bg-warm p-3 text-xs text-muted leading-relaxed">
              💡 <b>Notice for Voters:</b> You do not need an account to vote. Enter your Poll Code on the <Link to="/" className="text-ink font-bold underline">homepage</Link> to access your ballot.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {type === 'signup' && (
            <label className="block">
              <span className="label block mb-1">Full name</span>
              <input
                required
                className="field"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}

          {type === 'signup' && (
            <label className="block">
              <span className="label block mb-1">Account Role</span>
              <select
                className="field font-medium"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="organizer">Poll Organizer (Create & manage polls)</option>
                <option value="admin">System Administrator (Full system management)</option>
              </select>
            </label>
          )}

          {(type === 'login' || type === 'signup' || type === 'forgot' || type === 'verify') && (
            <label className="block">
              <span className="label block mb-1">Email address</span>
              <input
                required
                type="email"
                className="field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          )}

          {(type === 'login' || type === 'signup' || type === 'reset') && (
            <label className="block">
              <span className="label block mb-1">Password</span>
              <input
                required
                type="password"
                className="field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}

          {(type === 'signup' || type === 'reset') && (
            <label className="block">
              <span className="label block mb-1">Confirm password</span>
              <input
                required
                type="password"
                className="field"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
          )}

          {type === 'verify' && (
            <div className="space-y-4">
              {verifyState === 'success' ? (
                <div className="rounded-xl border border-line bg-paper p-4 text-center space-y-2">
                  <CheckCircle2 className="mx-auto text-olive" size={36} />
                  <b className="font-serif text-xl block">Email Verified!</b>
                  <p className="text-sm text-muted">Your account has been activated. Redirecting to workspace…</p>
                </div>
              ) : (
                <>
                  {devOtpHint && (
                    <div className="rounded-xl border border-olive/30 bg-olive/10 p-3 text-xs text-ink font-mono text-center">
                      Dev OTP Hint: <b>{devOtpHint}</b>
                    </div>
                  )}
                  <label className="block text-center">
                    <span className="label block mb-2">6-digit verification code</span>
                    <input
                      maxLength={6}
                      className="field text-center font-mono text-2xl tracking-[.5em] py-3 uppercase"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </label>
                </>
              )}
            </div>
          )}

          {verifyState !== 'success' && (
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Processing…' : config[2]}
            </Button>
          )}
        </form>

        <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-4 text-sm text-muted">
          {type === 'login' ? (
            <>
              <Link to="/forgot-password" className="hover:text-ink">
                Forgot password?
              </Link>
              <Link to="/signup" className="font-bold text-ink hover:text-terra">
                Create Organizer Account
              </Link>
            </>
          ) : (
            <Link to="/login" className="hover:text-ink font-medium">
              ← Back to sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
