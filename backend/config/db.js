const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

let pool;
let useMockDb = false;

// Mock databases for local demo mode
const mockUsers = [];
const mockHistory = [];
const mockBmiHistory = [];
const mockHealthMetrics = [];
const mockWaterIntake = [];
const mockExerciseLog = [];
const mockSleepLog = [];
const mockMedicineReminders = [];
const mockPersonalHealthRecords = [];
const mockFirstAidGuide = [];
const mockHospitals = [];
const mockDietPlans = [];

let mockUserIdCounter = 1;
let mockHistoryIdCounter = 1;
let mockBmiIdCounter = 1;
let mockMetricIdCounter = 1;
let mockWaterIdCounter = 1;
let mockExerciseIdCounter = 1;
let mockSleepIdCounter = 1;
let mockReminderIdCounter = 1;
let mockRecordIdCounter = 1;

// Initial Seeding Data
const initialFirstAid = [
  {
    category: 'Burns',
    title: 'Thermal Burns & Scalds',
    steps: '1. Cool the burn immediately with cool running water for 10-20 minutes.\n2. Remove clothing or jewelry near the burn unless stuck.\n3. Cover with clean, non-stick sterile dressing.',
    precautions: 'Do not apply ice, butter, or ointments. Do not pop blisters.'
  },
  {
    category: 'Cuts',
    title: 'Minor Wounds & Bleeding',
    steps: '1. Wash hands and clean the wound with mild soap and water.\n2. Apply gentle direct pressure with a clean cloth to stop bleeding.\n3. Apply antiseptic cream and cover with a sterile bandage.',
    precautions: 'Seek emergency attention if bleeding does not stop after 10 minutes or if the cut is deep/jagged.'
  },
  {
    category: 'Snake Bite',
    title: 'Venomous/Non-Venomous Snake Bites',
    steps: '1. Keep the patient calm and restrict movement to slow venom spread.\n2. Position the bitten limb below or at heart level.\n3. Remove constricting jewelry or clothing.\n4. Seek immediate emergency medical evacuation.',
    precautions: 'Do not cut the wound or try to suck out the venom. Do not apply a tourniquet or ice.'
  },
  {
    category: 'Fracture',
    title: 'Bone Fractures & Sprains',
    steps: '1. Do not try to realign the bone.\n2. Immobilize the injured area using a splint or sling.\n3. Apply a cold compress wrapped in a cloth to reduce swelling.\n4. Elevate the limb if possible without causing pain.',
    precautions: 'Do not massage the area. Do not attempt to force the bone back in place.'
  }
];

const initialHospitals = [
  {
    name: 'City General Hospital',
    address: '123 Health Ave, Cityville',
    contact: '(555) 019-2834',
    specialty: 'Cardiology, Pediatrics, Emergency Care'
  },
  {
    name: 'Metro Health Center',
    address: '456 Wellness Blvd, Metro City',
    contact: '(555) 023-4567',
    specialty: 'Neurology, Orthopedics, Oncology'
  },
  {
    name: 'St. Jude Medical Clinic',
    address: '789 Care Road, Green Valley',
    contact: '(555) 034-5678',
    specialty: 'General Medicine, Family Practice, Maternity'
  },
  {
    name: 'Apex Trauma & Surgical Center',
    address: '321 Urgent Way, Heights City',
    contact: '(555) 045-6789',
    specialty: 'Trauma Surgery, Critical Care, Burn Unit'
  }
];

