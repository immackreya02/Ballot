const crypto = require('crypto');
const Poll = require('../models/Poll');
const ElectorateEntry = require('../models/ElectorateEntry');
const VoterGroup = require('../models/VoterGroup');
const AuditEvent = require('../models/AuditEvent');
const Ballot = require('../models/Ballot');
const emailService = require('../services/emailService');
const { normalizeEmailList } = require('./groupController');

// Generate short human-readable Poll Code (e.g., BLT-7392)
const generatePollCode = async () => {
  let code = '';
  let exists = true;
  while (exists) {
    const num = Math.floor(1000 + Math.random() * 9000);
    code = `BLT-${num}`;
    const found = await Poll.findOne({ pollCode: code });
    if (!found) exists = false;
  }
  return code;
};

// Generate secure random invitation token
const generateInvitationToken = () => crypto.randomBytes(16).toString('hex');

// Create Poll Draft
exports.createPoll = async (req, res) => {
  try {
    const {
      title,
      description,
      options,
      resultVisibility,
      startAt,
      endAt,
      electorateSourceType,
      voterGroupId,
      specificEmails
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Poll title/question is required.' });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'At least 2 poll options are required.' });
    }

    const formattedOptions = options
      .map((opt) => (typeof opt === 'string' ? opt.trim() : opt.optionText ? opt.optionText.trim() : ''))
      .filter((opt) => opt.length > 0)
      .map((optText) => ({ optionText: optText, voteCount: 0 }));

    if (formattedOptions.length < 2) {
      return res.status(400).json({ message: 'Please provide at least 2 non-empty option choices.' });
    }

    const pollCode = await generatePollCode();

    // Determine initial electorate emails preview
    let eligibleEmails = [];
    if (electorateSourceType === 'GROUP' && voterGroupId) {
      const group = await VoterGroup.findById(voterGroupId);
      if (group) eligibleEmails = group.emails;
    } else if (specificEmails) {
      eligibleEmails = normalizeEmailList(specificEmails);
    }

    const newPoll = new Poll({
      title: title.trim(),
      description: description || '',
      pollCode,
      organizerId: req.user._id,
      organizerName: req.user.name,
      options: formattedOptions,
      status: 'DRAFT',
      resultVisibility: resultVisibility || 'LIVE',
      startAt: startAt ? new Date(startAt) : null,
      endAt: endAt ? new Date(endAt) : null,
      electorateSourceType: electorateSourceType || 'SPECIFIC',
      voterGroupId: voterGroupId || null,
      totalEligibleCount: eligibleEmails.length,
      lockedElectorate: false
    });

    await newPoll.save();

    await AuditEvent.create({
      eventType: 'POLL_CREATED',
      pollId: newPoll._id,
      actorEmail: req.user.email,
      metadata: { pollCode: newPoll.pollCode, title: newPoll.title }
    });

    res.status(201).json({
      message: 'Poll draft created successfully.',
      poll: newPoll,
      electoratePreview: {
        total: eligibleEmails.length,
        emails: eligibleEmails
      }
    });
  } catch (err) {
    console.error('Create Poll Error:', err);
    res.status(500).json({ message: 'Failed to create poll.', error: err.message });
  }
};

// Get Organizer's Polls
exports.getOrganizerPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ organizerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ polls });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch polls.', error: err.message });
  }
};

