const { Router } = require('express');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { authRequired } = require('../middleware/auth');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const db = require('../db');

const router = Router();

// регистрация
router.post('/register', [
  body('email').isEmail().withMessage('Некорректный email'),
  body('username').isLength({ min: 3, max: 30 }).withMessage('Имя пользователя: от 3 до 30 символов'),
  body('password').isLength({ min: 6 }).withMessage('Пароль: минимум 6 символов'),
  handleValidation
], async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) {
      return res.status(409).json({ error: 'Пользователь с таким email или именем уже существует' });
    }

    const hashed = await hashPassword(password);
    const result = db.prepare(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)'
    ).run(email, username, hashed);

    const token = signToken({ id: result.lastInsertRowid });
    const user = db.prepare('SELECT id, email, username, role, balance, avatar_url FROM users WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// вход
router.post('/login', [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Введите пароль'),
  handleValidation
], async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = signToken({ id: user.id });
    const { password: _, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
});

// текущий пользователь
router.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user });
});

// обновление профиля
router.put('/me', authRequired, [
  body('username').optional().isLength({ min: 3, max: 30 }),
  handleValidation
], (req, res) => {
  const { username } = req.body;

  if (username) {
    const exists = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.user.id);
    if (exists) {
      return res.status(409).json({ error: 'Это имя уже занято' });
    }
    db.prepare('UPDATE users SET username = ?, updated_at = datetime("now") WHERE id = ?')
      .run(username, req.user.id);
  }

  const updated = db.prepare('SELECT id, email, username, role, balance, avatar_url FROM users WHERE id = ?')
    .get(req.user.id);
  res.json({ user: updated });
});

// смена пароля
router.put('/password', authRequired, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  handleValidation
], async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Неверный текущий пароль' });
    }

    const hashed = await hashPassword(newPassword);
    db.prepare('UPDATE users SET password = ?, updated_at = datetime("now") WHERE id = ?')
      .run(hashed, req.user.id);

    res.json({ message: 'Пароль изменён' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
