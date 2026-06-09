const express = require('express');
const cors = require('cors');
const path = require('path');

const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const categoriesRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const reviewsRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const walletRoutes = require('./routes/wallet');
const promoRoutes = require('./routes/promo');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

// статика для загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API
app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/admin', adminRoutes);

// в production отдаём собранный фронтенд
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

module.exports = app;
