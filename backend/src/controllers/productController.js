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

async function getAll(req, res) {
  try {
    console.log('BODY:', req.body);
console.log('FILE:', req.file);
    const { search } = req.query;
    let sql = `
      SELECT p.*, e.name AS enterprise_name, c.name AS category_name
      FROM products p
      JOIN enterprises e ON e.id = p.enterprise_id
      JOIN categories c  ON c.id = e.category_id
    `;
    const params = [];
    if (search) {
      sql += ' WHERE p.name LIKE ? OR p.description LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY p.created_at DESC';
    const [rows] = await pool.query(sql, params);
    const data = rows.map(p => ({ ...p, image: getImageUrl(p.image) }));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function getOne(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, e.name AS enterprise_name, c.name AS category_name
       FROM products p
       JOIN enterprises e ON e.id = p.enterprise_id
       JOIN categories c  ON c.id = e.category_id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    const product = { ...rows[0], image: getImageUrl(rows[0].image) };
    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function getMyProducts(req, res) {
  try {
    const [enterprise] = await pool.query(
      'SELECT id FROM enterprises WHERE user_id = ?', [req.user.id]);
    if (!enterprise.length)
      return res.status(400).json({ success: false, message: "Créez votre entreprise d'abord." });
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE enterprise_id = ? ORDER BY created_at DESC',
      [enterprise[0].id]
    );
    const data = rows.map(p => ({ ...p, image: getImageUrl(p.image) }));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function create(req, res) {
  try {
    const { name, description, price, stock } = req.body;
    if (!name || price === undefined || stock === undefined) {
      if (req.file) deleteImage(req.file.filename);
      return res.status(400).json({ success: false, message: 'Nom, prix et stock requis.' });
    }
    const [enterprise] = await pool.query(
      'SELECT id FROM enterprises WHERE user_id = ?', [req.user.id]);
    if (!enterprise.length) {
      if (req.file) deleteImage(req.file.filename);
      return res.status(400).json({ success: false, message: "Créez votre entreprise d'abord." });
    }
    const image = req.file ? req.file.filename : null;
    const [result] = await pool.query(
      'INSERT INTO products (enterprise_id, name, description, price, stock, image) VALUES (?, ?, ?, ?, ?, ?)',
      [enterprise[0].id, name, description || null, parseFloat(price), parseInt(stock), image]
    );
    const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      message: 'Produit créé.',
      data: { ...product[0], image: getImageUrl(product[0].image) }
    });
  } catch (err) {
    if (req.file) deleteImage(req.file.filename);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function update(req, res) {
  try {
    const { name, description, price, stock } = req.body;
    const [enterprise] = await pool.query(
      'SELECT id FROM enterprises WHERE user_id = ?', [req.user.id]);
    if (!enterprise.length) {
      if (req.file) deleteImage(req.file.filename);
      return res.status(400).json({ success: false, message: 'Entreprise introuvable.' });
    }
    const [product] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND enterprise_id = ?',
      [req.params.id, enterprise[0].id]
    );
    if (!product.length) {
      if (req.file) deleteImage(req.file.filename);
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    // Si nouvelle image → supprimer l'ancienne
    let image = product[0].image;
    if (req.file) {
      deleteImage(image);
      image = req.file.filename;
    }

    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image = ? WHERE id = ?',
      [name, description || null, parseFloat(price), parseInt(stock), image, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    return res.json({
      success: true,
      message: 'Produit mis à jour.',
      data: { ...updated[0], image: getImageUrl(updated[0].image) }
    });
  } catch (err) {
    if (req.file) deleteImage(req.file.filename);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function destroy(req, res) {
  try {
    const [enterprise] = await pool.query(
      'SELECT id FROM enterprises WHERE user_id = ?', [req.user.id]);
    if (!enterprise.length)
      return res.status(400).json({ success: false, message: 'Entreprise introuvable.' });
    const [product] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND enterprise_id = ?',
      [req.params.id, enterprise[0].id]
    );
    if (!product.length)
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    deleteImage(product[0].image);
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Produit supprimé.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

module.exports = { getAll, getOne, getMyProducts, create, update, destroy };