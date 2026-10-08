const express = require('express');
const router = express.Router();
const voterController = require('../controllers/voterController');
const { voterOtpRequestRateLimiter, voterOtpVerifyRateLimiter } = require('../middleware/rateLimiter');

router.get('/poll-info', voterController.getPollInfo);
router.post('/check-eligibility', voterOtpRequestRateLimiter, voterController.checkEligibilityAndSendOTP);
router.post('/verify-otp', voterOtpVerifyRateLimiter, voterController.verifyVoterOTP);
router.post('/cast-vote', voterController.verifyVoterTokenMiddleware, voterController.castVote);
router.get('/results/:id', voterController.getPollResults);

module.exports = router;
