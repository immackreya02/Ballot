export const currentUser = {
  name: 'Alex Rivera',
  email: 'arivera@example.com',
  role: 'voter',
  avatar: 'AR',
  joined: 'April 04, 2026',
  timezone: 'Asia/Kolkata',
  defaultDurationDays: 14,
  language: 'English (US)',
  notifications: {
    pollPublished: true,
    pollClosingSoon: true,
    milestoneReached: true,
    digestWeekly: false
  },
  privacy: {
    publicProfile: false,
    analyticsConsent: true
  }
};

export const polls = [
  {
    id: 'transport',
    question: 'Which transport priority should Crestview City fund in FY 2026–2027?',
    description: 'Civic infrastructure budget allocation proposal for the upcoming fiscal year focusing on public transit and road safety.',
    status: 'OPEN',
    votes: 1204,
    voterCount: 1204,
    eligibility: 'Authenticated Residents',
    closes: 'Jun 30, 2026 · 17:00',
    createdAt: 'May 10, 2026',
    publishedAt: 'May 12, 2026',
    owner: 'Crestview Transit Board',
    isOwner: false,
    hasVoted: true,
    userVoteChoice: 'Increase public transit funding',
    options: [
      ['Increase public transit funding', 42.8],
      ['Expand bicycle infrastructure', 28.4],
      ['Improve road maintenance', 18.2],
      ['Add pedestrian crossings', 10.6]
    ],
    timeline: [
      { time: 'May 10, 2026 · 09:30', event: 'Poll created as draft by Crestview Transit Board' },
      { time: 'May 12, 2026 · 10:00', event: 'Poll published and verification rules enabled' },
      { time: 'May 15, 2026 · 14:22', event: 'Milestone: 500 votes recorded' },
      { time: 'May 28, 2026 · 18:45', event: 'Milestone: 1,000 votes recorded' }
    ],
    participationHistory: [
      { date: 'May 12', votes: 120 },
      { date: 'May 15', votes: 380 },
      { date: 'May 20', votes: 240 },
      { date: 'May 25', votes: 310 },
      { date: 'May 30', votes: 154 }
    ]
  },
  {
    id: 'library-hours',
    question: 'Should Crestview Central Library extend weekend operating hours until 20:00?',
    description: 'Proposal to keep central and branch libraries open 2 hours longer on Saturdays and Sundays for students and working families.',
    status: 'OPEN',
    votes: 2481,
    voterCount: 2481,
    eligibility: 'Crestview Community',
    closes: 'Jul 02, 2026 · 18:00',
    createdAt: 'May 18, 2026',
    publishedAt: 'May 19, 2026',
    owner: 'Crestview Library Association',
    isOwner: false,
    hasVoted: false,
    userVoteChoice: null,
    options: [
      ['Yes, extend hours', 63.4],
      ['No, keep current hours', 36.6]
    ],
    timeline: [
      { time: 'May 18, 2026 · 11:00', event: 'Poll draft submitted by Crestview Library Board' },
      { time: 'May 19, 2026 · 09:00', event: 'Poll opened for community voting' },
      { time: 'Jun 01, 2026 · 16:30', event: 'Milestone: 2,000 votes recorded' }
    ],
    participationHistory: [
      { date: 'May 19', votes: 450 },
      { date: 'May 22', votes: 720 },
      { date: 'May 26', votes: 610 },
      { date: 'Jun 01', votes: 701 }
    ]
  },
  {
    id: 'campus-green',
    question: 'Allocation priority for the 2026 Crestview University Sustainability Fund',
    description: 'Student Senate consultative vote on spending $150,000 in campus environmental improvement grants.',
    status: 'OPEN',
    votes: 481,
    voterCount: 481,
    eligibility: 'University Students & Faculty',
    closes: 'Jul 10, 2026 · 23:59',
    createdAt: 'May 24, 2026',
    publishedAt: 'May 25, 2026',
    owner: 'University Student Senate',
    isOwner: false,
    hasVoted: false,
    userVoteChoice: null,
    options: [
      ['Rooftop Solar Array on Science Complex', 44.5],
      ['Campus-wide Composting & Waste Reduction', 31.2],
      ['Electric Shuttle Buggy Fleet', 16.8],
      ['Native Pollinator Gardens', 7.5]
    ],
    timeline: [
      { time: 'May 24, 2026 · 14:00', event: 'Draft submitted by Student Senate Chair' },
      { time: 'May 25, 2026 · 08:30', event: 'Published to campus portal' }
    ],
    participationHistory: [
      { date: 'May 25', votes: 140 },
      { date: 'May 28', votes: 195 },
      { date: 'Jun 02', votes: 146 }
    ]
  },
  {
    id: 'civic-wifi',
    question: 'Expand free public Wi-Fi coverage across Crestview Downtown & Park Quadrants',
    description: 'Municipal digital inclusion initiative to install high-speed public access points in public parks and transit stops.',
    status: 'OPEN',
    votes: 142,
    voterCount: 142,
    eligibility: 'Authenticated Residents',
    closes: 'Jul 20, 2026 · 17:00',
    createdAt: 'Jun 01, 2026',
    publishedAt: 'Jun 02, 2026',
    owner: 'E. Rowan',
    isOwner: true,
    hasVoted: false,
    userVoteChoice: null,
    options: [
      ['Support expansion to all 4 quadrants', 78.2],
      ['Focus only on Downtown Core', 15.5],
      ['Do not allocate funds for public Wi-Fi', 6.3]
    ],
    timeline: [
      { time: 'Jun 01, 2026 · 10:15', event: 'Draft created by E. Rowan' },
      { time: 'Jun 02, 2026 · 09:00', event: 'Poll published by System Admin' }
    ],
    participationHistory: [
      { date: 'Jun 02', votes: 65 },
      { date: 'Jun 05', votes: 77 }
    ]
  },
  {
    id: 'renewable-energy',
    question: 'Should the municipal power grid target 80% solar & wind energy by 2030?',
    description: 'Draft strategy document setting clean energy transition targets for public buildings and residential grid.',
    status: 'DRAFT',
    votes: 0,
    voterCount: 0,
    eligibility: 'Verified Residents',
    closes: 'Jul 15, 2026 · 23:59',
    createdAt: 'Jun 02, 2026',
    publishedAt: null,
    owner: 'Environmental Action Council',
    isOwner: false,
    hasVoted: false,
    userVoteChoice: null,
    options: [
      ['Adopt 80% renewable target', 0],
      ['Adopt 60% realistic target', 0],
      ['Maintain current transition pace', 0]
    ],
    timeline: [
      { time: 'Jun 02, 2026 · 14:15', event: 'Draft created by Environmental Action Council' }
    ],
    participationHistory: []
  },
  {
    id: 'pedestrian-zone',
    question: 'Convert Main Street Quadrant 4 into a weekend pedestrian plaza',
    description: 'Trial proposal to restrict motorized traffic on Saturdays and Sundays to promote local commerce and outdoor dining.',
    status: 'DRAFT',
    votes: 0,
    voterCount: 0,
    eligibility: 'Crestview Community',
    closes: 'Aug 01, 2026 · 18:00',
    createdAt: 'Jun 04, 2026',
    publishedAt: null,
    owner: 'E. Rowan',
    isOwner: true,
    hasVoted: false,
    userVoteChoice: null,
    options: [
      ['Support weekend pedestrian zone', 0],
      ['Support Sunday-only pedestrian zone', 0],
      ['Oppose traffic restriction', 0]
    ],
    timeline: [
      { time: 'Jun 04, 2026 · 16:45', event: 'Draft prepared by E. Rowan' }
    ],
    participationHistory: []
  },
  {
    id: 'community-tech-lab',
    question: 'Establishment of a public digital hardware & tech innovation lab in Central Library',
    description: 'Equipment procurement consultation for 3D printers, electronics workstations, and coding software for public use.',
    status: 'DRAFT',
    votes: 0,
    voterCount: 0,
    eligibility: 'Crestview Community',
    closes: 'Aug 15, 2026 · 17:00',
    createdAt: 'Jun 06, 2026',
    publishedAt: null,
    owner: 'Crestview Library Association',
    isOwner: false,
    hasVoted: false,
    userVoteChoice: null,
    options: [
      ['Full Makerspace & Robotics Lab', 0],
      ['Media Production & Podcast Studio', 0],
      ['Standard Computer Workstation Expansion', 0]
    ],
    timeline: [
      { time: 'Jun 06, 2026 · 11:20', event: 'Draft created by Library Tech Committee' }
    ],
    participationHistory: []
  },
  {
    id: 'community-park',
    question: 'Preferred location site for the new Crestview Riverside Community Park',
    description: 'Public consultation on selecting site for the green space initiative along the Crestview River Basin.',
    status: 'CLOSED',
    votes: 5902,
    voterCount: 5902,
    eligibility: 'Public Record',
    closes: 'Closed Feb 28, 2026',
    createdAt: 'Jan 15, 2026',
    publishedAt: 'Jan 20, 2026',
    owner: 'Crestview Parks & Rec Commission',
    isOwner: false,
    hasVoted: true,
    userVoteChoice: 'Riverside District',
    options: [
      ['Riverside District', 48.1],
      ['North Quarter Parklands', 31.7],
      ['Central Ward Green', 20.2]
    ],
    timeline: [
      { time: 'Jan 15, 2026 · 10:00', event: 'Poll created by Parks & Rec Commission' },
      { time: 'Jan 20, 2026 · 12:00', event: 'Voting period commenced' },
      { time: 'Feb 15, 2026 · 18:00', event: 'Milestone: 5,000 votes recorded' },
      { time: 'Feb 28, 2026 · 23:59', event: 'Poll closed automatically by schedule. Final tally archived.' }
    ],
    participationHistory: [
      { date: 'Jan 20', votes: 1200 },
      { date: 'Jan 28', votes: 1850 },
      { date: 'Feb 10', votes: 1650 },
      { date: 'Feb 28', votes: 1202 }
    ]
  },
  {
    id: 'work-week',
    question: 'Adopt a four-day work week trial for Crestview municipal administrative staff',
    description: 'Feasibility study and civic opinion poll on a 6-month compressed 36-hour work schedule trial.',
    status: 'CLOSED',
    votes: 3760,
    voterCount: 3760,
    eligibility: 'Municipal Staff & Citizens',
    closes: 'Closed Jan 22, 2026',
    createdAt: 'Dec 10, 2025',
    publishedAt: 'Dec 12, 2025',
    owner: 'Civic Charter Committee',
    isOwner: false,
    hasVoted: true,
    userVoteChoice: 'Support trial',
    options: [
      ['Support trial', 55.2],
      ['Do not support', 44.8]
    ],
    timeline: [
      { time: 'Dec 10, 2025 · 09:00', event: 'Poll published by Charter Committee' },
      { time: 'Jan 22, 2026 · 17:00', event: 'Poll closed and archived with verified tally' }
    ],
    participationHistory: [
      { date: 'Dec 12', votes: 980 },
      { date: 'Dec 24', votes: 1400 },
      { date: 'Jan 15', votes: 1380 }
    ]
  },
  {
    id: 'charter-amendment',
    question: 'Proposed amendment to Crestview Civic Charter Section 12 on public hearings',
    description: 'Requiring minimum 14-day public notice for major zoning ordinance hearings.',
    status: 'CLOSED',
    votes: 894,
    voterCount: 894,
    eligibility: 'Registered Voters',
    closes: 'Closed Mar 15, 2026',
    createdAt: 'Feb 01, 2026',
    publishedAt: 'Feb 05, 2026',
    owner: 'Civic Charter Committee',
    isOwner: false,
    hasVoted: false,
    userVoteChoice: null,
    options: [
      ['Approve Charter Amendment', 74.3],
      ['Reject Charter Amendment', 25.7]
    ],
    timeline: [
      { time: 'Feb 01, 2026 · 11:00', event: 'Charter amendment submitted' },
      { time: 'Mar 15, 2026 · 18:00', event: 'Voting closed. Amendment approved.' }
    ],
    participationHistory: [
      { date: 'Feb 05', votes: 240 },
      { date: 'Feb 20', votes: 350 },
      { date: 'Mar 15', votes: 304 }
    ]
  },
  {
    id: 'digital-voting-study',
    question: 'Evaluation of digital ballot verification protocols for neighborhood council elections',
    description: 'Advisory consultation on adopting cryptographic voter receipt verification for sub-district elections.',
    status: 'CLOSED',
    votes: 37,
    voterCount: 37,
    eligibility: 'Neighborhood Delegates',
    closes: 'Closed Apr 10, 2026',
    createdAt: 'Mar 20, 2026',
    publishedAt: 'Mar 25, 2026',
    owner: 'E. Rowan',
    isOwner: true,
    hasVoted: true,
    userVoteChoice: 'Adopt digital verification',
    options: [
      ['Adopt digital verification', 81.1],
      ['Continue paper-only ballots', 18.9]
    ],
    timeline: [
      { time: 'Mar 20, 2026 · 09:00', event: 'Delegate consultation opened' },
      { time: 'Apr 10, 2026 · 17:00', event: 'Voting concluded among 37 accredited delegates' }
    ],
    participationHistory: [
      { date: 'Mar 25', votes: 15 },
      { date: 'Apr 10', votes: 22 }
    ]
  }
];

export const getPollById = (id) => polls.find((p) => p.id === id) || null;
