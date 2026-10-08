const rateLimit = require('express-rate-limit');

// Rate limiter for organizer login attempts
exports.loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { message: 'Too many login attempts from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for organizer registration
exports.registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for voter OTP request / eligibility checks
exports.voterOtpRequestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: 'Too many OTP requests from this IP. Please wait before requesting another code.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for voter OTP verification
exports.voterOtpVerifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many OTP verification attempts. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false
});
