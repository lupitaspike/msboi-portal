// MS Boi - Gestão de usuários (RH/admin)
const express = require('express');
const bcrypt = require('bcryptjs');
const { db, audit } = require('../utils/db');
const { authRequired, roleRequired } = require('../middleware/auth');

const router = express.Router();
const INITIAL_PWD = process.env.ADMIN_INITIAL_PASSWORD || 'MsBoi@2026!Trocar';

router.get('/', authRequired, roleRequired('rh', 'admin'), (req, res) => {
  const rows = db.prepare(`
    SELECT id, matricula, cpf, nome, email, cargo, setor, role, active,
           must_change_password, failed_attempts, locked_until, created_at
    FROM users ORDER BY nome
  `).all();
  // Mascara o CPF (LGPD - princípio da minimização)
  rows.forEach(u => { u.cpf = u.cpf.replace(/^(\d{3})\d{6}(\d{2})$/, '$1.***.***-$2'); });
  res.json(rows);
});

router.post('/', authRequired, roleRequired('rh', 'admin'), (req, res) => {
  const { matricula, cpf, nome, email, cargo, setor, role } = req.body || {};
  if (!matricula || !cpf || !nome) {
    return res.status(400).json({ error: 'matricula, cpf e nome são obrigatórios' });
  }
  const cpfLimpo = String(cpf).replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return res.status(400).json({ error: 'CPF inválido' });

  const hash = bcrypt.hashSync(INITIAL_PWD, 12);
  try {
    const r = db.prepare(`
      INSERT INTO users (matricula, cpf, nome, email, cargo, setor, password_hash, role, must_change_password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(matricula, cpfLimpo, nome, email || null, cargo || null, setor || null, hash, role || 'colaborador');
    audit(req.user.id, 'USUARIO_CRIADO', { novo_id: r.lastInsertRowid, matricula }, req);
    res.json({ ok: true, id: r.lastInsertRowid, senhaInicial: INITIAL_PWD });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Matrícula ou CPF já cadastrados' });
    }
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/reset-senha', authRequired, roleRequired('rh', 'admin'), (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  const hash = bcrypt.hashSync(INITIAL_PWD, 12);
  db.prepare(`UPDATE users
    SET password_hash = ?, must_change_password = 1, failed_attempts = 0, locked_until = NULL
    WHERE id = ?`).run(hash, user.id);
  audit(req.user.id, 'SENHA_RESETADA', { alvo_id: user.id }, req);
  res.json({ ok: true, senhaInicial: INITIAL_PWD });
});

router.post('/:id/toggle-active', authRequired, roleRequired('rh', 'admin'), (req, res) => {
  const user = db.prepare('SELECT id, active FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  const novoEstado = user.active ? 0 : 1;
  db.prepare('UPDATE users SET active = ? WHERE id = ?').run(novoEstado, user.id);
  audit(req.user.id, 'USUARIO_TOGGLE_ATIVO', { alvo_id: user.id, ativo: !!novoEstado }, req);
  res.json({ ok: true, active: !!novoEstado });
});

// Logs de auditoria (LGPD - art. 37: registro de operações)
router.get('/audit/log', authRequired, roleRequired('admin'), (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, u.nome AS user_nome, u.matricula AS user_matricula
    FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC LIMIT 500
  `).all();
  res.json(rows);
});

module.exports = router;
