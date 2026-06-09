PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    NOT NULL UNIQUE,
    username    TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'user',
    avatar_url  TEXT,
    balance     REAL    NOT NULL DEFAULT 0.0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    slug        TEXT    NOT NULL UNIQUE,
    icon        TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS platforms (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL UNIQUE,
    slug  TEXT NOT NULL UNIQUE,
    icon  TEXT
);

CREATE TABLE IF NOT EXISTS games (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT    NOT NULL,
    slug          TEXT    NOT NULL UNIQUE,
    description   TEXT,
    short_desc    TEXT,
    price         REAL    NOT NULL,
    old_price     REAL,
    currency      TEXT    NOT NULL DEFAULT 'RUB',
    category_id   INTEGER NOT NULL REFERENCES categories(id),
    platform_id   INTEGER REFERENCES platforms(id),
    genre         TEXT,
    release_date  TEXT,
    developer     TEXT,
    publisher     TEXT,
    image_url     TEXT,
    banner_url    TEXT,
    rating        REAL    NOT NULL DEFAULT 0,
    review_count  INTEGER NOT NULL DEFAULT 0,
    stock         INTEGER NOT NULL DEFAULT 100,
    product_type  TEXT    NOT NULL DEFAULT 'key',
    region        TEXT    DEFAULT 'global',
    is_featured   INTEGER NOT NULL DEFAULT 0,
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS game_screenshots (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id    INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    url        TEXT    NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS game_keys (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id   INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    key_value TEXT    NOT NULL,
    is_sold   INTEGER NOT NULL DEFAULT 0,
    order_id  INTEGER,
    created_at TEXT   NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cart_items (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id  INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, game_id)
);

CREATE TABLE IF NOT EXISTS promo_codes (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    code           TEXT    NOT NULL UNIQUE,
    discount_type  TEXT    NOT NULL DEFAULT 'percent',
    discount_value REAL    NOT NULL,
    min_order      REAL    NOT NULL DEFAULT 0,
    max_uses       INTEGER NOT NULL DEFAULT 100,
    used_count     INTEGER NOT NULL DEFAULT 0,
    is_active      INTEGER NOT NULL DEFAULT 1,
    expires_at     TEXT,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER NOT NULL REFERENCES users(id),
    total          REAL    NOT NULL,
    discount       REAL    NOT NULL DEFAULT 0,
    promo_code_id  INTEGER REFERENCES promo_codes(id),
    status         TEXT    NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id  INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    game_id   INTEGER NOT NULL REFERENCES games(id),
    price     REAL    NOT NULL,
    quantity  INTEGER NOT NULL DEFAULT 1,
    key_value TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id),
    game_id    INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    rating     INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, game_id)
);

CREATE TABLE IF NOT EXISTS wishlist (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id  INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    added_at TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, game_id)
);

CREATE TABLE IF NOT EXISTS wallet_topups (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER REFERENCES users(id),
    service        TEXT NOT NULL,
    login          TEXT NOT NULL,
    amount         REAL NOT NULL,
    currency       TEXT NOT NULL DEFAULT 'RUB',
    region         TEXT,
    status         TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_games_category ON games(category_id);
CREATE INDEX IF NOT EXISTS idx_games_platform ON games(platform_id);
CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);
CREATE INDEX IF NOT EXISTS idx_games_active ON games(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_game ON reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
