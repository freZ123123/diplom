const { Router } = require('express');
const { authRequired } = require('../middleware/auth');
const db = require('../db');

const router = Router();

// создание заказа из корзины
router.post('/', authRequired, (req, res) => {
  const { paymentMethod = 'balance', promoCode } = req.body;

  const createOrder = db.transaction(() => {
    // получаем содержимое корзины
    const cartItems = db.prepare(`
      SELECT ci.*, g.price, g.title, g.stock, g.id as gid
      FROM cart_items ci
      JOIN games g ON ci.game_id = g.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    if (cartItems.length === 0) {
      throw { statusCode: 400, message: 'Корзина пуста' };
    }

    // проверяем наличие
    for (const item of cartItems) {
      const availableKeys = db.prepare(
        'SELECT COUNT(*) as cnt FROM game_keys WHERE game_id = ? AND is_sold = 0'
      ).get(item.gid);

      if (availableKeys.cnt < item.quantity) {
        throw { statusCode: 400, message: `Недостаточно ключей для "${item.title}"` };
      }
    }

    // считаем итого
    let subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    let discount = 0;
    let promoId = null;

    // применяем промокод
    if (promoCode) {
      const promo = db.prepare(
        `SELECT * FROM promo_codes WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))`
      ).get(promoCode.toUpperCase());

      if (promo && subtotal >= promo.min_order && promo.used_count < promo.max_uses) {
        if (promo.discount_type === 'percent') {
          discount = Math.round(subtotal * promo.discount_value / 100);
        } else {
          discount = promo.discount_value;
        }
        promoId = promo.id;

        db.prepare('UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?').run(promo.id);
      }
    }

    const total = Math.max(0, subtotal - discount);

    // проверяем баланс при оплате с баланса
    if (paymentMethod === 'balance') {
      const userRow = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.user.id);
      if (userRow.balance < total) {
        throw { statusCode: 400, message: 'Недостаточно средств на балансе' };
      }
      // списываем баланс
      db.prepare('UPDATE users SET balance = balance - ?, updated_at = datetime("now") WHERE id = ?')
        .run(total, req.user.id);
    }

    // создаём заказ
    const orderResult = db.prepare(`
      INSERT INTO orders (user_id, total, discount, promo_code_id, status, payment_method)
      VALUES (?, ?, ?, ?, 'completed', ?)
    `).run(req.user.id, total, discount, promoId, paymentMethod);

    const orderId = orderResult.lastInsertRowid;

    // создаём позиции заказа и выдаём ключи
    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, game_id, price, quantity, key_value) VALUES (?, ?, ?, ?, ?)'
    );
    const markKey = db.prepare(
      'UPDATE game_keys SET is_sold = 1, order_id = ? WHERE id = ?'
    );
    const decrementStock = db.prepare(
      'UPDATE games SET stock = stock - ? WHERE id = ?'
    );

    for (const item of cartItems) {
      for (let i = 0; i < item.quantity; i++) {
        const key = db.prepare(
          'SELECT id, key_value FROM game_keys WHERE game_id = ? AND is_sold = 0 LIMIT 1'
        ).get(item.gid);

        insertItem.run(orderId, item.gid, item.price, 1, key ? key.key_value : null);

        if (key) {
          markKey.run(orderId, key.id);
        }
      }
      decrementStock.run(item.quantity, item.gid);
    }

    // очищаем корзину
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

    return orderId;
  });

  try {
    const orderId = createOrder();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db.prepare(`
      SELECT oi.*, g.title, g.slug, g.image_url
      FROM order_items oi
      JOIN games g ON oi.game_id = g.id
      WHERE oi.order_id = ?
    `).all(orderId);

    res.status(201).json({ order: { ...order, items } });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    throw err;
  }
});

// список заказов пользователя
router.get('/', authRequired, (req, res) => {
  const orders = db.prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id);

  const enriched = orders.map(order => {
    const items = db.prepare(`
      SELECT oi.*, g.title, g.slug, g.image_url
      FROM order_items oi
      JOIN games g ON oi.game_id = g.id
      WHERE oi.order_id = ?
    `).all(order.id);
    return { ...order, items };
  });

  res.json({ orders: enriched });
});

// детали одного заказа
router.get('/:id', authRequired, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!order) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }

  const items = db.prepare(`
    SELECT oi.*, g.title, g.slug, g.image_url
    FROM order_items oi
    JOIN games g ON oi.game_id = g.id
    WHERE oi.order_id = ?
  `).all(order.id);

  res.json({ order: { ...order, items } });
});

module.exports = router;
