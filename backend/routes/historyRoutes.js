const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all analysis history for user (Protected)
router.get('/', authenticateToken, symptomController.getHistory);

// Delete specific analysis history record (Protected)
router.delete('/:id', authenticateToken, symptomController.deleteHistory);

module.exports = router;
