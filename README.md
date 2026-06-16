# AuraCheck - AI Health Symptom Checker

A complete, production-ready MERN Stack (React + Node.js/Express + MySQL + Google Gemini LLM) application that allows users to input medical symptoms in natural language, analyzes them using artificial intelligence, and provides possible diseases, precautions, diet recommendations, and general wellness advice.

---

## 🌟 Features

1. **Authentication Module**
   - User registration & login with secure password hashing using `bcryptjs`.
   - JWT-based authentication for state management and protected routing.
   - Profile management to modify patient details or password.

2. **AI Health Checker Dashboard**
   - Interactive, user-friendly interface.
   - Supports natural language symptom inputs.
   - Includes template/sample prompts to quickly test symptoms.
   - Modern loader showing real-time feedback during analysis.

3. **Gemini LLM Integration**
   - Leverages Google's `gemini-1.5-flash` model.
   - Translates raw descriptions into structured wellness profiles.
   - Separates findings into: Possible Diseases, Severity Ratings, Precautions, Dietary Suggestions, and General Advice.

4. **Symptom History**
   - Log history of previous audits.
   - Comprehensive detail modals to review past AI suggestions.
   - Single-click delete option to clear entries.

5. **Security & Premium Styling**
   - Rate limiting to protect backend servers from DDoS/abuse.
   - Modern Tailwind v3 styling with customizable light/dark mode theme.
   - Fully responsive design compatible with desktops, tablets, and mobile devices.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (v19), Tailwind CSS, Axios, React Router DOM (v6), Lucide Icons
- **Backend**: Node.js, Express.js, JWT, Express Rate Limit
- **Database**: MySQL (using pool connection with `mysql2/promise`)
- **AI Service**: Google Gemini Generative AI SDK (`@google/generative-ai`)

---

## 📁 Project Directory Structure

```
d:\minor 2\
 ├── database.sql           # MySQL database schema script
 ├── README.md              # Project documentation and setup guide
 ├── backend/
 │    ├── config/           # Database connection & auto-setup config
 │    ├── controllers/      # Auth & symptom checker logic handlers
 │    ├── middleware/       # Route protection middleware
 │    ├── routes/           # Express router bindings
 │    ├── services/         # Gemini LLM integration service
 │    ├── .env              # Backend environment variables
 │    ├── package.json      # Backend dependencies & script definitions
 │    └── server.js         # Backend entry point
 └── frontend/
      ├── src/
      │    ├── components/  # Layout, Sidebar, and Protected routes
      │    ├── context/     # AuthContext state provider
      │    ├── pages/       # Home, Login, Register, Dashboard, Checker, History, Profile
      │    ├── services/    # Axios API client wrapper
      │    ├── App.jsx      # Navigation routing setup
      │    ├── index.css    # Tailwind CSS classes & custom animations
      │    └── main.jsx     # Root renderer
      ├── tailwind.config.js
      ├── postcss.config.js
      ├── vite.config.js
      └── package.json
```

---

## 💾 Database Schema

The database relies on two tables: `users` and `symptom_history`. The system is configured to **automatically create** the database and required tables upon server startup.

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS symptom_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  symptoms TEXT NOT NULL,
  ai_response JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 📡 API Documentation

### 🔓 Public Auth Endpoints

#### Register a New User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Body Parameters**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (201)**: Returns user model and authentication JWT token.

#### Log In Existing User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Body Parameters**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200)**: Returns user info and JWT token.

---

### 🔒 Protected Endpoints (Requires `Authorization: Bearer <token>`)

#### Update User Profile
* **URL**: `/api/auth/profile`
* **Method**: `PUT`
* **Body Parameters**:
  ```json
  {
    "name": "John Changed Name",
    "password": "newoptionalsecurepassword"
  }
  ```
* **Success Response (200)**: Updates user information.

#### Analyze Symptoms (Gemini)
* **URL**: `/api/symptoms/analyze`
* **Method**: `POST`
* **Body Parameters**:
  ```json
  {
    "symptoms": "I have an intense migraine on the left side of my head and nausea since this morning."
  }
  ```
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "analysisId": 1,
    "symptoms": "I have an intense migraine...",
    "aiResponse": {
      "possibleDiseases": ["Migraine", "Tension Headache"],
      "severity": "Medium",
      "precautions": ["Rest in a quiet, dark room", "Stay hydrated"],
      "dietRecommendations": ["Avoid caffeine and aged cheeses", "Drink ginger tea for nausea"],
      "healthAdvice": ["Monitor migraine frequency", "Establish a regular sleep schedule"],
      "doctorConsultationRequired": true
    }
  }
  ```

#### Fetch Analysis History
* **URL**: `/api/history`
* **Method**: `GET`
* **Success Response (200)**: Returns list of past symptom analysis reports.

#### Delete History Entry
* **URL**: `/api/history/:id`
* **Method**: `DELETE`
* **Success Response (200)**: Deletes specific assessment.

---

## 🚀 Setup Instructions

### 1. Database Setup
Ensure you have a MySQL server running (defaulting to Host `127.0.0.1` and Port `3306`).
You can import the schema via your MySQL CLI:
```bash
mysql -u root -p < database.sql
```
*Note: The backend is programmed to automatically check and create the database `health_symptom_checker` and its tables on startup if they do not exist.*

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Setup your environment variables by creating/modifying the `.env` file:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=health_symptom_checker
   JWT_SECRET=your_long_secure_jwt_secret_key_here
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   # Development mode (with auto reload)
   npm run dev
   
   # Production mode
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open the application at `http://localhost:5173`.

---

## ⚠️ Medical Disclaimer
AuraCheck is designed exclusively for educational and informational references. It does not perform clinical diagnosis, treatments, or medical decision support. Always consult a certified physician or call emergency services if you are experiencing severe physical symptoms.
