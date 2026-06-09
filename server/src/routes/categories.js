const { Router } = require('express');
const db = require('../db');

const router = Router();

router.get('/', (_req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();

  // добавим количество товаров в каждой категории
  const enriched = categories.map(cat => {
    const count = db.prepare(
      'SELECT COUNT(*) as total FROM games WHERE category_id = ? AND is_active = 1'
    ).get(cat.id);
    return { ...cat, game_count: count.total };
  });

  res.json({ categories: enriched });
});

module.exports = router;
