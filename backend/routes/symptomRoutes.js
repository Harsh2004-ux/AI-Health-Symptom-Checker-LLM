const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route for symptom analysis (Protected)
router.post('/analyze', authenticateToken, symptomController.analyzeSymptoms);

module.exports = router;
