import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AppLayout, MarketingLayout } from './components/Layout';
import { AuthProvider, ProtectedRoute, AdminRoute, OrganizerRoute } from './context/AuthContext';
import {
  Landing,
  HowItWorks,
  SecurityInfo,
  TransparencyInfo,
  Auth,
  Dashboard,
  PollList,
  CreatePoll,
  PollPreview,
  PublishConfirmation,
  VoteState,
  PollResults,
  PollDetails,
  Share,
  PollParticipants,
  PollActivity,
  ArchiveList,
  ArchivedPoll,
  ProfilePage,
  AccountSettings,
  SystemState,
  AdminDashboard,
  AdminUsers,
  AdminPolls,
  AdminPollDetail,
  AdminActivity,
  AdminSettings,
  VotingPage,
  VoterGroupsPage,
  SimulationPage,
  AuditLogsPage
} from './pages/Pages';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#F3EFE7', fontFamily: 'DM Sans, sans-serif' }}>
          <div style={{ maxWidth: 620, background: '#FFFCF6', border: '1px solid #D6D0C5', borderRadius: 20, padding: 32 }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: '#C94B36' }}>
              BALLOT / FRONTEND ERROR
            </div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, margin: '14px 0' }}>The interface hit an error.</h1>
            <p style={{ color: '#74736E', lineHeight: 1.6 }}>Refresh the page. If this continues, check browser console output.</p>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#F3EFE7', padding: 14, borderRadius: 10, overflow: 'auto', marginTop: 16 }}>
              {String(this.state.error?.message || this.state.error)}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* PUBLIC MARKETING & AUTH ROUTES */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/security" element={<SecurityInfo />} />
          <Route path="/transparency" element={<TransparencyInfo />} />
          <Route path="/login" element={<Auth type="login" />} />
          <Route path="/signup" element={<Auth type="signup" />} />
          <Route path="/verify-email" element={<Auth type="verify" />} />
          <Route path="/forgot-password" element={<Auth type="forgot" />} />
          <Route path="/reset-password" element={<Auth type="reset" />} />
          <Route path="/reset-password/:token" element={<Auth type="reset" />} />

          {/* Public Voting & Results */}
          <Route path="/vote" element={<VotingPage />} />
          <Route
            path="/vote/:id"
            element={<VotingPage />}
          />
          <Route
            path="/vote-confirmation/:id"
            element={
              <ProtectedRoute>
                <VoteState kind="submitted" />
              </ProtectedRoute>
            }
          />
          <Route path="/already-voted/:id" element={<VoteState kind="already" />} />
          <Route path="/closed-poll/:id" element={<VoteState kind="closed" />} />
          <Route path="/results/:id" element={<PollResults />} />
          <Route path="/results/:id/closed" element={<PollResults closed />} />

          {/* System & Errors */}
          <Route path="/not-found" element={<SystemState type="notfound" />} />
        </Route>

        {/* PROTECTED APPLICATION WORKSPACE ROUTES */}
        <Route element={<AppLayout />}>
          {/* Dashboard & Polls lists */}
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/polls" element={<PollList mode="all" />} />
          <Route path="/app/polls/active" element={<PollList mode="active" />} />
          <Route path="/app/polls/drafts" element={<PollList mode="drafts" />} />
          <Route path="/app/polls/closed" element={<PollList mode="closed" />} />
          <Route path="/app/polls/voted" element={<PollList mode="voted" />} />

          {/* Voter Groups & Audit Logs */}
          <Route
            path="/app/voter-groups"
            element={
              <OrganizerRoute>
                <VoterGroupsPage />
              </OrganizerRoute>
            }
          />
          <Route
            path="/app/audit-logs"
            element={
              <OrganizerRoute>
                <AuditLogsPage />
              </OrganizerRoute>
            }
          />

          {/* Legacy Dashboard & Poll list routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/polls" element={<PollList mode="all" />} />
          <Route path="/active" element={<PollList mode="active" />} />
          <Route path="/drafts" element={<PollList mode="drafts" />} />

          {/* Poll Creation & Edit (Protected for Organizers / Admins only) */}
          <Route
            path="/app/polls/create"
            element={
              <OrganizerRoute>
                <CreatePoll />
              </OrganizerRoute>
            }
          />
          <Route
            path="/app/polls/:id/edit"
            element={
              <OrganizerRoute>
                <CreatePoll edit />
              </OrganizerRoute>
            }
          />
          <Route
            path="/app/polls/:id/preview"
            element={
              <OrganizerRoute>
                <PollPreview />
              </OrganizerRoute>
            }
          />
          <Route
            path="/create"
            element={
              <OrganizerRoute>
                <CreatePoll />
              </OrganizerRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <OrganizerRoute>
                <CreatePoll edit />
              </OrganizerRoute>
            }
          />
          <Route
            path="/preview/:id"
            element={
              <OrganizerRoute>
                <PollPreview />
              </OrganizerRoute>
            }
          />
          <Route path="/publish-confirmation" element={<PublishConfirmation />} />

          {/* Poll Management & Sharing */}
          <Route path="/app/polls/:id" element={<PollDetails />} />
          <Route path="/app/polls/:id/share" element={<Share />} />
          <Route path="/poll/:id" element={<PollDetails />} />
          <Route path="/manage/:id" element={<PollDetails />} />
          <Route path="/share/:id" element={<Share />} />

          {/* Detailed Creator Results & Analytics */}
          <Route path="/app/polls/:id/results" element={<PollResults />} />
          <Route path="/app/polls/:id/participants" element={<PollParticipants />} />
          <Route path="/app/polls/:id/activity" element={<PollActivity />} />

          {/* SYSTEM ADMINISTRATOR ROUTES (Protected by AdminRoute) */}
          <Route
            path="/app/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/polls"
            element={
              <AdminRoute>
                <AdminPolls />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/polls/:pollId"
            element={
              <AdminRoute>
                <AdminPollDetail />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/activity"
            element={
              <AdminRoute>
                <AdminActivity />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/settings"
            element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            }
          />

          {/* Archive */}
          <Route path="/archive" element={<ArchiveList />} />
          <Route path="/archive/filtered" element={<ArchiveList filter="CLOSED" />} />
          <Route path="/archive/search" element={<ArchiveList search="library" />} />
          <Route path="/archive/empty" element={<ArchiveList empty />} />
          <Route path="/archive/:id" element={<ArchivedPoll />} />

          {/* Profile & Account Settings */}
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route path="/app/settings" element={<AccountSettings section="settings" />} />
          <Route path="/app/settings/security" element={<AccountSettings section="security" />} />
          <Route path="/app/settings/notifications" element={<AccountSettings section="notifications" />} />
          <Route path="/app/settings/privacy" element={<AccountSettings section="privacy" />} />

          {/* Legacy profile & settings */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<AccountSettings section="settings" />} />

          {/* System States */}
          <Route path="/state/:type" element={<SystemState />} />
        </Route>

        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
