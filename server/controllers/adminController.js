const User = require('../models/User');
const Poll = require('../models/Poll');
const AuditEvent = require('../models/AuditEvent');

// Get all platform users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash -emailVerifyOTP').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.', error: err.message });
  }
};

// Suspend or activate user account
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || (status !== 'active' && status !== 'suspended')) {
      return res.status(400).json({ message: 'Invalid status value. Must be active or suspended.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.status = status;
    await user.save();

    await AuditEvent.create({
      eventType: 'ADMIN_USER_STATUS_UPDATED',
      actorEmail: req.user.email,
      metadata: { targetUser: user.email, newStatus: status }
    });

    res.json({ message: `User status updated to ${status}.`, user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user status.', error: err.message });
  }
};

// Get all system polls
exports.getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json({ polls });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch system polls.', error: err.message });
  }
};

// Force close poll by admin
exports.closePollOverride = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found.' });

    poll.status = 'CLOSED';
    await poll.save();

    await AuditEvent.create({
      eventType: 'ADMIN_POLL_CLOSE_OVERRIDE',
      pollId: poll._id,
      actorEmail: req.user.email
    });

    res.json({ message: 'Poll closed via administrative override.', poll });
  } catch (err) {
    res.status(500).json({ message: 'Failed to override poll status.', error: err.message });
  }
};

// Get system-wide audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditEvent.find().sort({ timestamp: -1 }).limit(100);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs.', error: err.message });
  }
};
