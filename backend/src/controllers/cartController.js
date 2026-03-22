const { pool } = require('../config/db');

async function fetchCart(userId) {
  const [rows] = await pool.query(
    `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock,
            e.name AS enterprise_name,
            (p.price * ci.quantity) AS subtotal
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     JOIN enterprises e ON e.id = p.enterprise_id
     WHERE ci.user_id = ?`,
    [userId]
  );
  const total = rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  return { items: rows, total };
}

async function getCart(req, res) {
  try {
    const cart = await fetchCart(req.user.id);
    return res.json({ success: true, data: cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function addItem(req, res) {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id)
      return res.status(400).json({ success: false, message: 'product_id requis.' });
    const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!product.length)
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    if (product[0].stock < 1)
      return res.status(400).json({ success: false, message: 'Produit en rupture de stock.' });
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, quantity]
    );
    const cart = await fetchCart(req.user.id);
    return res.json({ success: true, message: 'Produit ajouté au panier.', data: cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function updateItem(req, res) {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity);
    if (qty <= 0) {
      await pool.query(
        'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
        [req.user.id, req.params.product_id]
      );
    } else {
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [qty, req.user.id, req.params.product_id]
      );
    }
    const cart = await fetchCart(req.user.id);
    return res.json({ success: true, message: 'Panier mis à jour.', data: cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function removeItem(req, res) {
  try {
    await pool.query(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, req.params.product_id]
    );
    const cart = await fetchCart(req.user.id);
    return res.json({ success: true, message: 'Produit retiré du panier.', data: cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function clearCart(req, res) {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    return res.json({ success: true, message: 'Panier vidé.', data: { items: [], total: 0 } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };