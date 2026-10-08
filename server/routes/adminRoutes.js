const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, requireAdmin);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/polls', adminController.getAllPolls);
router.post('/polls/:id/close-override', adminController.closePollOverride);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