// Get Poll Details by ID (Organizer or Admin)
exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found.' });
    }

    if (req.user.role !== 'admin' && poll.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this poll.' });
    }

    // Reconstruct / verify actual vote counts from Ballot records
    const ballots = await Ballot.aggregate([
      { $match: { pollId: poll._id } },
      { $group: { _id: '$optionId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    let totalVotes = 0;
    ballots.forEach((b) => {
      countMap[b._id.toString()] = b.count;
      totalVotes += b.count;
    });

    const reconstructedOptions = poll.options.map((opt) => ({
      _id: opt._id,
      optionText: opt.optionText,
      voteCount: countMap[opt._id.toString()] || 0
    }));

    const electorateEntries = await ElectorateEntry.find({ pollId: poll._id }).select('email status invitedAt invitationToken');

    res.json({
      poll: {
        ...poll.toObject(),
        options: reconstructedOptions,
        totalVotes
      },
      electorate: electorateEntries
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch poll details.', error: err.message });
  }
};

// Update Poll Draft & Electorate
exports.updatePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found.' });

    if (req.user.role !== 'admin' && poll.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (poll.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Cannot edit poll details once it is published or opened.' });
    }

    const {
      title,
      description,
      options,
      resultVisibility,
      startAt,
      endAt,
      electorateSourceType,
      voterGroupId,
      specificEmails
    } = req.body;

    if (title) poll.title = title.trim();
    if (description !== undefined) poll.description = description;
    if (resultVisibility) poll.resultVisibility = resultVisibility;
    if (startAt !== undefined) poll.startAt = startAt ? new Date(startAt) : null;
    if (endAt !== undefined) poll.endAt = endAt ? new Date(endAt) : null;

    if (options && Array.isArray(options) && options.length >= 2) {
      poll.options = options
        .map((opt) => (typeof opt === 'string' ? opt.trim() : opt.optionText ? opt.optionText.trim() : ''))
        .filter((opt) => opt.length > 0)
        .map((optText) => ({ optionText: optText, voteCount: 0 }));
    }

    if (electorateSourceType) poll.electorateSourceType = electorateSourceType;
    if (voterGroupId !== undefined) poll.voterGroupId = voterGroupId;

    let eligibleEmails = [];
    if (poll.electorateSourceType === 'GROUP' && poll.voterGroupId) {
      const group = await VoterGroup.findById(poll.voterGroupId);
      if (group) eligibleEmails = group.emails;
    } else if (specificEmails) {
      eligibleEmails = normalizeEmailList(specificEmails);
    }

    poll.totalEligibleCount = eligibleEmails.length;
    await poll.save();

    res.json({ message: 'Poll updated successfully.', poll, eligibleEmailsPreview: eligibleEmails });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update poll.', error: err.message });
  }
};

// Publish Poll (Locks Electorate & Generates Invitations with Email Dispatch)
exports.publishPoll = async (req, res) => {
  try {
    const { specificEmails } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ message: 'Poll not found.' });

    if (req.user.role !== 'admin' && poll.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (poll.status !== 'DRAFT') {
      return res.status(400).json({ message: `Poll is already ${poll.status.toLowerCase()}.` });
    }

    // Resolve electorate emails
    let emailsToInvite = [];
    if (poll.electorateSourceType === 'GROUP' && poll.voterGroupId) {
      const group = await VoterGroup.findById(poll.voterGroupId);
      if (group) emailsToInvite = group.emails;
    } else if (specificEmails) {
      emailsToInvite = normalizeEmailList(specificEmails);
    }

    if (emailsToInvite.length === 0) {
      return res.status(400).json({ message: 'Cannot publish a poll without at least one eligible voter email.' });
    }

    // Clean up existing draft entries if any
    await ElectorateEntry.deleteMany({ pollId: poll._id });

    // Create locked ElectorateEntry records
    const electorateDocs = emailsToInvite.map((email) => ({
      pollId: poll._id,
      email,
      invitationToken: generateInvitationToken(),
      invitedAt: new Date()
    }));

    await ElectorateEntry.insertMany(electorateDocs);

    // Update poll state
    poll.totalEligibleCount = electorateDocs.length;
    poll.lockedElectorate = true;
    poll.status = 'OPEN';
    poll.publishedAt = new Date();
    await poll.save();

    await AuditEvent.create({
      eventType: 'POLL_PUBLISHED',
      pollId: poll._id,
      actorEmail: req.user.email,
      metadata: { pollCode: poll.pollCode, eligibleCount: electorateDocs.length }
    });

    await AuditEvent.create({
      eventType: 'ELECTORATE_CREATED',
      pollId: poll._id,
      actorEmail: req.user.email,
      metadata: { totalEligible: electorateDocs.length }
    });

    // Dispatch invitation emails to every eligible voter
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    for (const doc of electorateDocs) {
      const inviteUrl = `${baseUrl}/vote?token=${doc.invitationToken}`;
      await emailService.sendPollInvitation(doc.email, poll.title, poll.organizerName, inviteUrl, poll.pollCode);
    }

    res.json({
      message: `Poll published successfully! Poll Code: ${poll.pollCode}`,
      poll,
      invitationsCount: electorateDocs.length,
      sampleInvitation: {
        email: electorateDocs[0].email,
        invitationToken: electorateDocs[0].invitationToken,
        inviteUrl: `${baseUrl}/vote?token=${electorateDocs[0].invitationToken}`
      }
    });
  } catch (err) {
    console.error('Publish Poll Error:', err);
    res.status(500).json({ message: 'Failed to publish poll.', error: err.message });
  }
};

// Close Poll
exports.closePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found.' });

    if (req.user.role !== 'admin' && poll.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    poll.status = 'CLOSED';
    await poll.save();

    await AuditEvent.create({
      eventType: 'POLL_CLOSED',
      pollId: poll._id,
      actorEmail: req.user.email
    });

    if (req.io) {
      req.io.to(`poll:${poll._id}`).emit('poll-closed', { pollId: poll._id });
    }

    res.json({ message: 'Poll closed successfully.', poll });
  } catch (err) {
    res.status(500).json({ message: 'Failed to close poll.', error: err.message });
  }
};

// Archive Poll
exports.archivePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found.' });

    if (req.user.role !== 'admin' && poll.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    poll.status = 'ARCHIVED';
    await poll.save();

    await AuditEvent.create({
      eventType: 'POLL_ARCHIVED',
      pollId: poll._id,
      actorEmail: req.user.email
    });

    res.json({ message: 'Poll archived successfully.', poll });
  } catch (err) {
    res.status(500).json({ message: 'Failed to archive poll.', error: err.message });
  }
};
