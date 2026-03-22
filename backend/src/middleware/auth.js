const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token manquant. Veuillez vous connecter.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      'SELECT id, name, email, role, email_verified_at FROM users WHERE id = ?',
      [decoded.id]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré.' });
  }
}

function requireVerified(req, res, next) {
  if (!req.user.email_verified_at) {
    return res.status(403).json({ success: false, message: 'Veuillez vérifier votre email avant de continuer.' });
  }
  next();
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Accès refusé. Rôle insuffisant.' });
    }
    next();
  };
}

module.exports = { authenticate, requireVerified, authorize };