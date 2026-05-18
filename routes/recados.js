// MS Boi - Recados coletivos e individuais
const express = require('express');
const { db, audit } = require('../utils/db');
const { authRequired, roleRequired } = require('../middleware/auth');

const router = express.Router();

// =====================================================================
// LISTAR RECADOS para o colaborador logado
// Inclui: coletivos gerais + coletivos do setor dele + individuais para ele
// =====================================================================
router.get('/meus', authRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT r.*,
      (SELECT 1 FROM recado_leituras WHERE recado_id = r.id AND user_id = ?) AS lido
    FROM recados r
    WHERE
      (r.tipo = 'coletivo' AND (r.setor IS NULL OR r.setor = ?))
      OR (r.tipo = 'individual' AND r.user_id = ?)
    ORDER BY r.urgente DESC, r.created_at DESC
    LIMIT 100
  `).all(req.user.id, req.user.setor, req.user.id);
  res.json(rows);
});

// =====================================================================
// MARCAR COMO LIDO
// =====================================================================
router.post('/:id/lido', authRequired, (req, res) => {
  const rec = db.prepare('SELECT * FROM recados WHERE id = ?').get(req.params.id);
  if (!rec) return res.status(404).json({ error: 'Recado não encontrado' });
  // checagem de visibilidade
  const ehColetivoGeral = rec.tipo === 'coletivo' && !rec.setor;
  const ehColetivoSetor = rec.tipo === 'coletivo' && rec.setor === req.user.setor;
  const ehIndividual = rec.tipo === 'individual' && rec.user_id === req.user.id;
  if (!ehColetivoGeral && !ehColetivoSetor && !ehIndividual) {
    return res.status(403).json({ error: 'Sem permissão' });
  }
  db.prepare('INSERT OR IGNORE INTO recado_leituras (recado_id, user_id) VALUES (?, ?)')
    .run(rec.id, req.user.id);
  audit(req.user.id, 'RECADO_LIDO', { recado_id: rec.id }, req);
  res.json({ ok: true });
});

// =====================================================================
// CRIAR RECADO (RH/admin)
// =====================================================================
router.post('/', authRequired, roleRequired('rh', 'admin'), (req, res) => {
  const { titulo, mensagem, tipo, matricula_destinatario, setor, urgente, expira_em } = req.body || {};
  if (!titulo || !mensagem || !tipo) {
    return res.status(400).json({ error: 'titulo, mensagem e tipo são obrigatórios' });
  }
  if (!['coletivo', 'individual'].includes(tipo)) {
    return res.status(400).json({ error: 'tipo deve ser coletivo ou individual' });
  }

  let userId = null;
  if (tipo === 'individual') {
    if (!matricula_destinatario) return res.status(400).json({ error: 'matricula_destinatario obrigatória' });
    const dest = db.prepare('SELECT id FROM users WHERE matricula = ?').get(matricula_destinatario);
    if (!dest) return res.status(404).json({ error: 'Destinatário não encontrado' });
    userId = dest.id;
  }

  const result = db.prepare(`
    INSERT INTO recados (titulo, mensagem, tipo, user_id, setor, urgente, autor_id, autor_nome, expira_em)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    titulo, mensagem, tipo, userId,
    tipo === 'coletivo' ? (setor || null) : null,
    urgente ? 1 : 0,
    req.user.id, req.user.nome,
    expira_em || null
  );
  audit(req.user.id, 'RECADO_CRIADO', { id: result.lastInsertRowid, tipo, urgente: !!urgente }, req);
  res.json({ ok: true, id: result.lastInsertRowid });
});

// =====================================================================
// LISTAR TODOS (RH/admin)
// =====================================================================
router.get('/', authRequired, roleRequired('rh', 'admin'), (req, res) => {
  const rows = db.prepare(`
    SELECT r.*,
      (SELECT COUNT(*) FROM recado_leituras WHERE recado_id = r.id) AS total_leituras
    FROM recados r
    ORDER BY r.created_at DESC
    LIMIT 200
  `).all();
  res.json(rows);
});

module.exports = router;
