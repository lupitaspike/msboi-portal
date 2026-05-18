// MS Boi - Chatbot de RH (CLT + NR-36 + CCT)
// Implementação local sem dependências externas: base de conhecimento em JSON
// com busca por palavras-chave e score. Sem alucinações - retorna apenas o que está na base.
const express = require('express');
const { db, audit } = require('../utils/db');
const { authRequired } = require('../middleware/auth');
const KB = require('../utils/knowledge-base');

const router = express.Router();

// Remove acentos e pontuação, gera tokens
function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

const STOP = new Set(['que','para','com','dos','das','uma','tem','mas','por','sobre','meu','minha','quanto','quantos','qual','quais','como','onde','quando','sim','nao','tenho']);

function pontuar(pergunta, entrada) {
  const qTokens = tokenize(pergunta).filter(t => !STOP.has(t));
  const eTokens = new Set([
    ...tokenize(entrada.pergunta),
    ...(entrada.keywords || []).flatMap(k => tokenize(k)),
  ]);
  let score = 0;
  for (const t of qTokens) {
    if (eTokens.has(t)) score += 2;
    // match parcial
    else for (const e of eTokens) if (e.includes(t) || t.includes(e)) { score += 1; break; }
  }
  return score;
}

router.post('/perguntar', authRequired, (req, res) => {
  const { pergunta } = req.body || {};
  if (!pergunta || pergunta.trim().length < 3) {
    return res.status(400).json({ error: 'Pergunta muito curta' });
  }

  // Top 3 melhores matches
  const ranked = KB
    .map(e => ({ ...e, score: pontuar(pergunta, e) }))
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  let resposta, categoria, fontes;
  if (ranked.length === 0 || ranked[0].score < 2) {
    resposta = `Não encontrei essa informação na minha base (CLT, NR-36 e CCT MS Boi).

Sugestões:
• Reformule a pergunta com outras palavras
• Use termos como: férias, hora extra, insalubridade, pausa, jornada, vale, atestado, FGTS
• Para casos específicos, procure o RH presencialmente

⚠️ Importante: este chatbot fornece informações gerais com base na legislação. Para situações particulares, sempre confirme com o departamento de RH.`;
    categoria = 'sem_resposta';
    fontes = [];
  } else {
    const principal = ranked[0];
    resposta = principal.resposta;
    categoria = principal.categoria;
    fontes = [principal.fonte, ...ranked.slice(1).filter(r => r.score >= 2).map(r => r.fonte)]
      .filter((v, i, a) => a.indexOf(v) === i);

    if (ranked.length > 1 && ranked[1].score >= 2) {
      resposta += `\n\n💡 Tópicos relacionados que talvez te ajudem:\n` +
        ranked.slice(1, 3).filter(r => r.score >= 2)
          .map(r => `• ${r.pergunta}`).join('\n');
    }

    resposta += `\n\n⚠️ Aviso: orientação baseada na CLT, NR-36 e na CCT vigente da MS Boi. Para o seu caso específico, confirme com o RH.`;
  }

  const result = db.prepare(`
    INSERT INTO chatbot_perguntas (user_id, pergunta, resposta, categoria)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, pergunta, resposta, categoria);
  audit(req.user.id, 'CHATBOT_PERGUNTA', { id: result.lastInsertRowid, categoria }, req);

  res.json({ id: result.lastInsertRowid, resposta, categoria, fontes });
});

// Avaliar resposta (útil / não útil) - importante pra melhorar a base
router.post('/:id/feedback', authRequired, (req, res) => {
  const { util } = req.body || {};
  db.prepare('UPDATE chatbot_perguntas SET util = ? WHERE id = ? AND user_id = ?')
    .run(util ? 1 : 0, req.params.id, req.user.id);
  res.json({ ok: true });
});

// Histórico das próprias perguntas
router.get('/historico', authRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT id, pergunta, resposta, categoria, util, created_at
    FROM chatbot_perguntas WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 50
  `).all(req.user.id);
  res.json(rows);
});

module.exports = router;
