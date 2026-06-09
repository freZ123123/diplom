const db = require('./index');
const bcrypt = require('bcryptjs');

console.log('Заполняем базу данных...');

const seedAll = db.transaction(() => {
  // очищаем таблицы
  db.exec(`
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM cart_items;
    DELETE FROM reviews;
    DELETE FROM wishlist;
    DELETE FROM wallet_topups;
    DELETE FROM game_keys;
    DELETE FROM game_screenshots;
    DELETE FROM games;
    DELETE FROM categories;
    DELETE FROM platforms;
    DELETE FROM promo_codes;
    DELETE FROM users;
  `);

  // пользователи
  const adminPass = bcrypt.hashSync('admin123', 10);
  const userPass = bcrypt.hashSync('user123', 10);

  db.prepare(`INSERT INTO users (email, username, password, role, balance) VALUES (?, ?, ?, ?, ?)`).run(
    'admin@wwmarket.ru', 'admin', adminPass, 'admin', 50000
  );
  db.prepare(`INSERT INTO users (email, username, password, role, balance) VALUES (?, ?, ?, ?, ?)`).run(
    'ivan@mail.ru', 'ivan_gamer', userPass, 'user', 3500
  );
  db.prepare(`INSERT INTO users (email, username, password, role, balance) VALUES (?, ?, ?, ?, ?)`).run(
    'maria@yandex.ru', 'maria_plays', userPass, 'user', 1200
  );

  // категории
  const insertCat = db.prepare(`INSERT INTO categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)`);
  insertCat.run('Игры', 'games', 'gamepad', 1);
  insertCat.run('Подарочные карты', 'gift-cards', 'gift', 2);
  insertCat.run('Игровая валюта', 'currency', 'coins', 3);
  insertCat.run('Подписки', 'subscriptions', 'star', 4);

  // платформы
  const insertPlat = db.prepare(`INSERT INTO platforms (name, slug, icon) VALUES (?, ?, ?)`);
  insertPlat.run('Steam', 'steam', 'steam');
  insertPlat.run('PlayStation', 'playstation', 'playstation');
  insertPlat.run('Xbox', 'xbox', 'xbox');
  insertPlat.run('Nintendo', 'nintendo', 'nintendo');
  insertPlat.run('PC', 'pc', 'monitor');

  // игры
  const insertGame = db.prepare(`
    INSERT INTO games (title, slug, description, short_desc, price, old_price, category_id, platform_id, genre, release_date, developer, publisher, image_url, rating, review_count, stock, product_type, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const gamesData = [
    {
      title: 'Red Dead Redemption 2',
      slug: 'red-dead-redemption-2',
      desc: 'Эпическая история о жизни в Америке на заре современной эпохи. Масштабный и атмосферный мир, наполненный множеством историй и приключений.',
      short_desc: 'Эпический вестерн от Rockstar Games',
      price: 1899, oldPrice: 2499, catId: 1, platId: 1,
      genre: 'action', release: '2019-12-05', dev: 'Rockstar Games', pub: 'Rockstar Games',
      img: '/img/rdr2.jpg', rating: 4.8, reviews: 156, stock: 45, type: 'key', featured: 1
    },
    {
      title: 'Forza Horizon 5',
      slug: 'forza-horizon-5',
      desc: 'Ваше величайшее приключение на Horizon ждёт вас! Исследуйте яркие и постоянно меняющиеся пейзажи Мексики.',
      short_desc: 'Лучший автосимулятор на открытом мире',
      price: 2199, oldPrice: null, catId: 1, platId: 1,
      genre: 'racing', release: '2021-11-09', dev: 'Playground Games', pub: 'Xbox Game Studios',
      img: '/img/forza5.jpg', rating: 4.6, reviews: 89, stock: 30, type: 'key', featured: 1
    },
    {
      title: 'Ведьмак 3: Дикая Охота',
      slug: 'witcher-3-wild-hunt',
      desc: 'Вы — Геральт из Ривии, наёмный убийца монстров. Перед вами мир, разорённый войной и наводнённый чудовищами.',
      short_desc: 'RPG года с открытым миром',
      price: 599, oldPrice: 1199, catId: 1, platId: 1,
      genre: 'rpg', release: '2015-05-19', dev: 'CD Projekt RED', pub: 'CD Projekt',
      img: '/img/witcher3.jpg', rating: 4.9, reviews: 312, stock: 80, type: 'key', featured: 1
    },
    {
      title: 'Grand Theft Auto V Enhanced',
      slug: 'gta-v-enhanced',
      desc: 'Когда молодой уличный аферист, отставной грабитель банков и жуткий психопат оказываются замешаны в череду криминальных разборок — им приходится идти на рискованные ограбления.',
      short_desc: 'Легендарный экшен в открытом мире',
      price: 2499, oldPrice: 2999, catId: 1, platId: 1,
      genre: 'action', release: '2022-03-15', dev: 'Rockstar North', pub: 'Rockstar Games',
      img: '/img/gta5.jpg', rating: 4.7, reviews: 445, stock: 60, type: 'key', featured: 1
    },
    {
      title: 'Anno 117: Pax Romana',
      slug: 'anno-117-pax-romana',
      desc: 'Постройте величественную Римскую империю. Управляйте городами, торговлей и армиями в этой масштабной стратегии.',
      short_desc: 'Стратегия про Римскую империю',
      price: 3499, oldPrice: null, catId: 1, platId: 5,
      genre: 'strategy', release: '2025-06-25', dev: 'Ubisoft Mainz', pub: 'Ubisoft',
      img: '/img/anno117.jpg', rating: 4.2, reviews: 23, stock: 50, type: 'key', featured: 0
    },
    {
      title: 'Watch Dogs 2',
      slug: 'watch-dogs-2',
      desc: 'Добро пожаловать в Сан-Франциско. Играйте за Маркуса Холлоуэя — молодого хакера, который борется против несправедливости.',
      short_desc: 'Хакерский экшен в открытом мире',
      price: 499, oldPrice: 999, catId: 1, platId: 1,
      genre: 'action', release: '2016-11-29', dev: 'Ubisoft Montreal', pub: 'Ubisoft',
      img: '/img/watchdogs2.jpg', rating: 4.3, reviews: 67, stock: 40, type: 'key', featured: 0
    },
    {
      title: 'Battlefield 6',
      slug: 'battlefield-6',
      desc: 'Возвращение к масштабным сражениям. До 128 игроков на огромных картах с разрушаемым окружением.',
      short_desc: 'Масштабный онлайн-шутер',
      price: 3999, oldPrice: null, catId: 1, platId: 1,
      genre: 'shooter', release: '2025-10-20', dev: 'DICE', pub: 'Electronic Arts',
      img: '/img/bf6.jpg', rating: 0, reviews: 0, stock: 100, type: 'key', featured: 0
    },
    {
      title: 'Cyberpunk 2077',
      slug: 'cyberpunk-2077',
      desc: 'Cyberpunk 2077 — приключенческий ролевой боевик, действие которого происходит в Найт-Сити, мегаполисе, помешанном на власти и модификациях тела.',
      short_desc: 'RPG в мире будущего от CD Projekt RED',
      price: 1499, oldPrice: 1999, catId: 1, platId: 1,
      genre: 'rpg', release: '2020-12-10', dev: 'CD Projekt RED', pub: 'CD Projekt',
      img: '/img/cyberpunk.jpg', rating: 4.5, reviews: 234, stock: 55, type: 'key', featured: 1
    },
    {
      title: 'Elden Ring',
      slug: 'elden-ring',
      desc: 'Поднимитесь, бесславные, и да направит вас благодать. Владейте силой Кольца Элден и станьте повелителем в Междуземье.',
      short_desc: 'Тёмное фэнтези от FromSoftware',
      price: 2999, oldPrice: 3499, catId: 1, platId: 1,
      genre: 'rpg', release: '2022-02-25', dev: 'FromSoftware', pub: 'Bandai Namco',
      img: '/img/eldenring.jpg', rating: 4.9, reviews: 178, stock: 35, type: 'key', featured: 1
    },
    {
      title: 'Hogwarts Legacy',
      slug: 'hogwarts-legacy',
      desc: 'Hogwarts Legacy — захватывающая ролевая игра в открытом мире, действие которой разворачивается во вселенной Гарри Поттера.',
      short_desc: 'Магическая RPG во вселенной Гарри Поттера',
      price: 1999, oldPrice: 2499, catId: 1, platId: 1,
      genre: 'rpg', release: '2023-02-10', dev: 'Avalanche Software', pub: 'Warner Bros.',
      img: '/img/hogwarts.jpg', rating: 4.4, reviews: 142, stock: 40, type: 'key', featured: 0
    },
    {
      title: 'God of War Ragnarök',
      slug: 'god-of-war-ragnarok',
      desc: 'Кратос и Атрей отправляются в путешествие по каждому из Девяти миров в поисках ответов, в то время как асгардские силы готовятся к Рагнарёку.',
      short_desc: 'Эпический экшен про Кратоса',
      price: 2799, oldPrice: null, catId: 1, platId: 1,
      genre: 'action', release: '2024-09-19', dev: 'Santa Monica Studio', pub: 'Sony Interactive',
      img: '/img/gowr.jpg', rating: 4.8, reviews: 98, stock: 25, type: 'key', featured: 0
    },
    {
      title: 'Baldur\'s Gate 3',
      slug: 'baldurs-gate-3',
      desc: 'Соберите отряд и вернитесь в Забытые Королевства. Вас ждут история дружбы, предательства и жертвенности.',
      short_desc: 'Лучшая RPG от Larian Studios',
      price: 1999, oldPrice: null, catId: 1, platId: 1,
      genre: 'rpg', release: '2023-08-03', dev: 'Larian Studios', pub: 'Larian Studios',
      img: '/img/bg3.jpg', rating: 4.9, reviews: 267, stock: 50, type: 'key', featured: 0
    },
    // подарочные карты
    {
      title: 'Карта пополнения Steam 1000₽',
      slug: 'steam-card-1000',
      desc: 'Цифровая подарочная карта Steam номиналом 1000 рублей. Моментальная доставка кода.',
      short_desc: 'Пополнение кошелька Steam',
      price: 1000, oldPrice: null, catId: 2, platId: 1,
      genre: null, release: null, dev: 'Valve', pub: 'Valve',
      img: '/img/steam-card.jpg', rating: 4.8, reviews: 523, stock: 200, type: 'gift_card', featured: 0
    },
    {
      title: 'Карта пополнения Steam 2500₽',
      slug: 'steam-card-2500',
      desc: 'Цифровая подарочная карта Steam номиналом 2500 рублей. Моментальная доставка кода.',
      short_desc: 'Пополнение кошелька Steam',
      price: 2500, oldPrice: null, catId: 2, platId: 1,
      genre: null, release: null, dev: 'Valve', pub: 'Valve',
      img: '/img/steam-card.jpg', rating: 4.8, reviews: 312, stock: 150, type: 'gift_card', featured: 0
    },
    {
      title: 'PlayStation Store 2000₽',
      slug: 'psn-card-2000',
      desc: 'Карта пополнения кошелька PlayStation Store на 2000 рублей для российского аккаунта.',
      short_desc: 'Пополнение PSN кошелька',
      price: 2000, oldPrice: null, catId: 2, platId: 2,
      genre: null, release: null, dev: 'Sony', pub: 'Sony Interactive',
      img: '/img/psn-card.jpg', rating: 4.6, reviews: 187, stock: 100, type: 'gift_card', featured: 0
    },
    {
      title: 'Xbox Gift Card 1500₽',
      slug: 'xbox-card-1500',
      desc: 'Подарочная карта Xbox на 1500 рублей. Активация на аккаунте Microsoft.',
      short_desc: 'Пополнение Xbox аккаунта',
      price: 1500, oldPrice: null, catId: 2, platId: 3,
      genre: null, release: null, dev: 'Microsoft', pub: 'Microsoft',
      img: '/img/xbox-card.jpg', rating: 4.5, reviews: 76, stock: 80, type: 'gift_card', featured: 0
    },
    // игровая валюта
    {
      title: 'Roblox 800 Robux',
      slug: 'roblox-800-robux',
      desc: 'Код на 800 Robux для платформы Roblox. Активируйте в клиенте или на сайте.',
      short_desc: '800 Robux для Roblox',
      price: 799, oldPrice: 899, catId: 3, platId: 5,
      genre: null, release: null, dev: 'Roblox Corp', pub: 'Roblox Corp',
      img: '/img/robux.jpg', rating: 4.7, reviews: 234, stock: 300, type: 'currency', featured: 0
    },
    {
      title: 'Valorant 1000 VP',
      slug: 'valorant-1000-vp',
      desc: '1000 Valorant Points для покупки скинов, батл-пассов и других косметических предметов.',
      short_desc: '1000 VP для Valorant',
      price: 990, oldPrice: null, catId: 3, platId: 5,
      genre: null, release: null, dev: 'Riot Games', pub: 'Riot Games',
      img: '/img/vp.jpg', rating: 4.6, reviews: 145, stock: 250, type: 'currency', featured: 0
    },
    // подписки
    {
      title: 'Xbox Game Pass Ultimate — 1 мес.',
      slug: 'gamepass-ultimate-1m',
      desc: 'Подписка Xbox Game Pass Ultimate на 1 месяц. Доступ к сотням игр на Xbox и ПК + Xbox Live Gold.',
      short_desc: 'Game Pass Ultimate на месяц',
      price: 899, oldPrice: 1199, catId: 4, platId: 3,
      genre: null, release: null, dev: 'Microsoft', pub: 'Microsoft',
      img: '/img/gamepass.jpg', rating: 4.8, reviews: 356, stock: 200, type: 'subscription', featured: 0
    },
    {
      title: 'PS Plus Deluxe — 3 мес.',
      slug: 'psplus-deluxe-3m',
      desc: 'Подписка PlayStation Plus Deluxe на 3 месяца. Каталог игр, онлайн-мультиплеер и эксклюзивные скидки.',
      short_desc: 'PS Plus Deluxe на 3 месяца',
      price: 2499, oldPrice: 2799, catId: 4, platId: 2,
      genre: null, release: null, dev: 'Sony', pub: 'Sony Interactive',
      img: '/img/psplus.jpg', rating: 4.5, reviews: 189, stock: 120, type: 'subscription', featured: 0
    },
    {
      title: 'EA Play — 12 мес.',
      slug: 'ea-play-12m',
      desc: 'Годовая подписка EA Play. Доступ к коллекции игр EA, ранний доступ к новинкам и скидки.',
      short_desc: 'EA Play на год',
      price: 1999, oldPrice: 2399, catId: 4, platId: 5,
      genre: null, release: null, dev: 'Electronic Arts', pub: 'Electronic Arts',
      img: '/img/eaplay.jpg', rating: 4.3, reviews: 78, stock: 90, type: 'subscription', featured: 0
    },
    {
      title: 'Nintendo eShop 3000₽',
      slug: 'eshop-card-3000',
      desc: 'Подарочная карта Nintendo eShop на 3000 рублей. Покупайте игры и DLC для Switch.',
      short_desc: 'Пополнение Nintendo eShop',
      price: 3000, oldPrice: null, catId: 2, platId: 4,
      genre: null, release: null, dev: 'Nintendo', pub: 'Nintendo',
      img: '/img/eshop-card.jpg', rating: 4.6, reviews: 54, stock: 70, type: 'gift_card', featured: 0
    },
    {
      title: 'PUBG Mobile 660 UC',
      slug: 'pubg-660-uc',
      desc: '660 Unknown Cash для PUBG Mobile. Покупайте скины, ящики и Royal Pass.',
      short_desc: '660 UC для PUBG Mobile',
      price: 690, oldPrice: null, catId: 3, platId: 5,
      genre: null, release: null, dev: 'Krafton', pub: 'Krafton',
      img: '/img/pubg-uc.jpg', rating: 4.4, reviews: 167, stock: 180, type: 'currency', featured: 0
    },
    {
      title: 'Starfield',
      slug: 'starfield',
      desc: 'В этой ролевой игре нового поколения от Bethesda вас ждёт космическая эпопея среди бескрайних звёздных систем.',
      short_desc: 'Космическая RPG от Bethesda',
      price: 2499, oldPrice: 3999, catId: 1, platId: 1,
      genre: 'rpg', release: '2023-09-06', dev: 'Bethesda Game Studios', pub: 'Bethesda Softworks',
      img: '/img/starfield.jpg', rating: 3.9, reviews: 112, stock: 35, type: 'key', featured: 0
    }
  ];

  for (const g of gamesData) {
    insertGame.run(
      g.title, g.slug, g.desc, g.short_desc,
      g.price, g.oldPrice, g.catId, g.platId,
      g.genre, g.release, g.dev, g.pub,
      g.img, g.rating, g.reviews, g.stock, g.type, g.featured
    );
  }

  // ключи активации (по 5 на каждую игру)
  const insertKey = db.prepare(`INSERT INTO game_keys (game_id, key_value) VALUES (?, ?)`);
  const allGames = db.prepare('SELECT id, product_type FROM games').all();
  for (const game of allGames) {
    for (let i = 0; i < 5; i++) {
      const segment = () => Math.random().toString(36).substring(2, 7).toUpperCase();
      const key = `${segment()}-${segment()}-${segment()}-${segment()}`;
      insertKey.run(game.id, key);
    }
  }

  // промокоды
  const insertPromo = db.prepare(`INSERT INTO promo_codes (code, discount_type, discount_value, min_order, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?)`);
  insertPromo.run('WELCOME10', 'percent', 10, 500, 1000, '2026-12-31');
  insertPromo.run('SUMMER20', 'percent', 20, 1000, 500, '2026-09-01');
  insertPromo.run('FIRST500', 'fixed', 500, 2000, 200, '2026-06-30');
  insertPromo.run('WWMARKET', 'percent', 15, 0, 100, '2026-12-31');

  // отзывы
  const insertReview = db.prepare(`INSERT INTO reviews (user_id, game_id, rating, comment) VALUES (?, ?, ?, ?)`);
  insertReview.run(2, 1, 5, 'Лучшая игра, в которую я играл. Потрясающий мир и сюжет!');
  insertReview.run(3, 1, 5, 'Графика на высоте, геймплей затягивает на сотни часов.');
  insertReview.run(2, 3, 5, 'Шедевр. Прошёл три раза и каждый раз находил что-то новое.');
  insertReview.run(3, 4, 4, 'GTA Online всё ещё актуальна спустя столько лет.');
  insertReview.run(2, 8, 5, 'Найт-Сити — город мечты. После патчей игра работает отлично.');
  insertReview.run(3, 9, 5, 'FromSoftware снова сделали невозможное. 200 часов и не надоело.');
  insertReview.run(2, 12, 5, 'Лучшая RPG за последние годы. Larian — гении.');
  insertReview.run(3, 2, 4, 'Красивая гоночная игра, но контент быстро заканчивается.');
  insertReview.run(2, 10, 4, 'Атмосфера Хогвартса передана идеально.');
  insertReview.run(3, 11, 5, 'Кратос — лучший игровой персонаж.');

  console.log('База данных заполнена успешно!');
});

seedAll();
