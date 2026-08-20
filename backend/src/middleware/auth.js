const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

/**
 * Authentication Middleware using JWT
 */
const authenticate = (req, res, next) => {
  let token;

  // Extract token from Authorization Bearer header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Authentication required. No token provided in Authorization header.', 401)
    );
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_evify_fleet_management_2026';
    const decoded = jwt.verify(token, secret);

    // Attach decoded user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Authentication failed. Token has expired.', 401));
    }
    return next(new AppError('Authentication failed. Invalid or malformed token.', 401));
  }
};

module.exports = authenticate;
