const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Poll = require('../models/Poll');
const ElectorateEntry = require('../models/ElectorateEntry');
const OTPVerification = require('../models/OTPVerification');
const VotingAuthorization = require('../models/VotingAuthorization');
const Ballot = require('../models/Ballot');
const AuditEvent = require('../models/AuditEvent');
const emailService = require('../services/emailService');
const { getJwtSecret } = require('../middleware/authMiddleware');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate Voter Session Token valid for 15 minutes
const generateVoterToken = (pollId, email) => {
  return jwt.sign(
    { pollId, email, isVoterToken: true },
    getJwtSecret(),
    { expiresIn: '15m' }
  );
};

// 1. Get Public Poll Info
exports.getPollInfo = async (req, res) => {
  try {
    const { code, token } = req.query;

    let poll = null;
    let invitationEmail = null;

    if (token) {
      const entry = await ElectorateEntry.findOne({ invitationToken: token });
      if (entry) {
        poll = await Poll.findById(entry.pollId);
        invitationEmail = entry.email;
      }
    } else if (code) {
      const normalizedCode = code.toUpperCase().trim();
      poll = await Poll.findOne({ pollCode: normalizedCode });
    }

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found. Please check Poll Code or invitation link.' });
    }

    res.json({
      poll: {
        id: poll._id,
        title: poll.title,
        description: poll.description,
        pollCode: poll.pollCode,
        status: poll.status,
        organizerName: poll.organizerName,
        optionsCount: poll.options.length,
        resultVisibility: poll.resultVisibility,
        closesAt: poll.endAt
      },
      prefilledEmail: invitationEmail
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch poll info.', error: err.message });
  }
};

// 2. Check Eligibility & Request OTP
exports.checkEligibilityAndSendOTP = async (req, res) => {
  try {
    const { pollCode, invitationToken, email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let poll = null;
    if (invitationToken) {
      const entry = await ElectorateEntry.findOne({ invitationToken });
      if (entry) poll = await Poll.findById(entry.pollId);
    } else if (pollCode) {
      poll = await Poll.findOne({ pollCode: pollCode.toUpperCase().trim() });
    }

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found.' });
    }

    if (poll.status !== 'OPEN') {
      return res.status(400).json({ message: `Voting is not active. Poll is currently ${poll.status.toLowerCase()}.` });
    }

    // Check if voter belongs to poll electorate
    const electorateRecord = await ElectorateEntry.findOne({ pollId: poll._id, email: normalizedEmail });
    if (!electorateRecord) {
      await AuditEvent.create({
        eventType: 'INELIGIBLE_ATTEMPT',
        pollId: poll._id,
        actorEmail: normalizedEmail,
        metadata: { reason: 'Email not in poll electorate' }
      });
      return res.status(403).json({
        message: 'Access Denied: Your email is not included in the electorate for this poll.'
      });
    }

    // Check if voter has already exercised their voting authorization
    const existingAuth = await VotingAuthorization.findOne({ pollId: poll._id, voterEmail: normalizedEmail });
    if (existingAuth && existingAuth.isUsed) {
      await AuditEvent.create({
        eventType: 'DUPLICATE_VOTE_REJECTED',
        pollId: poll._id,
        actorEmail: normalizedEmail,
        metadata: { reason: 'Voter has already cast a vote in this poll' }
      });
      return res.status(400).json({
        hasVoted: true,
        message: 'You have already cast your vote in this poll. Each voter may vote only once.'
      });
    }

    // Rate Limiting: Check active OTP requests in last 5 mins
    const activeOTP = await OTPVerification.findOne({
      pollId: poll._id,
      email: normalizedEmail,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    let otp = '';
    const salt = await bcrypt.genSalt(10);

    if (activeOTP) {
      if (activeOTP.resendCount >= 5) {
        return res.status(429).json({ message: 'Maximum OTP request attempts reached. Please wait 5 minutes.' });
      }
      otp = generateOTP();
      activeOTP.otpHash = await bcrypt.hash(otp, salt);
      activeOTP.resendCount += 1;
      activeOTP.attempts = 0;
      await activeOTP.save();
    } else {
      otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, salt);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

      await OTPVerification.create({
        pollId: poll._id,
        email: normalizedEmail,
        otpHash,
        attempts: 0,
        resendCount: 1,
        expiresAt,
        isUsed: false
      });
    }

    await AuditEvent.create({
      eventType: 'OTP_SENT',
      pollId: poll._id,
      actorEmail: normalizedEmail
    });

    // Send real email or log in dev mode
    await emailService.sendVoterOTP(normalizedEmail, poll.title, otp);

    res.json({
      message: 'Verification OTP sent to your email address. Valid for 5 minutes.',
      pollId: poll._id,
      email: normalizedEmail,
      devOtpHint: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (err) {
    console.error('Eligibility & OTP Error:', err);
    res.status(500).json({ message: 'Failed to process eligibility request.', error: err.message });
  }
};

// 3. Verify Voter OTP & Issue Session Token
exports.verifyVoterOTP = async (req, res) => {
  try {
    const { pollId, email, otp } = req.body;

    if (!pollId || !email || !otp) {
      return res.status(400).json({ message: 'Poll ID, email, and OTP code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const poll = await Poll.findById(pollId);
    if (!poll || poll.status !== 'OPEN') {
      return res.status(400).json({ message: 'Poll is not currently open for voting.' });
    }

    const otpRecord = await OTPVerification.findOne({
      pollId,
      email: normalizedEmail,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      await AuditEvent.create({
        eventType: 'OTP_FAILED',
        pollId,
        actorEmail: normalizedEmail,
        metadata: { reason: 'Expired or missing OTP record' }
      });
      return res.status(400).json({ message: 'OTP verification code has expired or is invalid. Please request a new code.' });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new code.' });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      await AuditEvent.create({
        eventType: 'OTP_FAILED',
        pollId,
        actorEmail: normalizedEmail,
        metadata: { attempts: otpRecord.attempts }
      });
      return res.status(400).json({ message: 'Incorrect verification code.' });
    }

    // OTP Verified
    otpRecord.isUsed = true;
    await otpRecord.save();

    await AuditEvent.create({
      eventType: 'OTP_VERIFIED',
      pollId,
      actorEmail: normalizedEmail
    });

    // Create or retrieve VotingAuthorization
    let authRecord = await VotingAuthorization.findOne({ pollId, voterEmail: normalizedEmail });
    if (!authRecord) {
      authRecord = new VotingAuthorization({
        pollId,
        voterEmail: normalizedEmail,
        verifiedAt: new Date(),
        isUsed: false
      });
      await authRecord.save();
    } else if (authRecord.isUsed) {
      return res.status(400).json({ message: 'You have already voted in this poll.' });
    }

    const voterSessionToken = generateVoterToken(poll._id, normalizedEmail);

    res.json({
      message: 'OTP verified successfully! Authorization granted.',
      voterToken: voterSessionToken,
      poll: {
        id: poll._id,
        title: poll.title,
        description: poll.description,
        options: poll.options.map((opt) => ({ id: opt._id, optionText: opt.optionText }))
      }
    });
  } catch (err) {
    console.error('Verify Voter OTP Error:', err);
    res.status(500).json({ message: 'OTP verification failed.', error: err.message });
  }
};

// 4. Cast Vote
exports.castVote = async (req, res) => {
  try {
    const { optionId } = req.body;
    const { pollId, email: voterEmail } = req.voterSession;

    if (!optionId) {
      return res.status(400).json({ message: 'Option choice is required.' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found.' });
    }

    if (poll.status !== 'OPEN') {
      return res.status(400).json({ message: `Cannot cast vote. Poll is currently ${poll.status.toLowerCase()}.` });
    }

    const validOption = poll.options.id(optionId);
    if (!validOption) {
      return res.status(400).json({ message: 'Invalid option selected for this poll.' });
    }

    // Atomic VotingAuthorization state transition
    const authRecord = await VotingAuthorization.findOneAndUpdate(
      {
        pollId: poll._id,
        voterEmail: voterEmail.toLowerCase().trim(),
        isUsed: false
      },
      {
        $set: {
          isUsed: true,
          votedAt: new Date()
        }
      },
      { new: true }
    );

    if (!authRecord) {
      await AuditEvent.create({
        eventType: 'DUPLICATE_VOTE_REJECTED',
        pollId: poll._id,
        actorEmail: voterEmail,
        metadata: { reason: 'Atomic transition rejected (isUsed already true)' }
      });
      return res.status(409).json({ message: 'Duplicate vote rejected. You have already voted in this poll.' });
    }

    // Anonymous Ballot creation (NO voter email stored)
    const ballot = new Ballot({
      pollId: poll._id,
      optionId: validOption._id,
      timestamp: new Date()
    });
    await ballot.save();

    // Transactionally update cached count in Poll
    await Poll.updateOne(
      { _id: poll._id, 'options._id': validOption._id },
      { $inc: { 'options.$.voteCount': 1 } }
    );

    await AuditEvent.create({
      eventType: 'VOTE_ACCEPTED',
      pollId: poll._id,
      actorEmail: voterEmail,
      metadata: { ballotId: ballot._id }
    });

    // Reconstruct tallies from Ballot collection
    const ballotAgg = await Ballot.aggregate([
      { $match: { pollId: poll._id } },
      { $group: { _id: '$optionId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    let totalVotes = 0;
    ballotAgg.forEach((b) => {
      countMap[b._id.toString()] = b.count;
      totalVotes += b.count;
    });

    const liveTallies = poll.options.map((opt) => ({
      id: opt._id,
      optionText: opt.optionText,
      votes: countMap[opt._id.toString()] || 0,
      pct: totalVotes > 0 ? Number(((countMap[opt._id.toString()] || 0) / totalVotes * 100).toFixed(1)) : 0
    }));

    // Emit Socket.io event if resultVisibility === 'LIVE'
    if (req.io && poll.resultVisibility === 'LIVE') {
      req.io.to(`poll:${poll._id}`).emit('vote-updated', {
        pollId: poll._id,
        tallies: liveTallies,
        totalVotes
      });
    }

    res.json({
      message: 'Your vote has been cast successfully!',
      pollId: poll._id,
      resultVisibility: poll.resultVisibility,
      tallies: poll.resultVisibility !== 'AFTER_CLOSE' ? liveTallies : undefined,
      totalVotes: poll.resultVisibility !== 'AFTER_CLOSE' ? totalVotes : undefined
    });
  } catch (err) {
    console.error('Cast Vote Error:', err);
    res.status(500).json({ message: 'Failed to record vote.', error: err.message });
  }
};

// 5. Get Poll Results (Strict Backend Result Visibility Enforcement)
exports.getPollResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { voterEmail } = req.query; // Optional voter context
    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found.' });
    }

    // Backend Result Visibility Restrictions
    if (poll.resultVisibility === 'AFTER_CLOSE' && poll.status !== 'CLOSED' && poll.status !== 'ARCHIVED') {
      return res.status(403).json({
        message: 'Access Restricted: Results for this poll remain hidden until voting is closed by the organizer.',
        resultVisibility: 'AFTER_CLOSE',
        status: poll.status
      });
    }

    if (poll.resultVisibility === 'AFTER_VOTE' && poll.status === 'OPEN') {
      // Check if this specific voter has cast a vote
      if (!voterEmail) {
        return res.status(403).json({
          message: 'Access Restricted: Results are visible only after you have submitted your vote.',
          resultVisibility: 'AFTER_VOTE'
        });
      }

      const auth = await VotingAuthorization.findOne({ pollId: poll._id, voterEmail: voterEmail.toLowerCase().trim() });
      if (!auth || !auth.isUsed) {
        return res.status(403).json({
          message: 'Access Restricted: Results are visible only after you have submitted your vote.',
          resultVisibility: 'AFTER_VOTE'
        });
      }
    }

    // Reconstruct tallies directly from Ballot records
    const ballotAgg = await Ballot.aggregate([
      { $match: { pollId: poll._id } },
      { $group: { _id: '$optionId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    let totalVotes = 0;
    ballotAgg.forEach((b) => {
      countMap[b._id.toString()] = b.count;
      totalVotes += b.count;
    });

    const tallies = poll.options.map((opt) => ({
      id: opt._id,
      optionText: opt.optionText,
      votes: countMap[opt._id.toString()] || 0,
      pct: totalVotes > 0 ? Number(((countMap[opt._id.toString()] || 0) / totalVotes * 100).toFixed(1)) : 0
    }));

    res.json({
      pollId: poll._id,
      title: poll.title,
      description: poll.description,
      status: poll.status,
      resultVisibility: poll.resultVisibility,
      totalVotes,
      totalEligible: poll.totalEligibleCount,
      participationRate: poll.totalEligibleCount > 0 ? Number((totalVotes / poll.totalEligibleCount * 100).toFixed(1)) : 0,
      tallies
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch results.', error: err.message });
  }
};

// Middleware to verify Voter Session Token
exports.verifyVoterTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Voter session token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded.isVoterToken) {
      return res.status(401).json({ message: 'Invalid voter session token format.' });
    }
    req.voterSession = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Voter session expired or invalid. Please re-authenticate.', error: err.message });
  }
};
