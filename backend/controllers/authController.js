const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_development_only';

/**
 * Register a new user
 */
async function register(req, res) {
  const { name, email, password } = req.body;

  // 1. Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password.'
    });
  }

  // Email format regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }

  try {
    // 2. Check if user already exists
    const existingUsers = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Save user to database
    const insertResult = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const userId = insertResult.insertId;

    // 5. Generate JWT Token
    const token = jwt.sign(
      { id: userId, name, email },
      JWT_SECRET,
      { expiresIn: '7d' } // Token valid for 7 days
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: userId,
        name,
        email
      }
    });

  } catch (error) {
    console.error('Error in user registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.'
    });
  }
}

/**
 * Log in an existing user
 */
async function login(req, res) {
  const { email, password } = req.body;

  // 1. Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.'
    });
  }

  try {
    // 2. Check if user exists
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 4. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error in user login:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
}

/**
 * Update user profile (name and optionally password)
 */
async function updateProfile(req, res) {
  const userId = req.user.id;
  const { name, password } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Name is required.'
    });
  }

  try {
    let updateQuery;
    let queryParams;

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      updateQuery = 'UPDATE users SET name = ?, password = ? WHERE id = ?';
      queryParams = [name, hashedPassword, userId];
    } else {
      updateQuery = 'UPDATE users SET name = ? WHERE id = ?';
      queryParams = [name, userId];
    }

    await db.query(updateQuery, queryParams);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: userId,
        name,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Error in updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during profile update.'
    });
  }
}

module.exports = {
  register,
  login,
  updateProfile
};

