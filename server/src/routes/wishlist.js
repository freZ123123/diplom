const { Router } = require('express');
const { authRequired } = require('../middleware/auth');
const db = require('../db');

const router = Router();

router.get('/', authRequired, (req, res) => {
  const items = db.prepare(`
    SELECT w.id, w.added_at, g.id as game_id, g.title, g.slug, g.price,
           g.old_price, g.image_url, g.rating, g.product_type,
           p.name as platform_name
    FROM wishlist w
    JOIN games g ON w.game_id = g.id
    LEFT JOIN platforms p ON g.platform_id = p.id
    WHERE w.user_id = ? AND g.is_active = 1
    ORDER BY w.added_at DESC
  `).all(req.user.id);

  res.json({ items });
});

// добавить/убрать из вишлиста (toggle)
router.post('/', authRequired, (req, res) => {
  const { gameId } = req.body;

  const existing = db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND game_id = ?')
    .get(req.user.id, gameId);

  if (existing) {
    db.prepare('DELETE FROM wishlist WHERE id = ?').run(existing.id);
    return res.json({ added: false, message: 'Убрано из избранного' });
  }

  db.prepare('INSERT INTO wishlist (user_id, game_id) VALUES (?, ?)')
    .run(req.user.id, gameId);

  res.json({ added: true, message: 'Добавлено в избранное' });
});

router.delete('/:gameId', authRequired, (req, res) => {
  db.prepare('DELETE FROM wishlist WHERE user_id = ? AND game_id = ?')
    .run(req.user.id, req.params.gameId);
  res.json({ message: 'Удалено из избранного' });
});

module.exports = router;
