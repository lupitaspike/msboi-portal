// MS Boi - Camada de banco de dados (SQLite)
// Schema desenhado para atender LGPD: logs de auditoria, soft delete, criptografia de senhas.

// Usa node:sqlite nativo (Node 22+). Não requer compilação.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'msboi.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// =====================================================================
// SCHEMA
// =====================================================================
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricula TEXT UNIQUE NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    cargo TEXT,
    setor TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'colaborador', -- colaborador | rh | admin
    must_change_password INTEGER DEFAULT 1,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS holerites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    tipo TEXT DEFAULT 'mensal', -- mensal | adiantamento | 13o | ferias | rescisao
    arquivo TEXT NOT NULL, -- caminho relativo no disco
    valor_liquido REAL,
    uploaded_by INTEGER,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    UNIQUE(user_id, mes, ano, tipo)
  );

  CREATE TABLE IF NOT EXISTS recados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT NOT NULL, -- coletivo | individual
    user_id INTEGER, -- NULL quando coletivo
    setor TEXT, -- quando coletivo restrito a um setor
    urgente INTEGER DEFAULT 0,
    autor_id INTEGER NOT NULL,
    autor_nome TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expira_em TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (autor_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS recado_leituras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recado_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    lido_em TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recado_id) REFERENCES recados(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(recado_id, user_id)
  );

  -- LGPD: trilha de auditoria de acessos a dados sensíveis
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    acao TEXT NOT NULL, -- LOGIN_SUCESSO, LOGIN_FALHA, HOLERITE_VISTO, HOLERITE_BAIXADO, RECADO_LIDO, etc
    detalhes TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS chatbot_perguntas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    categoria TEXT,
    util INTEGER, -- 1 = útil, 0 = não útil, NULL = não avaliado
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_holerites_user ON holerites(user_id, ano DESC, mes DESC);
  CREATE INDEX IF NOT EXISTS idx_recados_tipo ON recados(tipo, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, created_at DESC);
`);

// =====================================================================
// AUDIT LOG helper
// =====================================================================
const auditStmt = db.prepare(`
  INSERT INTO audit_log (user_id, acao, detalhes, ip, user_agent)
  VALUES (?, ?, ?, ?, ?)
`);

function audit(userId, acao, detalhes, req) {
  try {
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || null;
    const ua = req?.headers?.['user-agent'] || null;
    auditStmt.run(userId, acao, detalhes ? JSON.stringify(detalhes) : null, ip, ua);
  } catch (e) {
    console.error('Falha ao gravar audit log:', e.message);
  }
}

module.exports = { db, audit };
