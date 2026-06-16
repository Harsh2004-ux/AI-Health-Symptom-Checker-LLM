const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const h = require('../controllers/healthController');

// BMI
router.post('/bmi', authenticateToken, h.saveBmi);
router.get('/bmi', authenticateToken, h.getBmiHistory);

// Health Tracker
router.post('/metrics', authenticateToken, h.saveHealthMetric);
router.get('/metrics', authenticateToken, h.getHealthMetrics);

// Water Intake
router.post('/water', authenticateToken, h.addWaterIntake);
router.get('/water', authenticateToken, h.getWaterIntake);

// Exercise
router.post('/exercise', authenticateToken, h.logExercise);
router.get('/exercise', authenticateToken, h.getExerciseLogs);

// Sleep
router.post('/sleep', authenticateToken, h.logSleep);
router.get('/sleep', authenticateToken, h.getSleepLogs);

// Medicine Reminders
router.post('/medicine', authenticateToken, h.createReminder);
router.get('/medicine', authenticateToken, h.getReminders);
router.put('/medicine/:id', authenticateToken, h.updateReminder);
router.delete('/medicine/:id', authenticateToken, h.deleteReminder);

// Personal Health Records
router.get('/records', authenticateToken, h.getHealthRecord);
router.post('/records', authenticateToken, h.saveHealthRecord);

// First Aid
router.get('/firstaid', h.getFirstAid);

// Hospitals
router.get('/hospitals', h.getHospitals);

// Diet Plans
router.get('/diet', h.getDietPlans);

// Export
router.get('/export', authenticateToken, h.exportAllData);

module.exports = router;
