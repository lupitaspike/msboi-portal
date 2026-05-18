// MS Boi - Holerites: upload pelo RH, listagem e download pelo colaborador
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { db, audit } = require('../utils/db');
const { authRequired, roleRequired } = require('../middleware/auth');

const router = express.Router();
const UPLOADS = path.join(__dirname, '..', 'uploads', 'holerites');
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Apenas arquivos PDF são aceitos'));
  },
});

// =====================================================================
// LISTAR MEUS HOLERITES (colaborador)
// =====================================================================
router.get('/meus', authRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT id, mes, ano, tipo, valor_liquido, uploaded_at
    FROM holerites WHERE user_id = ?
    ORDER BY ano DESC, mes DESC
  `).all(req.user.id);
  res.json(rows);
});

// =====================================================================
// BAIXAR HOLERITE (colaborador — só os dele; RH/admin podem ver de todos)
// =====================================================================
router.get('/:id/arquivo', authRequired, (req, res) => {
  const h = db.prepare('SELECT * FROM holerites WHERE id = ?').get(req.params.id);
  if (!h) return res.status(404).json({ error: 'Holerite não encontrado' });
  const isOwn = h.user_id === req.user.id;
  const isAdmin = ['rh', 'admin'].includes(req.user.role);
  if (!isOwn && !isAdmin) {
    audit(req.user.id, 'HOLERITE_ACESSO_NEGADO', { holerite_id: h.id }, req);
    return res.status(403).json({ error: 'Sem permissão' });
  }
  const filePath = path.join(UPLOADS, h.arquivo);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado no disco' });
  audit(req.user.id, isOwn ? 'HOLERITE_BAIXADO' : 'HOLERITE_BAIXADO_POR_RH',
    { holerite_id: h.id, mes: h.mes, ano: h.ano, dono_id: h.user_id }, req);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="holerite_${h.ano}_${String(h.mes).padStart(2,'0')}.pdf"`);
  fs.createReadStream(filePath).pipe(res);
});

// =====================================================================
// UPLOAD (RH/admin)
// =====================================================================
router.post('/upload', authRequired, roleRequired('rh', 'admin'), upload.single('arquivo'), (req, res) => {
  try {
    const { matricula, mes, ano, tipo, valor_liquido } = req.body;
    if (!matricula || !mes || !ano || !req.file) {
      return res.status(400).json({ error: 'matricula, mes, ano e arquivo são obrigatórios' });
    }
    const user = db.prepare('SELECT id FROM users WHERE matricula = ?').get(String(matricula).trim());
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }
    const stmt = db.prepare(`
      INSERT INTO holerites (user_id, mes, ano, tipo, arquivo, valor_liquido, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, mes, ano, tipo) DO UPDATE SET
        arquivo = excluded.arquivo,
        valor_liquido = excluded.valor_liquido,
        uploaded_by = excluded.uploaded_by,
        uploaded_at = CURRENT_TIMESTAMP
    `);
    stmt.run(user.id, parseInt(mes), parseInt(ano), tipo || 'mensal', req.file.filename,
      valor_liquido ? parseFloat(valor_liquido) : null, req.user.id);
    audit(req.user.id, 'HOLERITE_UPLOAD',
      { destinatario_id: user.id, matricula, mes, ano, tipo: tipo || 'mensal' }, req);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
