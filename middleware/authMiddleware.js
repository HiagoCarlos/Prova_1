const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.user?.cargo !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado - requer permissão de admin' });
  }
  next();
};