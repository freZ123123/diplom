const { verifyToken } = require('../utils/jwt');
const db = require('../db');

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Необходима авторизация' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    const user = db.prepare('SELECT id, email, username, role, balance, avatar_url FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
}

// необязательная авторизация — не возвращает ошибку, но если токен есть — прикрепляет пользователя
function authOptional(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = db.prepare('SELECT id, email, username, role, balance, avatar_url FROM users WHERE id = ?').get(decoded.id);
  } catch (e) {
    // ничего страшного, просто идём дальше
  }

  next();
}

module.exports = { authRequired, authOptional };
