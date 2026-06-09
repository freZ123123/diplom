const { Router } = require('express');
const { body } = require('express-validator');
const { authRequired } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const db = require('../db');

const router = Router();

// отзывы к игре
router.get('/game/:gameId', (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, u.username, u.avatar_url
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.game_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.gameId);

  res.json({ reviews });
});

// добавить отзыв
router.post('/', authRequired, [
  body('gameId').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 1000 }),
  handleValidation
], (req, res) => {
  const { gameId, rating, comment } = req.body;

  const game = db.prepare('SELECT id FROM games WHERE id = ?').get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Игра не найдена' });
  }

  // проверяем, не оставлял ли уже отзыв
  const existing = db.prepare('SELECT id FROM reviews WHERE user_id = ? AND game_id = ?')
    .get(req.user.id, gameId);

  if (existing) {
    return res.status(409).json({ error: 'Вы уже оставили отзыв к этой игре' });
  }

  db.prepare('INSERT INTO reviews (user_id, game_id, rating, comment) VALUES (?, ?, ?, ?)')
    .run(req.user.id, gameId, rating, comment || null);

  // пересчитываем средний рейтинг
  const stats = db.prepare(
    'SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE game_id = ?'
  ).get(gameId);

  db.prepare('UPDATE games SET rating = ?, review_count = ? WHERE id = ?')
    .run(Math.round(stats.avg_rating * 10) / 10, stats.cnt, gameId);

  res.status(201).json({ message: 'Отзыв добавлен' });
});

// удалить свой отзыв
router.delete('/:id', authRequired, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!review) {
    return res.status(404).json({ error: 'Отзыв не найден' });
  }

  db.prepare('DELETE FROM reviews WHERE id = ?').run(review.id);

  // пересчитываем
  const stats = db.prepare(
    'SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE game_id = ?'
  ).get(review.game_id);

  db.prepare('UPDATE games SET rating = ?, review_count = ? WHERE id = ?')
    .run(stats.avg_rating || 0, stats.cnt, review.game_id);

  res.json({ message: 'Отзыв удалён' });
});

module.exports = router;
