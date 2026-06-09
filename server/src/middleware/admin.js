function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  next();
}

module.exports = { adminRequired };
