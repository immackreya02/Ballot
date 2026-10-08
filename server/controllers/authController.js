const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditEvent = require('../models/AuditEvent');
const emailService = require('../services/emailService');
const { getJwtSecret } = require('../middleware/authMiddleware');

// Helper to generate 6-digit random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

// Organizer Registration
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate 6-digit email OTP for verification
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, salt);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry for registration

    const userRole = role === 'admin' ? 'admin' : 'organizer';

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: userRole,
      isEmailVerified: false,
      emailVerifyOTP: otpHash,
      emailVerifyExpiry: otpExpiry
    });

    await newUser.save();

    await AuditEvent.create({
      eventType: 'ORGANIZER_REGISTER_INITIATED',
      actorEmail: normalizedEmail,
      metadata: { role: userRole }
    });

    // Send real email or log in dev mode
    await emailService.sendOrganizerRegistrationOTP(normalizedEmail, otp);

    res.status(201).json({
      message: 'Account created successfully. Please verify your email using the 6-digit OTP sent to your inbox.',
      email: normalizedEmail,
      devOtpHint: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Registration failed due to server error.', error: err.message });
  }
};

// Verify Organizer Registration Email OTP
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification OTP code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    if (!user.emailVerifyExpiry || new Date() > user.emailVerifyExpiry) {
      return res.status(400).json({ message: 'Verification OTP code has expired. Please request a new code.' });
    }

    const isMatch = await bcrypt.compare(otp, user.emailVerifyOTP);
    if (!isMatch) {
      await AuditEvent.create({
        eventType: 'OTP_FAILED',
        actorEmail: normalizedEmail,
        metadata: { context: 'ORGANIZER_EMAIL_VERIFY' }
      });
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    user.isEmailVerified = true;
    user.emailVerifyOTP = null;
    user.emailVerifyExpiry = null;
    await user.save();

    await AuditEvent.create({
      eventType: 'ORGANIZER_REGISTER_SUCCESS',
      actorEmail: normalizedEmail,
      metadata: { role: user.role }
    });

    const token = generateToken(user);

    res.json({
      message: 'Email verified successfully! Your account is active.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    console.error('Email Verification Error:', err);
    res.status(500).json({ message: 'Email verification failed.', error: err.message });
  }
};

// Organizer Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      await AuditEvent.create({
        eventType: 'ORGANIZER_LOGIN_FAILURE',
        actorEmail: normalizedEmail,
        metadata: { reason: 'User not found' }
      });
      return res.status(401).json({ message: 'Invalid email or password credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await AuditEvent.create({
        eventType: 'ORGANIZER_LOGIN_FAILURE',
        actorEmail: normalizedEmail,
        metadata: { reason: 'Password mismatch' }
      });
      return res.status(401).json({ message: 'Invalid email or password credentials.' });
    }

    if (user.status === 'suspended') {
      await AuditEvent.create({
        eventType: 'ORGANIZER_LOGIN_FAILURE',
        actorEmail: normalizedEmail,
        metadata: { reason: 'Account suspended' }
      });
      return res.status(403).json({ message: 'Account is suspended. Please contact system administrator.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Email address has not been verified yet.',
        isEmailVerified: false,
        email: user.email
      });
    }

    const token = generateToken(user);

    await AuditEvent.create({
      eventType: 'ORGANIZER_LOGIN_SUCCESS',
      actorEmail: normalizedEmail,
      metadata: { role: user.role }
    });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Login failed due to server error.', error: err.message });
  }
};

// Get authenticated user details
exports.getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      isEmailVerified: req.user.isEmailVerified,
      createdAt: req.user.createdAt
    }
  });
};

// Request password reset link/OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const otp = generateOTP();
      const salt = await bcrypt.genSalt(10);
      user.emailVerifyOTP = await bcrypt.hash(otp, salt);
      user.emailVerifyExpiry = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      await emailService.sendOrganizerRegistrationOTP(normalizedEmail, otp);
    }

    res.json({ message: 'If an account exists for this email, password reset instructions have been dispatched.' });
  } catch (err) {
    res.status(500).json({ message: 'Forgot password request failed.', error: err.message });
  }
};

// Reset password using OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.emailVerifyExpiry || new Date() > user.emailVerifyExpiry) {
      return res.status(400).json({ message: 'Invalid or expired password reset request.' });
    }

    const isMatch = await bcrypt.compare(otp, user.emailVerifyOTP);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid verification OTP.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.emailVerifyOTP = null;
    user.emailVerifyExpiry = null;
    await user.save();

    await AuditEvent.create({
      eventType: 'PASSWORD_RESET_SUCCESS',
      actorEmail: normalizedEmail
    });

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Reset password failed.', error: err.message });
  }
};
