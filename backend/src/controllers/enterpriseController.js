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
      `SELECT e.*, GROUP_CONCAT(c.name SEPARATOR ', ') AS category_names,
              GROUP_CONCAT(c.id SEPARATOR ',') AS category_ids
       FROM enterprises e
       LEFT JOIN enterprise_categories ec ON ec.enterprise_id = e.id
       LEFT JOIN categories c ON c.id = ec.category_id
       WHERE e.user_id = ?
       GROUP BY e.id`,
      [req.user.id]
    );
    if (!rows.length) return res.json({ success: true, data: null });
    const data = {
      ...rows[0],
      image: getImageUrl(rows[0].image),
      category_ids: rows[0].category_ids ? rows[0].category_ids.split(',').map(Number) : [],
    };
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Enterprise error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function createEnterprise(req, res) {
  try {
    const { name, category_ids, description } = req.body;
    if (!name || !category_ids) {
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
      'INSERT INTO enterprises (user_id, name, description, image) VALUES (?, ?, ?, ?)',
      [req.user.id, name, description || null, image]
    );

    const enterpriseId = result.insertId;
    const ids = Array.isArray(category_ids) ? category_ids : [category_ids];
    for (const catId of ids) {
      await pool.query(
        'INSERT INTO enterprise_categories (enterprise_id, category_id) VALUES (?, ?)',
        [enterpriseId, catId]
      );
    }

    // Update category_id in enterprises for backward compat
    await pool.query(
      'UPDATE enterprises SET category_id = ? WHERE id = ?',
      [ids[0], enterpriseId]
    );

    const [enterprise] = await pool.query(
      `SELECT e.*, GROUP_CONCAT(c.name SEPARATOR ', ') AS category_names
       FROM enterprises e
       LEFT JOIN enterprise_categories ec ON ec.enterprise_id = e.id
       LEFT JOIN categories c ON c.id = ec.category_id
       WHERE e.id = ? GROUP BY e.id`,
      [enterpriseId]
    );

    return res.status(201).json({
      success: true,
      message: 'Store créé.',
      data: { ...enterprise[0], image: getImageUrl(enterprise[0].image) },
    });
  } catch (err) {
    if (req.file) deleteImage(req.file.filename);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}
async function updateEnterprise(req, res) {
  try {
    const { name, category_ids, description } = req.body;
    if (!name || !category_ids) {
      if (req.file) deleteImage(req.file.filename);
      return res.status(400).json({ success: false, message: 'Nom et catégorie requis.' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM enterprises WHERE user_id = ?', [req.user.id]);
    if (!existing.length) {
      if (req.file) deleteImage(req.file.filename);
      return res.status(404).json({ success: false, message: 'Store introuvable.' });
    }

    const enterprise = existing[0];
    let image = enterprise.image;
    if (req.file) {
      deleteImage(image);
      image = req.file.filename;
    }

    await pool.query(
      'UPDATE enterprises SET name = ?, description = ?, image = ? WHERE id = ?',
      [name, description || null, image, enterprise.id]
    );

    // Mettre à jour les catégories
    await pool.query('DELETE FROM enterprise_categories WHERE enterprise_id = ?', [enterprise.id]);
    const ids = Array.isArray(category_ids) ? category_ids : [category_ids];
    for (const catId of ids) {
      await pool.query(
        'INSERT INTO enterprise_categories (enterprise_id, category_id) VALUES (?, ?)',
        [enterprise.id, catId]
      );
    }

    await pool.query('UPDATE enterprises SET category_id = ? WHERE id = ?', [ids[0], enterprise.id]);

    const [updated] = await pool.query(
      `SELECT e.*, GROUP_CONCAT(c.name SEPARATOR ', ') AS category_names,
              GROUP_CONCAT(c.id SEPARATOR ',') AS category_ids
       FROM enterprises e
       LEFT JOIN enterprise_categories ec ON ec.enterprise_id = e.id
       LEFT JOIN categories c ON c.id = ec.category_id
       WHERE e.id = ? GROUP BY e.id`,
      [enterprise.id]
    );

    return res.json({
      success: true,
      message: 'Store mis à jour.',
      data: {
        ...updated[0],
        image: getImageUrl(updated[0].image),
        category_ids: updated[0].category_ids ? updated[0].category_ids.split(',').map(Number) : [],
      }
    });
  } catch (err) {
    if (req.file) deleteImage(req.file.filename);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

module.exports = { getMyEnterprise, createEnterprise, updateEnterprise };