const initialDietPlans = [
  {
    category: 'Weight Loss',
    plan_name: 'Low-Calorie Clean Eating Diet Plan',
    details: 'A calorie-deficit dietary plan focused on high-fiber vegetables, lean proteins, and complex carbohydrates to stimulate fat loss while preserving muscle tissue.',
    meals: JSON.stringify({
      breakfast: 'Oatmeal with chia seeds and berries',
      lunch: 'Grilled chicken breast with quinoa and mixed greens',
      dinner: 'Baked salmon with steamed broccoli and asparagus',
      snack: 'A handful of raw almonds or Greek yogurt'
    })
  },
  {
    category: 'Weight Gain',
    plan_name: 'High-Calorie Nutrient-Dense Bulk Diet',
    details: 'A calorie-surplus nutrition strategy containing healthy fats, proteins, and high-quality carbohydrates to support muscle recovery and controlled weight increase.',
    meals: JSON.stringify({
      breakfast: 'Scrambled eggs, avocado toast, and a glass of whole milk',
      lunch: 'Brown rice with lean beef, black beans, and olive oil dressing',
      dinner: 'Sweet potatoes, roasted turkey breast, and mixed vegetables',
      snack: 'Peanut butter banana smoothie with protein powder'
    })
  },
  {
    category: 'Diabetic Diet',
    plan_name: 'Low Glycemic Index Blood Sugar Management Plan',
    details: 'Designed to stabilize insulin and blood glucose levels. Prioritizes low GI carbohydrates, healthy monounsaturated fats, and lean proteins.',
    meals: JSON.stringify({
      breakfast: 'Spinach and mushroom egg white omelet with whole grain toast',
      lunch: 'Tuna salad with olive oil and vinegar, carrot sticks',
      dinner: 'Grilled tofu or chicken breast with sautéed cauliflower rice',
      snack: 'Celery sticks with almond butter'
    })
  },
  {
    category: 'High Protein Diet',
    plan_name: 'Muscle-Building High Protein Performance Diet',
    details: 'Optimized for bodybuilders and active adults. Focuses on elevating lean amino-acid sources to maximize muscle protein synthesis.',
    meals: JSON.stringify({
      breakfast: 'Whey protein shake, egg whites, and sliced strawberries',
      lunch: 'Teriyaki chicken breast, white rice, and broccoli',
      dinner: 'Grilled lean steak with sweet potato fries and green beans',
      snack: 'Cottage cheese with pineapple slices or beef beef jerky'
    })
  }
];

// Seed mock database initially
mockFirstAid.push(...initialFirstAid.map((item, index) => ({ id: index + 1, ...item, steps: item.steps, precautions: item.precautions })));
mockHospitals.push(...initialHospitals.map((item, index) => ({ id: index + 1, ...item })));
mockDietPlans.push(...initialDietPlans.map((item, index) => ({ id: index + 1, ...item, meals: JSON.parse(item.meals) })));

async function initializeDatabase() {
  try {
    // 1. Connect without database name to ensure the database exists
    const tempConnection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server for initialization.');

    const dbName = process.env.DB_NAME || 'health_symptom_checker';
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' verified/created.`);
    await tempConnection.end();

    // 2. Create the main connection pool targeting our database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 3. Create all tables if they do not exist
    await createTables();

    // 4. Seed static data
    await seedStaticData();

    console.log('MySQL Connection Pool initialized successfully.');
  } catch (error) {
    console.warn('\n⚠️  WARNING: Could not connect to MySQL server.');
    console.warn('⚠️  Falling back to MOCK IN-MEMORY DATABASE MODE for demonstration.\n');
    useMockDb = true;
  }
}

