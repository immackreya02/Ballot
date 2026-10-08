export const mockUsers = [
  {
    id: 'usr-1',
    name: 'E. Rowan',
    email: 'erowan@crestview.gov',
    role: 'admin',
    status: 'active',
    joined: 'March 15, 2025',
    pollsCreated: 4,
    votesCast: 18
  },
  {
    id: 'usr-2',
    name: 'Crestview Transit Board',
    email: 'transit@crestview.gov',
    role: 'organizer',
    status: 'active',
    joined: 'January 10, 2025',
    pollsCreated: 5,
    votesCast: 12
  },
  {
    id: 'usr-3',
    name: 'Crestview Library Association',
    email: 'library@crestview.org',
    role: 'organizer',
    status: 'active',
    joined: 'February 01, 2026',
    pollsCreated: 4,
    votesCast: 8
  },
  {
    id: 'usr-4',
    name: 'University Student Senate',
    email: 'senate@crestview.edu',
    role: 'organizer',
    status: 'active',
    joined: 'February 15, 2026',
    pollsCreated: 3,
    votesCast: 15
  },
  {
    id: 'usr-5',
    name: 'Environmental Action Council',
    email: 'environment@crestview.org',
    role: 'organizer',
    status: 'active',
    joined: 'March 01, 2026',
    pollsCreated: 2,
    votesCast: 5
  },
  {
    id: 'usr-6',
    name: 'Crestview Parks & Rec Commission',
    email: 'parks@crestview.gov',
    role: 'organizer',
    status: 'active',
    joined: 'November 12, 2025',
    pollsCreated: 3,
    votesCast: 10
  },
  {
    id: 'usr-7',
    name: 'Civic Charter Committee',
    email: 'charter@crestview.gov',
    role: 'organizer',
    status: 'active',
    joined: 'December 01, 2025',
    pollsCreated: 3,
    votesCast: 22
  },
  {
    id: 'usr-8',
    name: 'Alex Rivera',
    email: 'arivera@example.com',
    role: 'voter',
    status: 'active',
    joined: 'April 04, 2026',
    pollsCreated: 0,
    votesCast: 8
  },
  {
    id: 'usr-9',
    name: 'Taylor Chen',
    email: 'tchen@crestview.edu',
    role: 'voter',
    status: 'active',
    joined: 'May 02, 2026',
    pollsCreated: 0,
    votesCast: 14
  },
  {
    id: 'usr-10',
    name: 'Samira Patel',
    email: 'spatel@crestview.org',
    role: 'voter',
    status: 'active',
    joined: 'April 18, 2026',
    pollsCreated: 0,
    votesCast: 11
  },
  {
    id: 'usr-11',
    name: 'Marcus Vance',
    email: 'mvance@example.com',
    role: 'voter',
    status: 'active',
    joined: 'May 10, 2026',
    pollsCreated: 0,
    votesCast: 6
  },
  {
    id: 'usr-12',
    name: 'Elena Rostova',
    email: 'erostova@crestview.edu',
    role: 'voter',
    status: 'active',
    joined: 'May 15, 2026',
    pollsCreated: 0,
    votesCast: 9
  },
  {
    id: 'usr-13',
    name: 'David Kim',
    email: 'dkim@example.com',
    role: 'voter',
    status: 'active',
    joined: 'May 22, 2026',
    pollsCreated: 0,
    votesCast: 4
  },
  {
    id: 'usr-14',
    name: 'Chloe Bennett',
    email: 'cbennett@example.com',
    role: 'voter',
    status: 'active',
    joined: 'May 28, 2026',
    pollsCreated: 0,
    votesCast: 7
  },
  {
    id: 'usr-15',
    name: 'Tariq Al-Mansoor',
    email: 'talmansoor@crestview.org',
    role: 'voter',
    status: 'active',
    joined: 'June 01, 2026',
    pollsCreated: 0,
    votesCast: 3
  },
  {
    id: 'usr-16',
    name: 'Jordan Miller',
    email: 'jmiller@spamnet.org',
    role: 'voter',
    status: 'suspended',
    joined: 'May 20, 2026',
    pollsCreated: 0,
    votesCast: 1
  }
];

export const mockSystemActivity = [
  {
    id: 'act-1',
    timestamp: 'Jun 06, 2026 · 11:20',
    type: 'poll_create',
    actor: 'Crestview Library Association (organizer)',
    description: 'Created draft poll "Establishment of a public digital hardware & tech innovation lab in Central Library"'
  },
  {
    id: 'act-2',
    timestamp: 'Jun 04, 2026 · 16:45',
    type: 'poll_create',
    actor: 'E. Rowan (admin)',
    description: 'Created draft poll "Convert Main Street Quadrant 4 into a weekend pedestrian plaza"'
  },
  {
    id: 'act-3',
    timestamp: 'Jun 02, 2026 · 09:00',
    type: 'poll_publish',
    actor: 'E. Rowan (admin)',
    description: 'Published poll "Expand free public Wi-Fi coverage across Crestview Downtown & Park Quadrants"'
  },
  {
    id: 'act-4',
    timestamp: 'May 28, 2026 · 18:45',
    type: 'milestone',
    actor: 'System Engine',
    description: 'Poll "Which transport priority should Crestview City fund in FY 2026–2027?" reached 1,000 votes milestone.'
  },
  {
    id: 'act-5',
    timestamp: 'May 25, 2026 · 08:30',
    type: 'poll_publish',
    actor: 'University Student Senate (organizer)',
    description: 'Published poll "Allocation priority for the 2026 Crestview University Sustainability Fund"'
  },
  {
    id: 'act-6',
    timestamp: 'May 20, 2026 · 09:10',
    type: 'user_suspend',
    actor: 'E. Rowan (admin)',
    description: 'Suspended user Jordan Miller (jmiller@spamnet.org) due to identity verification anomaly.'
  },
  {
    id: 'act-7',
    timestamp: 'May 19, 2026 · 09:00',
    type: 'poll_publish',
    actor: 'Crestview Library Association (organizer)',
    description: 'Published poll "Should Crestview Central Library extend weekend operating hours until 20:00?".'
  },
  {
    id: 'act-8',
    timestamp: 'May 12, 2026 · 10:00',
    type: 'poll_publish',
    actor: 'Crestview Transit Board (organizer)',
    description: 'Published poll "Which transport priority should Crestview City fund in FY 2026–2027?".'
  },
  {
    id: 'act-9',
    timestamp: 'May 02, 2026 · 11:30',
    type: 'user_register',
    actor: 'Taylor Chen (voter)',
    description: 'New voter account registered and completed email verification.'
  }
];

export const mockAdminSettings = {
  systemName: 'BALLOT — Crestview Online Voting & Poll System',
  defaultVoterDurationDays: 14,
  allowPublicRegistrations: true,
  defaultRegistrationRole: 'voter',
  maxPollOptions: 10,
  requireEmailVerification: true,
  maintenanceMode: false
};
