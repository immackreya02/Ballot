import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, PageHeader, SettingsNavigation, RoleBadge, useToast } from '../components/UI';
import { Shield, Key, Bell, Lock, User, CheckCircle2, Laptop } from 'lucide-react';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [email, setEmail] = useState(user?.email || 'arivera@example.com');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'US';

  const handleSave = (e) => {
    e.preventDefault();
    updateUser({ name, email });
    showToast('Profile information updated successfully!');
  };

  return (
    <section className="max-w-3xl py-4 space-y-6">
      <PageHeader eyebrow="Account" title="User Profile" />

      <form onSubmit={handleSave} className="card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-line pb-6">
          <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-terra bg-paper font-mono text-xl font-bold text-ink">
            {initials}
          </div>
          <div>
            <h3 className="font-serif text-2xl">{name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <RoleBadge role={user?.role} />
              <span className="text-xs text-muted">Member since {user?.joined || 'April 2026'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="label block mb-1">Display name</span>
            <input
              className="field font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="label block mb-1">Email address</span>
            <input
              type="email"
              className="field font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>

        <Button type="submit" className="mt-4">
          Save profile changes
        </Button>
      </form>
    </section>
  );
}

export function AccountSettings({ section = 'settings' }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [duration, setDuration] = useState(14);
  const [notifications, setNotifications] = useState({
    pollPublished: true,
    pollClosingSoon: true,
    milestoneReached: true,
    digestWeekly: false
  });
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    analyticsConsent: true
  });

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleSaveSettings = (e) => {
    e?.preventDefault();
    showToast('Settings preferences saved');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPass) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match', 'error');
      return;
    }
    showToast('Password updated successfully!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const titles = {
    settings: 'General Settings',
    security: 'Security & Authentication',
    notifications: 'Notification Preferences',
    privacy: 'Privacy & Data Controls'
  };

  return (
    <section className="max-w-3xl py-4 space-y-6">
      <PageHeader eyebrow="Account Workspace" title={titles[section] || 'Account Settings'} />

      <SettingsNavigation />

      <div className="card p-6 md:p-8">
        {section === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <label className="block">
              <span className="label block mb-1">Primary Timezone</span>
              <select
                className="field"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </label>

            <label className="block">
              <span className="label block mb-1">Default Poll Duration</span>
              <select
                className="field"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days (Recommended)</option>
                <option value={30}>30 Days</option>
              </select>
            </label>

            <Button type="submit">Save settings</Button>
          </form>
        )}

        {section === 'security' && (
          <div className="space-y-8">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h3 className="font-serif text-2xl">Change Password</h3>
              <label className="block">
                <span className="label block mb-1">Current Password</span>
                <input
                  type="password"
                  className="field"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="label block mb-1">New Password</span>
                <input
                  type="password"
                  className="field"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="label block mb-1">Confirm New Password</span>
                <input
                  type="password"
                  className="field"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
              </label>
              <Button type="submit">Update password</Button>
            </form>

            <div className="border-t border-line pt-6 space-y-4">
              <h3 className="font-serif text-2xl">Active Sessions</h3>
              <div className="rounded-xl border border-line p-4 bg-paper flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="text-olive" size={24} />
                  <div>
                    <b className="text-sm block text-ink">Chrome on Windows (Current Session)</b>
                    <span className="text-xs text-muted">Signed in as {user?.email || 'user'} • Active now</span>
                  </div>
                </div>
                <span className="rounded-full bg-olive/10 border border-olive/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-olive">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        )}

        {section === 'notifications' && (
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <h3 className="font-serif text-2xl mb-4">Email Notifications</h3>

            {[
              ['pollPublished', 'Poll published confirmation', 'Receive email receipt when your poll opens for voting.'],
              ['pollClosingSoon', 'Poll closing alert', 'Receive notification 24 hours prior to scheduled poll closure.'],
              ['milestoneReached', 'Participation milestones', 'Alerts when a poll crosses 500, 1000, or 5000 votes.'],
              ['digestWeekly', 'Weekly activity summary digest', 'Receive a weekly analytics breakdown of all your polls.']
            ].map(([key, label, desc]) => (
              <label key={key} className="flex items-start justify-between border-b border-line pb-4 cursor-pointer">
                <div>
                  <b className="text-ink text-sm block">{label}</b>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-line text-terra focus:ring-terra accent-terra cursor-pointer"
                  checked={!!notifications[key]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [key]: e.target.checked })
                  }
                />
              </label>
            ))}

            <Button type="submit" className="mt-4">
              Save notification preferences
            </Button>
          </form>
        )}

        {section === 'privacy' && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl">Privacy Controls</h3>

            <label className="flex items-start justify-between border-b border-line pb-4 cursor-pointer">
              <div>
                <b className="text-ink text-sm block">Public Profile Listing</b>
                <p className="text-xs text-muted mt-0.5">Allow voters to see your public creator profile badge.</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-line text-terra accent-terra cursor-pointer"
                checked={privacy.publicProfile}
                onChange={(e) => setPrivacy({ ...privacy, publicProfile: e.target.checked })}
              />
            </label>

            <label className="flex items-start justify-between border-b border-line pb-4 cursor-pointer">
              <div>
                <b className="text-ink text-sm block">Anonymous Product Analytics</b>
                <p className="text-xs text-muted mt-0.5">Help improve BALLOT by sharing usage metrics without personal identifiers.</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-line text-terra accent-terra cursor-pointer"
                checked={privacy.analyticsConsent}
                onChange={(e) => setPrivacy({ ...privacy, analyticsConsent: e.target.checked })}
              />
            </label>

            <div className="pt-4 space-y-3">
              <Button variant="secondary" onClick={() => showToast('Data archive requested')}>
                Download Account Data Export
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
