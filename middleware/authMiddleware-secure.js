// server/middleware/authMiddleware-secure.js
const User = require('../models/User');

// Secure session-based authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Check if user is logged in via session
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ 
        error: 'Access denied. Please log in.',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Get user from database using session data
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      // Clear invalid session
      req.session.destroy();
      return res.status(401).json({ 
        error: 'User not found. Please log in again.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional authentication (for routes that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue anyway
  }
};

// Check if user has specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ 
        error: `Access denied. ${role} role required.`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

module.exports = { authMiddleware, optionalAuth, requireRole };
