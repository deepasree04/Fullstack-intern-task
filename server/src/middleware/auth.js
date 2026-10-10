const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config');

/**
 * Authentication Middleware
 * Validates the JWT Bearer token from the Authorization header.
 * Attaches the authenticated user payload to req.user.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Authorization header missing.'
    });
  }

  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Format must be "Bearer <token>".'
    });
  }

  const token = parts[1];

  let secret;
  try {
    secret = getJwtSecret();
  } catch (secretErr) {
    console.error('[Auth Error] JWT secret configuration missing:', secretErr.message);
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Authentication key not configured.'
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.'
      });
    }

    // Attach verified user payload to request. Protected operations rely on req.user.id only.
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
}

module.exports = authenticateToken;
