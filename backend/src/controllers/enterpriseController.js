const { pool } = require('../config/db');
const fs       = require('fs');
const path     = require('path');

function getImageUrl(filename) {
  if (!filename) return null;
  return `http://localhost:5000/uploads/${filename}`;
}

function deleteImage(filename) {
  if (!filename) return;
  const filepath = path.join(__dirname, '../../uploads', filename);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
}

async function getMyEnterprise(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, c.name AS category_name
       FROM enterprises e
       JOIN categories c ON c.id = e.category_id
       WHERE e.user_id = ?`,
      [req.user.id]
    );
    const data = rows[0] ? { ...rows[0], image: getImageUrl(rows[0].image) } : null;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function createEnterprise(req, res) {
  try {
    const { name, category_id, description } = req.body;
    if (!name || !category_id) {
      if (req.file) deleteImage(req.file.filename);
      return res.status(400).json({ success: false, message: 'Nom et catégorie requis.' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM enterprises WHERE user_id = ?', [req.user.id]);
    if (existing.length) {
      if (req.file) deleteImage(req.file.filename);
      return res.status(409).json({ success: false, message: 'Vous avez déjà un store.' });
    }

    const image = req.file ? req.file.filename : null;

    const [result] = await pool.query(
      'INSERT INTO enterprises (user_id, name, category_id, description, image) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, name, category_id, description || null, image]
    );

    const [enterprise] = await pool.query(
      `SELECT e.*, c.name AS category_name FROM enterprises e
       JOIN categories c ON c.id = e.category_id WHERE e.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Store créé.',
      data: { ...enterprise[0], image: getImageUrl(enterprise[0].image) },
    });
  } catch (err) {
    if (req.file) deleteImage(req.file.filename);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

module.exports = { getMyEnterprise, createEnterprise };