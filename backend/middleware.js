const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Extract token from format: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required. Please sign in.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'eduprime_secret_session_token_key_2026', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token. Access denied.' });
    }
    req.user = user; // { id: ..., role: ... }
    next();
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized. You do not have permission to access this resource.' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  requireRole: authorizeRole
};
