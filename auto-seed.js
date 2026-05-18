// MS Boi - Auto-seed: cria usuários automaticamente se o banco estiver vazio.
// Executa uma vez quando o servidor sobe (importado pelo server.js).
const bcrypt = require('bcryptjs');
const { db } = require('./db');

const INITIAL_PWD = process.env.ADMIN_INITIAL_PASSWORD || 'MsBoi@2026!Trocar';

function autoSeed() {
  try {
    const result = db.prepare('SELECT COUNT(*) AS c FROM users').get();
    if (!result || result.c > 0) return 0;

    const users = [
      { matricula: 'ADM001', cpf: '00000000000', nome: 'Administrador RH',
        email: 'rh@msboi.com.br', cargo: 'Gestor de RH', setor: 'Recursos Humanos', role: 'admin' },
      { matricula: '10001', cpf: '11111111111', nome: 'João da Silva',
        email: 'joao@msboi.com.br', cargo: 'Operador de Produção', setor: 'Abate', role: 'colaborador' },
      { matricula: '10002', cpf: '22222222222', nome: 'Maria Oliveira',
        email: 'maria@msboi.com.br', cargo: 'Auxiliar de Desossa', setor: 'Desossa', role: 'colaborador' },
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO users
        (matricula, cpf, nome, email, cargo, setor, password_hash, role, must_change_password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const hash = bcrypt.hashSync(INITIAL_PWD, 12);
    let count = 0;
    for (const u of users) {
      const r = stmt.run(u.matricula, u.cpf, u.nome, u.email, u.cargo, u.setor, hash, u.role);
      if (r.changes > 0) count++;
    }

    db.prepare(`
      INSERT OR IGNORE INTO recados (titulo, mensagem, tipo, urgente, autor_id, autor_nome)
      SELECT 'Bem-vindos ao Portal MS Boi',
             'Este é o novo canal oficial de comunicação interna. Aqui você consulta seu holerite, recebe recados do RH e tira dúvidas sobre CLT e NR-36.',
             'coletivo', 0, id, nome FROM users WHERE matricula = 'ADM001'
    `).run();

    console.log(`✅ Auto-seed: ${count} usuário(s) criado(s) no primeiro start.`);
    console.log(`   Login admin: matricula=ADM001 cpf=00000000000`);
    console.log(`   Senha inicial: ${INITIAL_PWD}`);
    return count;
  } catch (e) {
    console.error('Erro no auto-seed:', e.message);
    return 0;
  }
}

// Auto-executa ao ser importado
autoSeed();

module.exports = { autoSeed };
