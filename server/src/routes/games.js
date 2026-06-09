const { Router } = require('express');
const db = require('../db');

const router = Router();

// список игр с фильтрацией и пагинацией
router.get('/', (req, res) => {
  const {
    category, platform, genre, search, type,
    sort = 'popular', page = 1, limit = 20,
    minPrice, maxPrice
  } = req.query;

  let where = ['g.is_active = 1'];
  let params = [];

  if (category) {
    where.push('c.slug = ?');
    params.push(category);
  }

  if (platform) {
    where.push('p.slug = ?');
    params.push(platform);
  }

  if (genre) {
    where.push('g.genre = ?');
    params.push(genre);
  }

  if (type) {
    where.push('g.product_type = ?');
    params.push(type);
  }

  if (search) {
    where.push('(g.title LIKE ? OR g.developer LIKE ? OR g.publisher LIKE ?)');
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  if (minPrice) {
    where.push('g.price >= ?');
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    where.push('g.price <= ?');
    params.push(Number(maxPrice));
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  let orderBy;
  switch (sort) {
    case 'price_asc': orderBy = 'g.price ASC'; break;
    case 'price_desc': orderBy = 'g.price DESC'; break;
    case 'rating': orderBy = 'g.rating DESC'; break;
    case 'newest': orderBy = 'g.created_at DESC'; break;
    default: orderBy = 'g.review_count DESC, g.rating DESC';
  }

  const offset = (Number(page) - 1) * Number(limit);

  const countRow = db.prepare(`
    SELECT COUNT(*) as total FROM games g
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN platforms p ON g.platform_id = p.id
    ${whereClause}
  `).get(...params);

  const games = db.prepare(`
    SELECT g.*, c.name as category_name, c.slug as category_slug,
           p.name as platform_name, p.slug as platform_slug
    FROM games g
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN platforms p ON g.platform_id = p.id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), offset);

  res.json({
    games,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: countRow.total,
      pages: Math.ceil(countRow.total / Number(limit))
    }
  });
});

// избранные для баннера
router.get('/featured', (_req, res) => {
  const games = db.prepare(`
    SELECT g.*, c.name as category_name, p.name as platform_name
    FROM games g
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN platforms p ON g.platform_id = p.id
    WHERE g.is_featured = 1 AND g.is_active = 1
    ORDER BY g.rating DESC
    LIMIT 6
  `).all();
  res.json({ games });
});

// одна игра по slug
router.get('/:slug', (req, res) => {
  const game = db.prepare(`
    SELECT g.*, c.name as category_name, c.slug as category_slug,
           p.name as platform_name, p.slug as platform_slug
    FROM games g
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN platforms p ON g.platform_id = p.id
    WHERE g.slug = ? AND g.is_active = 1
  `).get(req.params.slug);

  if (!game) {
    return res.status(404).json({ error: 'Игра не найдена' });
  }

  const screenshots = db.prepare(
    'SELECT url FROM game_screenshots WHERE game_id = ? ORDER BY sort_order'
  ).all(game.id);

  const keysAvailable = db.prepare(
    'SELECT COUNT(*) as count FROM game_keys WHERE game_id = ? AND is_sold = 0'
  ).get(game.id);

  res.json({
    game: {
      ...game,
      screenshots: screenshots.map(s => s.url),
      keys_available: keysAvailable.count
    }
  });
});

module.exports = router;
