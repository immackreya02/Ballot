require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const VoterGroup = require('../models/VoterGroup');
const Poll = require('../models/Poll');
const ElectorateEntry = require('../models/ElectorateEntry');
const VotingAuthorization = require('../models/VotingAuthorization');
const Ballot = require('../models/Ballot');
const AuditEvent = require('../models/AuditEvent');
const OTPVerification = require('../models/OTPVerification');

async function seedDemoData() {
  console.log('==================================================');
  console.log('SEEDING BALLOT DEMO ORGANIZER ACCOUNT & SCENARIO');
  console.log('==================================================\n');

  await connectDB();

  const demoEmail = 'demo.organizer@ballot.org';
  const demoPassword = 'DemoOrganizer2026!';
  const demoPollCode = 'BLT-2026';

  // 1. Clean up existing demo records thoroughly
  const eligibleEmails = [
    'alex.rivera@community.org',
    'sam.taylor@community.org',
    'jordan.lee@community.org',
    'morgan.chen@community.org',
    'casey.patel@community.org'
  ];

  const tokensToClean = eligibleEmails.map((email) => 
    crypto.createHash('sha256').update(`${email}-${demoPollCode}`).digest('hex').substring(0, 32)
  );

  await ElectorateEntry.deleteMany({
    $or: [
      { invitationToken: { $in: tokensToClean } },
      { email: { $in: eligibleEmails } }
    ]
  });

  const oldPolls = await Poll.find({ pollCode: demoPollCode });
  const oldPollIds = oldPolls.map(p => p._id);

  if (oldPollIds.length > 0) {
    await ElectorateEntry.deleteMany({ pollId: { $in: oldPollIds } });
    await VotingAuthorization.deleteMany({ pollId: { $in: oldPollIds } });
    await Ballot.deleteMany({ pollId: { $in: oldPollIds } });
    await AuditEvent.deleteMany({ pollId: { $in: oldPollIds } });
    await OTPVerification.deleteMany({ pollId: { $in: oldPollIds } });
    await Poll.deleteMany({ _id: { $in: oldPollIds } });
  }

  const existingDemoUser = await User.findOne({ email: demoEmail });
  if (existingDemoUser) {
    const userPolls = await Poll.find({ organizerId: existingDemoUser._id });
    const userPollIds = userPolls.map(p => p._id);

    if (userPollIds.length > 0) {
      await ElectorateEntry.deleteMany({ pollId: { $in: userPollIds } });
      await VotingAuthorization.deleteMany({ pollId: { $in: userPollIds } });
      await Ballot.deleteMany({ pollId: { $in: userPollIds } });
      await AuditEvent.deleteMany({ pollId: { $in: userPollIds } });
      await OTPVerification.deleteMany({ pollId: { $in: userPollIds } });
      await Poll.deleteMany({ _id: { $in: userPollIds } });
    }

    await VoterGroup.deleteMany({ organizerId: existingDemoUser._id });
    await User.deleteOne({ _id: existingDemoUser._id });
  }

  // 2. Create Demo Organizer User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(demoPassword, salt);

  const demoUser = new User({
    name: 'Crestview Community Organizer',
    email: demoEmail,
    passwordHash,
    role: 'organizer',
    status: 'active',
    isEmailVerified: true
  });
  await demoUser.save();
  console.log(`✓ Demo Organizer Account created:`);
  console.log(`  Email:    ${demoEmail}`);
  console.log(`  Password: ${demoPassword}`);

  // 3. Create Preloaded Voter Group
  const demoGroup = new VoterGroup({
    name: 'Crestview Event Committee',
    description: '5 accredited community venue selection delegates',
    organizerId: demoUser._id,
    emails: eligibleEmails
  });
  await demoGroup.save();
  console.log(`\n✓ Demo Voter Group created: "${demoGroup.name}" (${eligibleEmails.length} emails)`);

  // 4. Create Preloaded Poll "Community Event Venue"
  const now = new Date();
  const publishedTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

  const demoPoll = new Poll({
    title: 'Community Event Venue',
    description: 'Select the primary venue site for the upcoming 2026 Annual Crestview Cultural Festival.',
    pollCode: demoPollCode,
    organizerId: demoUser._id,
    organizerName: demoUser.name,
    status: 'OPEN',
    resultVisibility: 'LIVE',
    startAt: publishedTime,
    endAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    electorateSourceType: 'GROUP',
    voterGroupId: demoGroup._id,
    totalEligibleCount: eligibleEmails.length,
    lockedElectorate: true,
    publishedAt: publishedTime,
    options: [
      { optionText: 'Crestview Riverfront Plaza', voteCount: 1 },
      { optionText: 'Central Library Grand Hall', voteCount: 1 },
      { optionText: 'Municipal Botanical Gardens', voteCount: 0 },
      { optionText: 'Highland Park Pavilion', voteCount: 0 }
    ]
  });
  await demoPoll.save();
  console.log(`\n✓ Demo Poll created & published:`);
  console.log(`  Title:     "${demoPoll.title}"`);
  console.log(`  Poll Code: ${demoPoll.pollCode}`);
  console.log(`  Status:    ${demoPoll.status} (Visibility: ${demoPoll.resultVisibility})`);

  // 5. Create ElectorateEntry records
  const electorateDocs = eligibleEmails.map((email) => ({
    pollId: demoPoll._id,
    email,
    invitationToken: crypto.createHash('sha256').update(`${email}-${demoPollCode}`).digest('hex').substring(0, 32),
    invitedAt: publishedTime
  }));
  await ElectorateEntry.insertMany(electorateDocs);
  console.log(`✓ Electorate locked with 5 invitation records.`);

  // 6. Preload 2 anonymous votes & authorizations (leaving 3 eligible emails unvoted for live demo)
  const option1Id = demoPoll.options[0]._id;
  const option2Id = demoPoll.options[1]._id;

  // Voter 1: Alex Rivera -> Voted for Option 1
  await VotingAuthorization.create({
    pollId: demoPoll._id,
    voterEmail: eligibleEmails[0],
    verifiedAt: new Date(now.getTime() - 90 * 60 * 1000),
    isUsed: true,
    votedAt: new Date(now.getTime() - 85 * 60 * 1000)
  });
  await Ballot.create({
    pollId: demoPoll._id,
    optionId: option1Id,
    timestamp: new Date(now.getTime() - 85 * 60 * 1000)
  });

  // Voter 2: Sam Taylor -> Voted for Option 2
  await VotingAuthorization.create({
    pollId: demoPoll._id,
    voterEmail: eligibleEmails[1],
    verifiedAt: new Date(now.getTime() - 45 * 60 * 1000),
    isUsed: true,
    votedAt: new Date(now.getTime() - 40 * 60 * 1000)
  });
  await Ballot.create({
    pollId: demoPoll._id,
    optionId: option2Id,
    timestamp: new Date(now.getTime() - 40 * 60 * 1000)
  });

  console.log(`✓ Preloaded 2 anonymous Ballots (Decoupled from voter emails).`);

  // 7. Seed Audit Events for Realistic Activity Log
  await AuditEvent.create([
    {
      eventType: 'ORGANIZER_REGISTER_SUCCESS',
      actorEmail: demoEmail,
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      metadata: { role: 'organizer' }
    },
    {
      eventType: 'ELECTORATE_CREATED',
      actorEmail: demoEmail,
      timestamp: publishedTime,
      metadata: { groupName: demoGroup.name, emailCount: eligibleEmails.length }
    },
    {
      eventType: 'POLL_CREATED',
      pollId: demoPoll._id,
      actorEmail: demoEmail,
      timestamp: publishedTime,
      metadata: { pollCode: demoPollCode, title: demoPoll.title }
    },
    {
      eventType: 'POLL_PUBLISHED',
      pollId: demoPoll._id,
      actorEmail: demoEmail,
      timestamp: publishedTime,
      metadata: { pollCode: demoPollCode, eligibleCount: eligibleEmails.length }
    },
    {
      eventType: 'OTP_VERIFIED',
      pollId: demoPoll._id,
      actorEmail: eligibleEmails[0],
      timestamp: new Date(now.getTime() - 90 * 60 * 1000)
    },
    {
      eventType: 'VOTE_ACCEPTED',
      pollId: demoPoll._id,
      actorEmail: eligibleEmails[0],
      timestamp: new Date(now.getTime() - 85 * 60 * 1000)
    },
    {
      eventType: 'OTP_VERIFIED',
      pollId: demoPoll._id,
      actorEmail: eligibleEmails[1],
      timestamp: new Date(now.getTime() - 45 * 60 * 1000)
    },
    {
      eventType: 'VOTE_ACCEPTED',
      pollId: demoPoll._id,
      actorEmail: eligibleEmails[1],
      timestamp: new Date(now.getTime() - 40 * 60 * 1000)
    }
  ]);
  console.log(`✓ Seeded realistic AuditEvent logs.`);

  console.log('\n==================================================');
  console.log('DEMO SCENARIO READY FOR PRESENTATION');
  console.log('==================================================');
  console.log('ORGANIZER LOGIN:');
  console.log(`  Email:    ${demoEmail}`);
  console.log(`  Password: ${demoPassword}`);
  console.log('\nLIVE DEMO VOTER TEST EMAIL:');
  console.log(`  Poll Code: ${demoPollCode}`);
  console.log(`  Voter Email: ${eligibleEmails[2]} (Unvoted, ready for OTP demo)`);
  console.log('==================================================\n');

  await disconnectDB();
}

if (require.main === module) {
  seedDemoData().then(() => process.exit(0)).catch((err) => {
    console.error('Demo Seeding Failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDemoData };
