const db = require('../config/db');

// ============================================================
// BMI MODULE
// ============================================================
async function saveBmi(req, res) {
  const userId = req.user.id;
  const { height, weight } = req.body;
  if (!height || !weight) return res.status(400).json({ success: false, message: 'Height and weight required.' });
  const bmi = parseFloat((weight / ((height / 100) ** 2)).toFixed(1));
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  try {
    const result = await db.query('INSERT INTO bmi_history (user_id, height, weight, bmi, category) VALUES (?, ?, ?, ?, ?)', [userId, height, weight, bmi, category]);
    res.status(201).json({ success: true, bmi, category, id: result.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to save BMI record.' });
  }
}

async function getBmiHistory(req, res) {
  const userId = req.user.id;
  try {
    const rows = await db.query('SELECT id, height, weight, bmi, category, created_at FROM bmi_history WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch BMI history.' });
  }
}

// ============================================================
// HEALTH TRACKER MODULE
// ============================================================
async function saveHealthMetric(req, res) {
  const userId = req.user.id;
  const { weight, blood_pressure_systolic, blood_pressure_diastolic, blood_sugar, heart_rate } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO health_metrics (user_id, weight, blood_pressure_systolic, blood_pressure_diastolic, blood_sugar, heart_rate) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, weight || null, blood_pressure_systolic || null, blood_pressure_diastolic || null, blood_sugar || null, heart_rate || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to save health metrics.' });
  }
}

async function getHealthMetrics(req, res) {
  const userId = req.user.id;
  try {
    const rows = await db.query('SELECT id, weight, blood_pressure_systolic, blood_pressure_diastolic, blood_sugar, heart_rate, created_at FROM health_metrics WHERE user_id = ? ORDER BY created_at ASC', [userId]);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch health metrics.' });
  }
}

// ============================================================
// WATER INTAKE TRACKER
// ============================================================
async function addWaterIntake(req, res) {
  const userId = req.user.id;
  const { amount, goal } = req.body;
  if (!amount || !goal) return res.status(400).json({ success: false, message: 'Amount and goal required.' });
  try {
    const result = await db.query('INSERT INTO water_intake (user_id, amount, goal) VALUES (?, ?, ?)', [userId, amount, goal]);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to log water intake.' });
  }
}

async function getWaterIntake(req, res) {
  const userId = req.user.id;
  try {
    const rows = await db.query('SELECT id, amount, goal, created_at FROM water_intake WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch water intake.' });
  }
}

// ============================================================
// EXERCISE TRACKER
// ============================================================
const CALORIES_PER_MINUTE = { Walking: 4, Running: 10, Cycling: 7, 'Gym Workout': 8 };

async function logExercise(req, res) {
  const userId = req.user.id;
  const { activity_type, duration } = req.body;
  if (!activity_type || !duration) return res.status(400).json({ success: false, message: 'Activity type and duration required.' });
  const calories_burned = (CALORIES_PER_MINUTE[activity_type] || 5) * parseFloat(duration);
  try {
    const result = await db.query('INSERT INTO exercise_log (user_id, activity_type, duration, calories_burned) VALUES (?, ?, ?, ?)', [userId, activity_type, duration, parseFloat(calories_burned.toFixed(1))]);
    res.status(201).json({ success: true, id: result.insertId, calories_burned: parseFloat(calories_burned.toFixed(1)) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to log exercise.' });
  }
}

async function getExerciseLogs(req, res) {
  const userId = req.user.id;
  try {
    const rows = await db.query('SELECT id, activity_type, duration, calories_burned, created_at FROM exercise_log WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch exercise logs.' });
  }
}

// ============================================================
// SLEEP TRACKER
// ============================================================
async function logSleep(req, res) {
  const userId = req.user.id;
  const { sleep_time, wake_time } = req.body;
  if (!sleep_time || !wake_time) return res.status(400).json({ success: false, message: 'Sleep and wake times required.' });
  const diffMs = new Date(wake_time) - new Date(sleep_time);
  const total_hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  if (total_hours < 0) return res.status(400).json({ success: false, message: 'Wake time must be after sleep time.' });
  try {
    const result = await db.query('INSERT INTO sleep_log (user_id, sleep_time, wake_time, total_hours) VALUES (?, ?, ?, ?)', [userId, sleep_time, wake_time, total_hours]);
    res.status(201).json({ success: true, id: result.insertId, total_hours });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to log sleep.' });
  }
}

async function getSleepLogs(req, res) {
  const userId = req.user.id;
  try {
    const rows = await db.query('SELECT id, sleep_time, wake_time, total_hours, created_at FROM sleep_log WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch sleep logs.' });
  }
}

// ============================================================
// MEDICINE REMINDERS (CRUD)
// ============================================================
async function createReminder(req, res) {
  const userId = req.user.id;
  const { name, dosage, time } = req.body;
  if (!name || !dosage || !time) return res.status(400).json({ success: false, message: 'Medicine name, dosage, and time required.' });
  try {
    const result = await db.query('INSERT INTO medicine_reminders (user_id, name, dosage, time) VALUES (?, ?, ?, ?)', [userId, name, dosage, time]);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create reminder.' });
  }
}

async function getReminders(req, res) {
  const userId = req.user.id;
  try {
    const rows = await db.query('SELECT id, name, dosage, time, created_at FROM medicine_reminders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch reminders.' });
  }
}

