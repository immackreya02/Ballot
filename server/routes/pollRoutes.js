const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const { verifyToken, requireOrganizer } = require('../middleware/authMiddleware');

router.use(verifyToken, requireOrganizer);

router.post('/', pollController.createPoll);
router.get('/', pollController.getOrganizerPolls);
router.get('/:id', pollController.getPollById);
router.put('/:id', pollController.updatePoll);
router.post('/:id/publish', pollController.publishPoll);
router.post('/:id/close', pollController.closePoll);
router.post('/:id/archive', pollController.archivePoll);

module.exports = router;
