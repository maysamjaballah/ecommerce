const { pool } = require('../config/db');

async function getAll(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

module.exports = { getAll };