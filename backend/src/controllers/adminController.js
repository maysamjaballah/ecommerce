const { pool } = require('../config/db');
const fs       = require('fs');
const path     = require('path');

async function getStats(req, res) {
  try {
    const [[users]]    = await pool.query('SELECT COUNT(*) AS total FROM users WHERE role != "admin"');
    const [[clients]]  = await pool.query('SELECT COUNT(*) AS total FROM users WHERE role = "client"');
    const [[sellers]]  = await pool.query('SELECT COUNT(*) AS total FROM users WHERE role = "seller"');
    const [[products]] = await pool.query('SELECT COUNT(*) AS total FROM products');
    const [[orders]]   = await pool.query('SELECT COUNT(*) AS total FROM orders');
    const [[revenue]]  = await pool.query('SELECT COALESCE(SUM(total), 0) AS total FROM orders');

    return res.json({
      success: true,
      data: {
        total_users:    users.total,
        total_clients:  clients.total,
        total_sellers:  sellers.total,
        total_products: products.total,
        total_orders:   orders.total,
        total_revenue:  revenue.total,
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function getUsers(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, email_verified_at, created_at FROM users WHERE role != "admin" ORDER BY created_at DESC'
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function deleteUser(req, res) {
  try {
    const [user] = await pool.query('SELECT id, role FROM users WHERE id = ?', [req.params.id]);
    if (!user.length)
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    if (user[0].role === 'admin')
      return res.status(403).json({ success: false, message: 'Impossible de supprimer un admin.' });
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Utilisateur supprimé.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function getStores(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, c.name AS category_name, u.name AS seller_name, u.email AS seller_email,
              COUNT(p.id) AS product_count
       FROM enterprises e
       JOIN categories c ON c.id = e.category_id
       JOIN users u ON u.id = e.user_id
       LEFT JOIN products p ON p.enterprise_id = e.id
       GROUP BY e.id
       ORDER BY e.created_at DESC`
    );
    const data = rows.map(s => ({
      ...s,
      image: s.image ? `http://localhost:5000/uploads/${s.image}` : null
    }));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function deleteStore(req, res) {
  try {
    const [store] = await pool.query('SELECT * FROM enterprises WHERE id = ?', [req.params.id]);
    if (!store.length)
      return res.status(404).json({ success: false, message: 'Store introuvable.' });

    // Supprimer les images des produits
    const [products] = await pool.query('SELECT image FROM products WHERE enterprise_id = ?', [req.params.id]);
    for (const product of products) {
      if (product.image) {
        const filepath = path.join(__dirname, '../../uploads', product.image);
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      }
    }

    // Supprimer l'image du store
    if (store[0].image) {
      const filepath = path.join(__dirname, '../../uploads', store[0].image);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }

    // Supprimer le store (cascade supprime les produits)
    await pool.query('DELETE FROM enterprises WHERE id = ?', [req.params.id]);

    return res.json({ success: true, message: 'Store supprimé.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function getOrders(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT o.*, u.name AS client_name, u.email AS client_email,
              COUNT(oi.id) AS item_count
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

module.exports = { getStats, getUsers, deleteUser, getStores, deleteStore, getOrders };