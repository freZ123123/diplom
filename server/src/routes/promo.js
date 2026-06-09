const { Router } = require('express');
const { authRequired } = require('../middleware/auth');
const db = require('../db');

const router = Router();

router.post('/apply', authRequired, (req, res) => {
  const { code, total } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Введите промокод' });
  }

  const promo = db.prepare(`
    SELECT * FROM promo_codes
    WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
  `).get(code.toUpperCase());

  if (!promo) {
    return res.status(404).json({ error: 'Промокод не найден или истёк' });
  }

  if (promo.used_count >= promo.max_uses) {
    return res.status(400).json({ error: 'Промокод уже использован максимальное количество раз' });
  }

  if (total && total < promo.min_order) {
    return res.status(400).json({
      error: `Минимальная сумма заказа для этого промокода — ${promo.min_order}₽`
    });
  }

  let discount;
  if (promo.discount_type === 'percent') {
    discount = total ? Math.round(total * promo.discount_value / 100) : null;
  } else {
    discount = promo.discount_value;
  }

  res.json({
    promo: {
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      calculated_discount: discount
    }
  });
});

module.exports = router;
