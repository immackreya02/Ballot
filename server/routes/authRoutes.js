const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { loginRateLimiter, registerRateLimiter } = require('../middleware/rateLimiter');

router.post('/register', registerRateLimiter, authController.register);
router.post('/verify-email', authController.verifyEmailOTP);
router.post('/login', loginRateLimiter, authController.login);
router.get('/me', verifyToken, authController.getMe);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
