const { Router } = require('express');
const { authRequired } = require('../middleware/auth');
const db = require('../db');

const router = Router();

// получить корзину
router.get('/', authRequired, (req, res) => {
  const items = db.prepare(`
    SELECT ci.id, ci.quantity, ci.added_at,
           g.id as game_id, g.title, g.slug, g.price, g.old_price,
           g.image_url, g.stock, g.product_type,
           p.name as platform_name
    FROM cart_items ci
    JOIN games g ON ci.game_id = g.id
    LEFT JOIN platforms p ON g.platform_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.added_at DESC
  `).all(req.user.id);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json({ items, total });
});

// добавить в корзину
router.post('/', authRequired, (req, res) => {
  const { gameId, quantity = 1 } = req.body;

  const game = db.prepare('SELECT id, stock FROM games WHERE id = ? AND is_active = 1').get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  if (game.stock < quantity) {
    return res.status(400).json({ error: 'Недостаточно товара в наличии' });
  }

  // если уже в корзине — увеличиваем кол-во
  const existing = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND game_id = ?')
    .get(req.user.id, gameId);

  if (existing) {
    const newQty = existing.quantity + quantity;
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, game_id, quantity) VALUES (?, ?, ?)')
      .run(req.user.id, gameId, quantity);
  }

  res.json({ message: 'Добавлено в корзину' });
});

// обновить количество
router.put('/:id', authRequired, (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Некорректное количество' });
  }

  const item = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!item) {
    return res.status(404).json({ error: 'Элемент не найден' });
  }

  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, item.id);
  res.json({ message: 'Количество обновлено' });
});

// удалить из корзины
router.delete('/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  res.json({ message: 'Удалено из корзины' });
});

// очистить корзину
router.delete('/', authRequired, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'Корзина очищена' });
});

module.exports = router;