async function createTables() {
  const usersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const symptomHistoryTableQuery = `
    CREATE TABLE IF NOT EXISTS symptom_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      symptoms TEXT NOT NULL,
      ai_response JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const bmiHistoryTableQuery = `
    CREATE TABLE IF NOT EXISTS bmi_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      height FLOAT NOT NULL,
      weight FLOAT NOT NULL,
      bmi FLOAT NOT NULL,
      category VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const healthMetricsTableQuery = `
    CREATE TABLE IF NOT EXISTS health_metrics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      weight FLOAT,
      blood_pressure_systolic INT,
      blood_pressure_diastolic INT,
      blood_sugar INT,
      heart_rate INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const waterIntakeTableQuery = `
    CREATE TABLE IF NOT EXISTS water_intake (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      amount INT NOT NULL,
      goal INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const exerciseLogTableQuery = `
    CREATE TABLE IF NOT EXISTS exercise_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      activity_type VARCHAR(100) NOT NULL,
      duration INT NOT NULL,
      calories_burned FLOAT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const sleepLogTableQuery = `
    CREATE TABLE IF NOT EXISTS sleep_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      sleep_time DATETIME NOT NULL,
      wake_time DATETIME NOT NULL,
      total_hours FLOAT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const medicineRemindersTableQuery = `
    CREATE TABLE IF NOT EXISTS medicine_reminders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      dosage VARCHAR(100) NOT NULL,
      time VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const personalHealthRecordsTableQuery = `
    CREATE TABLE IF NOT EXISTS personal_health_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE NOT NULL,
      blood_group VARCHAR(10) NOT NULL,
      allergies TEXT NOT NULL,
      emergency_contact VARCHAR(255) NOT NULL,
      medical_history TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const firstAidGuideTableQuery = `
    CREATE TABLE IF NOT EXISTS first_aid_guide (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(100) NOT NULL,
      title VARCHAR(255) NOT NULL,
      steps TEXT NOT NULL,
      precautions TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const hospitalsTableQuery = `
    CREATE TABLE IF NOT EXISTS hospitals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      contact VARCHAR(100) NOT NULL,
      specialty VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const dietPlansTableQuery = `
    CREATE TABLE IF NOT EXISTS diet_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(100) NOT NULL,
      plan_name VARCHAR(255) NOT NULL,
      details TEXT NOT NULL,
      meals JSON NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await pool.query(usersTableQuery);
  await pool.query(symptomHistoryTableQuery);
  await pool.query(bmiHistoryTableQuery);
  await pool.query(healthMetricsTableQuery);
  await pool.query(waterIntakeTableQuery);
  await pool.query(exerciseLogTableQuery);
  await pool.query(sleepLogTableQuery);
  await pool.query(medicineRemindersTableQuery);
  await pool.query(personalHealthRecordsTableQuery);
  await pool.query(firstAidGuideTableQuery);
  await pool.query(hospitalsTableQuery);
  await pool.query(dietPlansTableQuery);
  
  console.log("Verified all database tables structure successfully.");
}

async function seedStaticData() {
  // 1. Seed First Aid
  const [firstAidRows] = await pool.query('SELECT count(*) as count FROM first_aid_guide');
  if (firstAidRows[0].count === 0) {
    for (const guide of initialFirstAid) {
      await pool.query(
        'INSERT INTO first_aid_guide (category, title, steps, precautions) VALUES (?, ?, ?, ?)',
        [guide.category, guide.title, guide.steps, guide.precautions]
      );
    }
    console.log("Seeded 'first_aid_guide' table.");
  }

  // 2. Seed Hospitals
  const [hospitalRows] = await pool.query('SELECT count(*) as count FROM hospitals');
  if (hospitalRows[0].count === 0) {
    for (const hosp of initialHospitals) {
      await pool.query(
        'INSERT INTO hospitals (name, address, contact, specialty) VALUES (?, ?, ?, ?)',
        [hosp.name, hosp.address, hosp.contact, hosp.specialty]
      );
    }
    console.log("Seeded 'hospitals' table.");
  }

  // 3. Seed Diet Plans
  const [dietRows] = await pool.query('SELECT count(*) as count FROM diet_plans');
  if (dietRows[0].count === 0) {
    for (const plan of initialDietPlans) {
      await pool.query(
        'INSERT INTO diet_plans (category, plan_name, details, meals) VALUES (?, ?, ?, ?)',
        [plan.category, plan.plan_name, plan.details, plan.meals]
      );
    }
    console.log("Seeded 'diet_plans' table.");
  }
}

// Kick off database setup
initializeDatabase();

// Export a proxy query helper
module.exports = {
  query: async (sql, params = []) => {
    if (!useMockDb) {
      if (!pool) {
        throw new Error('Database pool not initialized yet.');
      }
      const [results] = await pool.query(sql, params);
      return results;
    }

    // Normalized SQL search
    const sqlNormalized = sql.trim().replace(/\s+/g, ' ').toLowerCase();

    // === EXISTING AUTH QUERIES ===
    if (sqlNormalized.includes('select * from users where email = ?')) {
      const email = params[0];
      const match = mockUsers.find(u => u.email === email);
      return match ? [match] : [];
    }
    if (sqlNormalized.includes('insert into users')) {
      const [name, email, password] = params;
      const newUser = { id: mockUserIdCounter++, name, email, password, created_at: new Date() };
      mockUsers.push(newUser);
      return { insertId: newUser.id };
    }
    if (sqlNormalized.includes('update users set name = ?, password = ? where id = ?')) {
      const [name, password, id] = params;
      const user = mockUsers.find(u => u.id === parseInt(id));
      if (user) { user.name = name; user.password = password; }
      return { affectedRows: 1 };
    }
    if (sqlNormalized.includes('update users set name = ? where id = ?')) {
      const [name, id] = params;
      const user = mockUsers.find(u => u.id === parseInt(id));
      if (user) { user.name = name; }
      return { affectedRows: 1 };
    }

    // === SYMPTOM CHECKER QUERIES ===
    if (sqlNormalized.includes('insert into symptom_history')) {
      const [userId, symptoms, aiResponseStr] = params;
      const newHistory = { id: mockHistoryIdCounter++, user_id: parseInt(userId), symptoms, ai_response: JSON.parse(aiResponseStr), created_at: new Date() };
      mockHistory.push(newHistory);
      return { insertId: newHistory.id };
    }
    if (sqlNormalized.includes('select id, symptoms, ai_response, created_at from symptom_history where user_id = ?')) {
      const userId = parseInt(params[0]);
      return mockHistory.filter(h => h.user_id === userId).sort((a, b) => b.created_at - a.created_at).map(item => ({
        id: item.id, symptoms: item.symptoms, ai_response: item.ai_response, created_at: item.created_at
      }));
    }
    if (sqlNormalized.includes('select id from symptom_history where id = ? and user_id = ?')) {
      const id = parseInt(params[0]);
      const userId = parseInt(params[1]);
      const match = mockHistory.find(h => h.id === id && h.user_id === userId);
      return match ? [{ id: match.id }] : [];
    }
    if (sqlNormalized.includes('delete from symptom_history where id = ?')) {
      const id = parseInt(params[0]);
      const idx = mockHistory.findIndex(h => h.id === id);
      if (idx !== -1) mockHistory.splice(idx, 1);
      return { affectedRows: 1 };
    }

    // === BMI MODULE ===
    if (sqlNormalized.includes('insert into bmi_history')) {
      const [userId, height, weight, bmi, category] = params;
      const item = { id: mockBmiIdCounter++, user_id: parseInt(userId), height, weight, bmi, category, created_at: new Date() };
      mockBmiHistory.push(item);
      return { insertId: item.id };
    }
    if (sqlNormalized.includes('select id, height, weight, bmi, category, created_at from bmi_history where user_id = ?')) {
      const userId = parseInt(params[0]);
      return mockBmiHistory.filter(b => b.user_id === userId).sort((a,b)=>b.created_at - a.created_at);
    }

    // === HEALTH TRACKER MODULE ===
    if (sqlNormalized.includes('insert into health_metrics')) {
      const [userId, weight, bp_sys, bp_dia, sugar, pulse] = params;
      const item = { id: mockMetricIdCounter++, user_id: parseInt(userId), weight, blood_pressure_systolic: bp_sys, blood_pressure_diastolic: bp_dia, blood_sugar: sugar, heart_rate: pulse, created_at: new Date() };
      mockHealthMetrics.push(item);
      return { insertId: item.id };
    }
    if (sqlNormalized.includes('select id, weight, blood_pressure_systolic, blood_pressure_diastolic, blood_sugar, heart_rate, created_at from health_metrics where user_id = ?')) {
      const userId = parseInt(params[0]);
      return mockHealthMetrics.filter(m => m.user_id === userId).sort((a,b)=>b.created_at - a.created_at);
    }

    // === WATER INTAKE TRACKER ===
    if (sqlNormalized.includes('insert into water_intake')) {
      const [userId, amount, goal] = params;
      const item = { id: mockWaterIdCounter++, user_id: parseInt(userId), amount, goal, created_at: new Date() };
      mockWaterIntake.push(item);
      return { insertId: item.id };
    }
    if (sqlNormalized.includes('select id, amount, goal, created_at from water_intake where user_id = ?')) {
      const userId = parseInt(params[0]);
      return mockWaterIntake.filter(w => w.user_id === userId).sort((a,b)=>b.created_at - a.created_at);
    }

    // === EXERCISE TRACKER ===
    if (sqlNormalized.includes('insert into exercise_log')) {
      const [userId, type, duration, cal] = params;
      const item = { id: mockExerciseIdCounter++, user_id: parseInt(userId), activity_type: type, duration, calories_burned: cal, created_at: new Date() };
      mockExerciseLog.push(item);
      return { insertId: item.id };
    }
    if (sqlNormalized.includes('select id, activity_type, duration, calories_burned, created_at from exercise_log where user_id = ?')) {
      const userId = parseInt(params[0]);
      return mockExerciseLog.filter(e => e.user_id === userId).sort((a,b)=>b.created_at - a.created_at);
    }

    // === SLEEP TRACKER ===
    if (sqlNormalized.includes('insert into sleep_log')) {
      const [userId, sleep_time, wake_time, hours] = params;
      const item = { id: mockSleepIdCounter++, user_id: parseInt(userId), sleep_time: new Date(sleep_time), wake_time: new Date(wake_time), total_hours: parseFloat(hours), created_at: new Date() };
      mockSleepLog.push(item);
      return { insertId: item.id };
    }
    if (sqlNormalized.includes('select id, sleep_time, wake_time, total_hours, created_at from sleep_log where user_id = ?')) {
      const userId = parseInt(params[0]);
      return mockSleepLog.filter(s => s.user_id === userId).sort((a,b)=>b.created_at - a.created_at);
    }

    // === MEDICINE REMINDER ===
    if (sqlNormalized.includes('insert into medicine_reminders')) {
      const [userId, name, dosage, time] = params;
      const item = { id: mockReminderIdCounter++, user_id: parseInt(userId), name, dosage, time, created_at: new Date() };
      mockMedicineReminders.push(item);
      return { insertId: item.id };
    }
    if (sqlNormalized.includes('select id, name, dosage, time, created_at from medicine_reminders where user_id = ?')) {
      const userId = parseInt(params[0]);
      return mockMedicineReminders.filter(mr => mr.user_id === userId).sort((a,b)=>a.created_at - b.created_at);
    }
    if (sqlNormalized.includes('update medicine_reminders set name = ?, dosage = ?, time = ? where id = ? and user_id = ?')) {
      const [name, dosage, time, id, userId] = params;
      const item = mockMedicineReminders.find(mr => mr.id === parseInt(id) && mr.user_id === parseInt(userId));
      if (item) { item.name = name; item.dosage = dosage; item.time = time; }
      return { affectedRows: 1 };
    }
    if (sqlNormalized.includes('delete from medicine_reminders where id = ? and user_id = ?')) {
      const [id, userId] = params;
      const idx = mockMedicineReminders.findIndex(mr => mr.id === parseInt(id) && mr.user_id === parseInt(userId));
      if (idx !== -1) mockMedicineReminders.splice(idx, 1);
      return { affectedRows: 1 };
    }

    // === PERSONAL HEALTH RECORDS ===
    if (sqlNormalized.includes('select id, blood_group, allergies, emergency_contact, medical_history, created_at from personal_health_records where user_id = ?')) {
      const userId = parseInt(params[0]);
      const match = mockPersonalHealthRecords.find(ph => ph.user_id === userId);
      return match ? [match] : [];
    }
    if (sqlNormalized.includes('insert into personal_health_records')) {
      const [userId, blood, allergies, contact, history] = params;
      const item = { id: mockRecordIdCounter++, user_id: parseInt(userId), blood_group: blood, allergies, emergency_contact: contact, medical_history: history, created_at: new Date() };
      mockPersonalHealthRecords.push(item);
      return { insertId: item.id };
    }
    if (sqlNormalized.includes('update personal_health_records set blood_group = ?, allergies = ?, emergency_contact = ?, medical_history = ? where user_id = ?')) {
      const [blood, allergies, contact, history, userId] = params;
      let item = mockPersonalHealthRecords.find(ph => ph.user_id === parseInt(userId));
      if (!item) {
        item = { id: mockRecordIdCounter++, user_id: parseInt(userId), blood_group: blood, allergies, emergency_contact: contact, medical_history: history, created_at: new Date() };
        mockPersonalHealthRecords.push(item);
      } else {
        item.blood_group = blood;
        item.allergies = allergies;
        item.emergency_contact = contact;
        item.medical_history = history;
      }
      return { affectedRows: 1 };
    }

    // === STATIC / DIRECTORY SCHEMAS ===
    if (sqlNormalized.includes('select id, category, title, steps, precautions from first_aid_guide')) {
      return mockFirstAidGuide;
    }
    if (sqlNormalized.includes('select id, name, address, contact, specialty from hospitals')) {
      return mockHospitals;
    }
    if (sqlNormalized.includes('select id, category, plan_name, details, meals from diet_plans')) {
      return mockDietPlans;
    }

    console.warn('Unhandled mock query in extend-db:', sql, params);
    return [];
  },
  pool,
  isMocked: () => useMockDb
};
