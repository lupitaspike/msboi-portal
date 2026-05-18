// MS Boi - Rotas de autenticação
// Implementa: login com bloqueio progressivo, troca de senha obrigatória, política de senha forte.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { db, audit } = require('../utils/db');
const { authRequired, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
const LOCKOUT_MIN = parseInt(process.env.LOCKOUT_MINUTES || '30', 10);
const JWT_EXPIRES = parseInt(process.env.JWT_EXPIRES_IN || '28800', 10);

// Rate limit anti brute-force por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

// =====================================================================
// LOGIN
// Credenciais: matrícula + CPF (apenas dígitos) + senha
// =====================================================================
router.post('/login', loginLimiter, (req, res) => {
  const { matricula, cpf, senha } = req.body || {};
  if (!matricula || !cpf || !senha) {
    return res.status(400).json({ error: 'Matrícula, CPF e senha são obrigatórios' });
  }
  const cpfLimpo = String(cpf).replace(/\D/g, '');
  const user = db.prepare('SELECT * FROM users WHERE matricula = ? AND cpf = ?')
    .get(String(matricula).trim(), cpfLimpo);

  if (!user) {
    audit(null, 'LOGIN_FALHA', { matricula, motivo: 'usuario_nao_encontrado' }, req);
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  if (!user.active) {
    audit(user.id, 'LOGIN_FALHA', { motivo: 'usuario_inativo' }, req);
    return res.status(403).json({ error: 'Usuário inativo. Procure o RH.' });
  }

  // Verifica bloqueio temporário
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    audit(user.id, 'LOGIN_FALHA', { motivo: 'bloqueado' }, req);
    return res.status(423).json({
      error: `Conta bloqueada por excesso de tentativas. Tente novamente após ${user.locked_until}.`,
    });
  }

  const ok = bcrypt.compareSync(senha, user.password_hash);
  if (!ok) {
    const attempts = (user.failed_attempts || 0) + 1;
    let lockUntil = null;
    if (attempts >= MAX_ATTEMPTS) {
      lockUntil = new Date(Date.now() + LOCKOUT_MIN * 60 * 1000).toISOString();
    }
    db.prepare('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?')
      .run(attempts, lockUntil, user.id);
    audit(user.id, 'LOGIN_FALHA', { motivo: 'senha_incorreta', tentativas: attempts }, req);
    return res.status(401).json({
      error: lockUntil
        ? `Conta bloqueada por ${LOCKOUT_MIN} minutos.`
        : `Senha incorreta. ${MAX_ATTEMPTS - attempts} tentativa(s) restante(s).`,
    });
  }

  // Sucesso — reseta contador
  db.prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(user.id);
  const token = jwt.sign(
    { uid: user.id, role: user.role, matricula: user.matricula },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
  audit(user.id, 'LOGIN_SUCESSO', null, req);
  res.json({
    token,
    expiresIn: JWT_EXPIRES,
    user: {
      id: user.id,
      matricula: user.matricula,
      nome: user.nome,
      cargo: user.cargo,
      setor: user.setor,
      role: user.role,
      mustChangePassword: !!user.must_change_password,
    },
  });
});

// =====================================================================
// TROCAR SENHA
// =====================================================================
function validaSenhaForte(senha) {
  if (!senha || senha.length < 8) return 'A senha precisa ter no mínimo 8 caracteres.';
  if (!/[A-Z]/.test(senha)) return 'A senha precisa ter ao menos uma letra maiúscula.';
  if (!/[a-z]/.test(senha)) return 'A senha precisa ter ao menos uma letra minúscula.';
  if (!/[0-9]/.test(senha)) return 'A senha precisa ter ao menos um número.';
  if (!/[^A-Za-z0-9]/.test(senha)) return 'A senha precisa ter ao menos um caractere especial.';
  return null;
}

router.post('/change-password', authRequired, (req, res) => {
  const { senhaAtual, novaSenha } = req.body || {};
  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ error: 'Senha atual e nova são obrigatórias' });
  }
  const erro = validaSenhaForte(novaSenha);
  if (erro) return res.status(400).json({ error: erro });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(senhaAtual, user.password_hash)) {
    audit(user.id, 'TROCA_SENHA_FALHA', { motivo: 'senha_atual_incorreta' }, req);
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }
  if (bcrypt.compareSync(novaSenha, user.password_hash)) {
    return res.status(400).json({ error: 'A nova senha não pode ser igual à anterior' });
  }
  const newHash = bcrypt.hashSync(novaSenha, 12);
  db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(newHash, user.id);
  audit(user.id, 'TROCA_SENHA_SUCESSO', null, req);
  res.json({ ok: true });
});

// =====================================================================
// ME — devolve dados do usuário logado
// =====================================================================
router.get('/me', authRequired, (req, res) => {
  const { id, matricula, nome, cargo, setor, role, must_change_password } = req.user;
  res.json({ id, matricula, nome, cargo, setor, role, mustChangePassword: !!must_change_password });
});

module.exports = router;
