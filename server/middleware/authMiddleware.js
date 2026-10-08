const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production mode.');
    }
    return 'ballot_secure_jwt_secret_key_2026_dev';
  }
  return secret;
};

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Authorization token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());

    const user = await User.findById(decoded.id).select('-passwordHash -emailVerifyOTP');
    if (!user) {
      return res.status(401).json({ message: 'User account not found or token invalid.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended by system administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired authorization token.', error: err.message });
  }
};

const requireOrganizer = (req, res, next) => {
  if (!req.user || (req.user.role !== 'organizer' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Access denied. Organizer privileges required.' });
  }
  if (!req.user.isEmailVerified) {
    return res.status(403).json({ message: 'Access denied. Email verification required before organizing polls.' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. System Administrator privileges required.' });
  }
  next();
};

module.exports = { verifyToken, requireOrganizer, requireAdmin, getJwtSecret };
