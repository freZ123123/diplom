const { Router } = require('express');
const { body } = require('express-validator');
const { authRequired } = require('../middleware/auth');
const { adminRequired } = require('../middleware/admin');
const { handleValidation } = require('../middleware/validate');
const multer = require('multer');
const path = require('path');
const db = require('../db');

const router = Router();

// все маршруты требуют авторизации и прав админа
router.use(authRequired, adminRequired);

// загрузка изображений
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename(req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ext ? null : new Error('Допустимые форматы: jpg, png, webp'), ext);
  }
});

// статистика для дашборда
router.get('/stats', (_req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as cnt FROM users').get().cnt;
  const totalOrders = db.prepare('SELECT COUNT(*) as cnt FROM orders').get().cnt;
  const totalRevenue = db.prepare('SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE status = "completed"').get().sum;
  const totalGames = db.prepare('SELECT COUNT(*) as cnt FROM games WHERE is_active = 1').get().cnt;
  const recentOrders = db.prepare(`
    SELECT o.*, u.username FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC LIMIT 5
  `).all();

  res.json({ totalUsers, totalOrders, totalRevenue, totalGames, recentOrders });
});

// управление играми
router.get('/games', (req, res) => {
  const games = db.prepare(`
    SELECT g.*, c.name as category_name, p.name as platform_name
    FROM games g
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN platforms p ON g.platform_id = p.id
    ORDER BY g.created_at DESC
  `).all();
  res.json({ games });
});

router.post('/games', [
  body('title').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('category_id').isInt(),
  handleValidation
], (req, res) => {
  const g = req.body;
  const slug = g.slug || g.title.toLowerCase()
    .replace(/[а-яё]/gi, c => {
      const map = { 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya' };
      return map[c.toLowerCase()] || c;
    })
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const result = db.prepare(`
    INSERT INTO games (title, slug, description, short_desc, price, old_price, category_id, platform_id, genre, release_date, developer, publisher, image_url, product_type, region, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    g.title, slug, g.description || null, g.short_desc || null,
    g.price, g.old_price || null, g.category_id, g.platform_id || null,
    g.genre || null, g.release_date || null, g.developer || null, g.publisher || null,
    g.image_url || null, g.product_type || 'key', g.region || 'global',
    g.is_featured ? 1 : 0
  );

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/games/:id', (req, res) => {
  const g = req.body;
  const fields = [];
  const values = [];

  const allowed = ['title', 'description', 'short_desc', 'price', 'old_price', 'category_id', 'platform_id', 'genre', 'release_date', 'developer', 'publisher', 'image_url', 'product_type', 'region', 'is_featured', 'is_active', 'stock'];

  for (const key of allowed) {
    if (g[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(g[key]);
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'Нет данных для обновления' });
  }

  fields.push('updated_at = datetime("now")');
  values.push(req.params.id);

  db.prepare(`UPDATE games SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  res.json({ message: 'Игра обновлена' });
});

router.delete('/games/:id', (req, res) => {
  db.prepare('UPDATE games SET is_active = 0, updated_at = datetime("now") WHERE id = ?')
    .run(req.params.id);
  res.json({ message: 'Игра деактивирована' });
});

// загрузка обложки
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// добавление ключей
router.post('/games/:id/keys', (req, res) => {
  const { keys } = req.body;
  if (!Array.isArray(keys) || keys.length === 0) {
    return res.status(400).json({ error: 'Передайте массив ключей' });
  }

  const insert = db.prepare('INSERT INTO game_keys (game_id, key_value) VALUES (?, ?)');
  const addKeys = db.transaction((gameId, keysList) => {
    for (const k of keysList) {
      insert.run(gameId, k.trim());
    }
    db.prepare('UPDATE games SET stock = stock + ? WHERE id = ?').run(keysList.length, gameId);
  });

  addKeys(req.params.id, keys);
  res.json({ message: `Добавлено ключей: ${keys.length}` });
});

// управление заказами
router.get('/orders', (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, u.username, u.email
    FROM orders o JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `).all();
  res.json({ orders });
});

router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ?, updated_at = datetime("now") WHERE id = ?')
    .run(status, req.params.id);
  res.json({ message: 'Статус обновлён' });
});

// пользователи
router.get('/users', (req, res) => {
  const users = db.prepare('SELECT id, email, username, role, balance, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

router.put('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Недопустимая роль' });
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ message: 'Роль обновлена' });
});

// промокоды
router.get('/promo', (req, res) => {
  const codes = db.prepare('SELECT * FROM promo_codes ORDER BY created_at DESC').all();
  res.json({ codes });
});

router.post('/promo', [
  body('code').notEmpty(),
  body('discount_value').isFloat({ min: 0 }),
  handleValidation
], (req, res) => {
  const p = req.body;
  const result = db.prepare(`
    INSERT INTO promo_codes (code, discount_type, discount_value, min_order, max_uses, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    p.code.toUpperCase(), p.discount_type || 'percent',
    p.discount_value, p.min_order || 0, p.max_uses || 100,
    p.expires_at || null
  );
  res.status(201).json({ id: result.lastInsertRowid });
});

router.delete('/promo/:id', (req, res) => {
  db.prepare('DELETE FROM promo_codes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Промокод удалён' });
});

module.exports = router;
