// MS Boi - Middlewares de autenticação e autorização
const jwt = require('jsonwebtoken');
const { db, audit } = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE-ME-IN-PROD';

function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token ausente' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND active = 1').get(payload.uid);
    if (!user) return res.status(401).json({ error: 'Usuário inativo' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

function roleRequired(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (!roles.includes(req.user.role)) {
      audit(req.user.id, 'ACESSO_NEGADO', { path: req.path, roleNecessario: roles }, req);
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
}

module.exports = { authRequired, roleRequired, JWT_SECRET };
