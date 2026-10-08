const VoterGroup = require('../models/VoterGroup');
const AuditEvent = require('../models/AuditEvent');

// Helper to normalize and deduplicate email list
const normalizeEmailList = (emails) => {
  if (!Array.isArray(emails)) {
    if (typeof emails === 'string') {
      emails = emails.split(/[\n,;]/);
    } else {
      return [];
    }
  }
  const clean = emails
    .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
    .filter((e) => e.length > 0 && e.includes('@'));
  return [...new Set(clean)];
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description, emails } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Voter group name is required.' });
    }

    const normalizedEmails = normalizeEmailList(emails || []);

    const newGroup = new VoterGroup({
      name: name.trim(),
      description: description || '',
      organizerId: req.user._id,
      emails: normalizedEmails
    });

    await newGroup.save();

    await AuditEvent.create({
      eventType: 'ELECTORATE_CREATED',
      actorEmail: req.user.email,
      metadata: { groupName: newGroup.name, emailCount: normalizedEmails.length }
    });

    res.status(201).json({
      message: 'Voter group created successfully.',
      group: newGroup
    });
  } catch (err) {
    console.error('Create Group Error:', err);
    res.status(500).json({ message: 'Failed to create voter group.', error: err.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await VoterGroup.find({ organizerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch voter groups.', error: err.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await VoterGroup.findOne({ _id: req.params.id, organizerId: req.user._id });
    if (!group) {
      return res.status(404).json({ message: 'Voter group not found.' });
    }
    res.json({ group });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch voter group.', error: err.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { name, description, emails } = req.body;
    const group = await VoterGroup.findOne({ _id: req.params.id, organizerId: req.user._id });

    if (!group) {
      return res.status(404).json({ message: 'Voter group not found.' });
    }

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description;
    if (emails !== undefined) group.emails = normalizeEmailList(emails);

    await group.save();

    res.json({ message: 'Voter group updated successfully.', group });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update voter group.', error: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await VoterGroup.findOneAndDelete({ _id: req.params.id, organizerId: req.user._id });
    if (!group) {
      return res.status(404).json({ message: 'Voter group not found.' });
    }
    res.json({ message: 'Voter group deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete voter group.', error: err.message });
  }
};

exports.normalizeEmailList = normalizeEmailList;
