const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { successResponse, errorResponse } = require('../Config/response');
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) { 
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }
    return errorResponse(res, 'Authentication failed', 500);
  }
};

const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user || !roles.includes(user.userType)) { 
        return errorResponse(res, 'Access denied. Insufficient permissions.', 403); 
      }
      next();
    } catch (error) {
        errorResponse(res, 'Internal server error.', 500); 
    }
  };
};

module.exports = { authenticateToken, authorizeRoles };