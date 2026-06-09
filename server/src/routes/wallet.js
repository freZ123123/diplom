const { Router } = require('express');
const { body } = require('express-validator');
const { authRequired, authOptional } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const db = require('../db');

const router = Router();

// создать запрос на пополнение
router.post('/topup', authOptional, [
  body('service').isIn(['steam', 'playstation', 'xbox', 'roblox', 'nintendo']),
  body('login').notEmpty().withMessage('Введите логин'),
  body('amount').isFloat({ min: 100 }).withMessage('Минимальная сумма — 100'),
  body('currency').optional().isIn(['RUB', 'KZT', 'USD']),
  handleValidation
], (req, res) => {
  const { service, login, amount, currency = 'RUB', region, paymentMethod } = req.body;
  const userId = req.user ? req.user.id : null;

  const result = db.prepare(`
    INSERT INTO wallet_topups (user_id, service, login, amount, currency, region, status, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(userId, service, login, amount, currency, region || null, paymentMethod || 'card');

  // в реальном проекте тут была бы интеграция с платёжной системой
  // пока просто ставим статус processing
  db.prepare('UPDATE wallet_topups SET status = "processing" WHERE id = ?')
    .run(result.lastInsertRowid);

  res.status(201).json({
    topup: {
      id: result.lastInsertRowid,
      status: 'processing',
      service, login, amount, currency
    }
  });
});

// история пополнений
router.get('/history', authRequired, (req, res) => {
  const history = db.prepare(`
    SELECT * FROM wallet_topups WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id);

  res.json({ history });
});

module.exports = router;
