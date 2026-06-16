const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_development_only';

/**
 * Middleware to protect API routes with JWT verification
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // The token is typically in the format 'Bearer <token>'
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user payload (id, email, name) to the request object
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
}

module.exports = { authenticateToken };
