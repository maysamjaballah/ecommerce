const { pool } = require('../config/db');

async function store(req, res) {
  const conn = await pool.getConnection();
  try {
    const { address, phone, notes } = req.body;
    if (!address || !phone)
      return res.status(400).json({ success: false, message: 'Adresse et téléphone requis.' });

    const [cartItems] = await conn.query(
      `SELECT ci.quantity, p.id AS product_id, p.price, p.stock, p.name
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    if (!cartItems.length)
      return res.status(400).json({ success: false, message: 'Votre panier est vide.' });

    for (const item of cartItems) {
      if (item.stock < item.quantity)
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour "${item.name}". Disponible: ${item.stock}`,
        });
    }

    const total = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity, 0
    );

    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total, status, address, phone, notes) VALUES (?, ?, "processing", ?, ?, ?)',
      [req.user.id, total, address, phone, notes || null]
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    await conn.commit();

    const [order] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    return res.status(201).json({
      success: true,
      message: 'Commande passée avec succès !',
      data: { ...order[0], items },
    });
  } catch (err) {
    await conn.rollback();
    console.error('Order error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  } finally {
    conn.release();
  }
}

async function index(req, res) {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    for (const order of orders) {
      const [countResult] = await pool.query(
        'SELECT COUNT(*) AS count FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.item_count = countResult[0].count;
    }

    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

async function show(req, res) {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!orders.length)
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });

    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name, e.name AS enterprise_name
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN enterprises e ON e.id = p.enterprise_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    return res.json({ success: true, data: { ...orders[0], items } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
}

module.exports = { store, index, show };