async function updateReminder(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, dosage, time } = req.body;
  if (!name || !dosage || !time) return res.status(400).json({ success: false, message: 'All fields required.' });
  try {
    await db.query('UPDATE medicine_reminders SET name = ?, dosage = ?, time = ? WHERE id = ? AND user_id = ?', [name, dosage, time, id, userId]);
    res.json({ success: true, message: 'Reminder updated.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update reminder.' });
  }
}

async function deleteReminder(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    await db.query('DELETE FROM medicine_reminders WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ success: true, message: 'Reminder deleted.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete reminder.' });
  }
}

// ============================================================
// PERSONAL HEALTH RECORDS
// ============================================================
async function getHealthRecord(req, res) {
  const userId = req.user.id;
  try {
    const rows = await db.query('SELECT id, blood_group, allergies, emergency_contact, medical_history, created_at FROM personal_health_records WHERE user_id = ?', [userId]);
    res.json({ success: true, data: rows[0] || null });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch health record.' });
  }
}

async function saveHealthRecord(req, res) {
  const userId = req.user.id;
  const { blood_group, allergies, emergency_contact, medical_history } = req.body;
  if (!blood_group || !emergency_contact) return res.status(400).json({ success: false, message: 'Blood group and emergency contact required.' });
  try {
    const existing = await db.query('SELECT id FROM personal_health_records WHERE user_id = ?', [userId]);
    if (existing && existing.length > 0) {
      await db.query('UPDATE personal_health_records SET blood_group = ?, allergies = ?, emergency_contact = ?, medical_history = ? WHERE user_id = ?',
        [blood_group, allergies || '', emergency_contact, medical_history || '', userId]);
    } else {
      await db.query('INSERT INTO personal_health_records (user_id, blood_group, allergies, emergency_contact, medical_history) VALUES (?, ?, ?, ?, ?)',
        [userId, blood_group, allergies || '', emergency_contact, medical_history || '']);
    }
    res.json({ success: true, message: 'Health record saved.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to save health record.' });
  }
}

// ============================================================
// FIRST AID GUIDE
// ============================================================
async function getFirstAid(req, res) {
  try {
    const rows = await db.query('SELECT id, category, title, steps, precautions FROM first_aid_guide ORDER BY category ASC', []);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch first aid guide.' });
  }
}

// ============================================================
// HOSPITAL DIRECTORY
// ============================================================
async function getHospitals(req, res) {
  try {
    const rows = await db.query('SELECT id, name, address, contact, specialty FROM hospitals ORDER BY name ASC', []);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch hospitals.' });
  }
}

// ============================================================
// DIET PLANS
// ============================================================
async function getDietPlans(req, res) {
  try {
    const rows = await db.query('SELECT id, category, plan_name, details, meals FROM diet_plans ORDER BY category ASC', []);
    // Parse meals JSON string if it's a string
    const formatted = rows.map(row => ({
      ...row,
      meals: typeof row.meals === 'string' ? JSON.parse(row.meals) : row.meals
    }));
    res.json({ success: true, data: formatted });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch diet plans.' });
  }
}

// ============================================================
// EXPORT ALL USER DATA
// ============================================================
async function exportAllData(req, res) {
  const userId = req.user.id;
  try {
    const [bmi, metrics, water, exercise, sleep, medicines, healthRecord, symptoms] = await Promise.all([
      db.query('SELECT id, height, weight, bmi, category, created_at FROM bmi_history WHERE user_id = ? ORDER BY created_at DESC', [userId]),
      db.query('SELECT id, weight, blood_pressure_systolic, blood_pressure_diastolic, blood_sugar, heart_rate, created_at FROM health_metrics WHERE user_id = ? ORDER BY created_at ASC', [userId]),
      db.query('SELECT id, amount, goal, created_at FROM water_intake WHERE user_id = ? ORDER BY created_at DESC', [userId]),
      db.query('SELECT id, activity_type, duration, calories_burned, created_at FROM exercise_log WHERE user_id = ? ORDER BY created_at DESC', [userId]),
      db.query('SELECT id, sleep_time, wake_time, total_hours, created_at FROM sleep_log WHERE user_id = ? ORDER BY created_at DESC', [userId]),
      db.query('SELECT id, name, dosage, time, created_at FROM medicine_reminders WHERE user_id = ? ORDER BY created_at DESC', [userId]),
      db.query('SELECT id, blood_group, allergies, emergency_contact, medical_history, created_at FROM personal_health_records WHERE user_id = ?', [userId]),
      db.query('SELECT id, symptoms, ai_response, created_at FROM symptom_history WHERE user_id = ? ORDER BY created_at DESC', [userId]),
    ]);
    res.json({
      success: true,
      user: { id: req.user.id, name: req.user.name, email: req.user.email },
      data: { bmi, metrics, water, exercise, sleep, medicines, healthRecord: healthRecord[0] || null, symptoms }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to export data.' });
  }
}

module.exports = {
  saveBmi, getBmiHistory,
  saveHealthMetric, getHealthMetrics,
  addWaterIntake, getWaterIntake,
  logExercise, getExerciseLogs,
  logSleep, getSleepLogs,
  createReminder, getReminders, updateReminder, deleteReminder,
  getHealthRecord, saveHealthRecord,
  getFirstAid,
  getHospitals,
  getDietPlans,
  exportAllData
};
