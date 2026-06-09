function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ${err.message}`);
  console.error(err.stack);

  const status = err.statusCode || 500;
  const message = status === 500 ? 'Внутренняя ошибка сервера' : err.message;

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
