// MS Boi - Painel administrativo do RH
// Funcionalidades: gerenciar usuários, upload de holerites, publicar recados, logs LGPD

const root = document.getElementById('root');
const state = {
  token: localStorage.getItem('msboi.token') || null,
  user: JSON.parse(localStorage.getItem('msboi.user') || 'null'),
  view: 'usuarios',
};

async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (!opts.skipJson) headers['Content-Type'] = 'application/json';
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch('/api' + path, { ...opts, headers });
  let data; try { data = await res.json(); } catch { data = null; }
  if (!res.ok) throw new Error((data && data.error) || `Erro ${res.status}`);
  return data;
}

function clearSession() {
  state.token = null; state.user = null;
  localStorage.clear();
  window.location.href = '/';
}

// Verifica acesso ao admin
if (!state.token || !state.user || !['rh','admin'].includes(state.user.role)) {
  document.body.innerHTML = `
    <div class="login-screen">
      <div class="login-card" style="text-align:center;">
        <h2>Acesso restrito</h2>
        <p>Você precisa entrar como RH ou Administrador.</p>
        <a href="/" class="btn" style="display:inline-block; text-decoration:none">Voltar ao login</a>
      </div>
    </div>`;
} else {
  render();
}

function render() {
  root.innerHTML = `
    <div class="app">
      <header class="app-header">
        <div class="title">🐂 <span>MS Boi — Painel RH</span></div>
        <div style="display:flex; align-items:center; gap:.75rem;">
          <div class="user">${state.user.nome}</div>
          <button class="logout-btn" id="logout">Sair</button>
        </div>
      </header>
      <main class="app-main" style="max-width:1100px;">
        <div class="nav-admin">
          <button data-v="usuarios" class="${state.view==='usuarios'?'active':''}">👥 Usuários</button>
          <button data-v="holerites" class="${state.view==='holerites'?'active':''}">📄 Upload Holerites</button>
          <button data-v="recados" class="${state.view==='recados'?'active':''}">📬 Recados</button>
          ${state.user.role === 'admin'
            ? `<button data-v="auditoria" class="${state.view==='auditoria'?'active':''}">🔒 Auditoria LGPD</button>`
            : ''}
          <a href="/" style="margin-left:auto; text-decoration:none;">
            <button>← App colaborador</button>
          </a>
        </div>
        <div id="content"></div>
      </main>
    </div>
  `;
  document.getElementById('logout').onclick = clearSession;
  document.querySelectorAll('.nav-admin button[data-v]').forEach(b => {
    b.onclick = () => { state.view = b.dataset.v; render(); };
  });
  const content = document.getElementById('content');
  if (state.view === 'usuarios') renderUsuarios(content);
  else if (state.view === 'holerites') renderHolerites(content);
  else if (state.view === 'recados') renderRecados(content);
  else if (state.view === 'auditoria') renderAuditoria(content);
}

// =====================================================================
// USUÁRIOS
// =====================================================================
async function renderUsuarios(c) {
  c.innerHTML = `<div class="spinner"></div>`;
  try {
    const list = await api('/users');
    c.innerHTML = `
      <div class="admin-grid">
        <div class="card full">
          <h3>Novo colaborador</h3>
          <form id="nu-form" style="display:grid; gap:.5rem; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
            <div class="field"><label>Matrícula *</label><input name="matricula" required></div>
            <div class="field"><label>CPF *</label><input name="cpf" required inputmode="numeric"></div>
            <div class="field"><label>Nome *</label><input name="nome" required></div>
            <div class="field"><label>Email</label><input name="email" type="email"></div>
            <div class="field"><label>Cargo</label><input name="cargo"></div>
            <div class="field"><label>Setor</label><input name="setor"></div>
            <div class="field">
              <label>Perfil</label>
              <select name="role">
                <option value="colaborador">Colaborador</option>
                <option value="rh">RH</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="field" style="align-self:end"><button class="btn" type="submit">Cadastrar</button></div>
          </form>
          <div id="nu-msg"></div>
        </div>
        <div class="card full">
          <h3>Colaboradores cadastrados (${list.length})</h3>
          <div style="overflow-x:auto;">
            <table>
              <thead><tr>
                <th>Matrícula</th><th>Nome</th><th>CPF</th><th>Cargo</th><th>Setor</th>
                <th>Perfil</th><th>Status</th><th>Ações</th>
              </tr></thead>
              <tbody id="u-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>`;
    const tbody = document.getElementById('u-tbody');
    list.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.matricula}</td>
        <td>${escape(u.nome)}</td>
        <td>${u.cpf}</td>
        <td>${escape(u.cargo||'-')}</td>
        <td>${escape(u.setor||'-')}</td>
        <td>${u.role}</td>
        <td>${u.active ? '🟢 ativo' : '🔴 inativo'}${u.locked_until ? ' 🔒':''}</td>
        <td>
          <button class="btn btn-sm btn-secondary" data-reset="${u.id}">Reset senha</button>
          <button class="btn btn-sm" data-toggle="${u.id}">${u.active?'Inativar':'Ativar'}</button>
        </td>`;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('[data-reset]').forEach(b => {
      b.onclick = async () => {
        if (!confirm('Resetar a senha deste colaborador? Ele será forçado a definir nova senha no próximo login.')) return;
        try {
          const r = await api('/users/' + b.dataset.reset + '/reset-senha', { method: 'POST' });
          alert('Senha resetada. Senha temporária: ' + r.senhaInicial);
        } catch (e) { alert(e.message); }
      };
    });
    tbody.querySelectorAll('[data-toggle]').forEach(b => {
      b.onclick = async () => {
        try { await api('/users/' + b.dataset.toggle + '/toggle-active', { method: 'POST' }); render(); }
        catch (e) { alert(e.message); }
      };
    });
    document.getElementById('nu-form').onsubmit = async e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const body = {}; f.forEach((v,k) => body[k]=v);
      try {
        const r = await api('/users', { method:'POST', body: JSON.stringify(body) });
        document.getElementById('nu-msg').innerHTML =
          `<div class="ok">Criado. Senha inicial: <code>${r.senhaInicial}</code> (será trocada no 1º login)</div>`;
        e.target.reset();
        setTimeout(render, 1500);
      } catch (err) {
        document.getElementById('nu-msg').innerHTML = `<div class="err">${err.message}</div>`;
      }
    };
  } catch (e) {
    c.innerHTML = `<div class="err">${e.message}</div>`;
  }
}

// =====================================================================
// HOLERITES — Upload
// =====================================================================
function renderHolerites(c) {
  c.innerHTML = `
    <div class="card">
      <h3>Upload de Holerite (PDF)</h3>
      <p style="color:var(--muted)">Envie o PDF do holerite. Se já existir holerite do mesmo período/tipo para esse colaborador, ele será substituído.</p>
      <form id="h-form" style="display:grid; gap:.5rem; grid-template-columns: repeat(auto-fit, minmax(160px,1fr));">
        <div class="field"><label>Matrícula *</label><input name="matricula" required></div>
        <div class="field">
          <label>Mês *</label>
          <select name="mes" required>
            ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>`<option value="${m}">${nomeMes(m)}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Ano *</label><input name="ano" type="number" required value="${new Date().getFullYear()}"></div>
        <div class="field">
          <label>Tipo</label>
          <select name="tipo">
            <option value="mensal">Mensal</option>
            <option value="adiantamento">Adiantamento</option>
            <option value="13o">13º</option>
            <option value="ferias">Férias</option>
            <option value="rescisao">Rescisão</option>
          </select>
        </div>
        <div class="field"><label>Valor líquido (R$)</label><input name="valor_liquido" type="number" step="0.01" placeholder="opcional"></div>
        <div class="field" style="grid-column: 1/-1"><label>Arquivo PDF *</label><input name="arquivo" type="file" accept="application/pdf" required></div>
        <div class="field" style="grid-column: 1/-1"><button class="btn" type="submit">Enviar</button></div>
      </form>
      <div id="h-msg"></div>
    </div>
    <div class="lgpd-notice" style="margin-top:1rem">
      🔒 <strong>LGPD:</strong> Cada upload é registrado no log de auditoria com data, IP e usuário responsável. Os arquivos ficam acessíveis apenas ao próprio colaborador, RH e administradores.
    </div>
  `;
  document.getElementById('h-form').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const res = await fetch('/api/holerites/upload', {
        method: 'POST', body: fd,
        headers: { Authorization: `Bearer ${state.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      document.getElementById('h-msg').innerHTML = '<div class="ok">Holerite enviado.</div>';
      e.target.reset();
    } catch (err) {
      document.getElementById('h-msg').innerHTML = `<div class="err">${err.message}</div>`;
    }
  };
}

// =====================================================================
// RECADOS
// =====================================================================
async function renderRecados(c) {
  c.innerHTML = `
    <div class="admin-grid">
      <div class="card full">
        <h3>Novo recado</h3>
        <form id="r-form">
          <div class="field"><label>Título *</label><input name="titulo" required></div>
          <div class="field"><label>Mensagem *</label><textarea name="mensagem" rows="4" required></textarea></div>
          <div class="field">
            <label>Tipo *</label>
            <select name="tipo" id="r-tipo">
              <option value="coletivo">Coletivo</option>
              <option value="individual">Individual</option>
            </select>
          </div>
          <div class="field" id="r-mat-field" style="display:none">
            <label>Matrícula do destinatário</label>
            <input name="matricula_destinatario">
          </div>
          <div class="field" id="r-setor-field">
            <label>Setor (deixe vazio para todos)</label>
            <input name="setor" placeholder="Ex: Desossa, Abate, Embalagem...">
          </div>
          <div class="field">
            <label><input name="urgente" type="checkbox"> Marcar como urgente</label>
          </div>
          <button class="btn" type="submit">Publicar</button>
        </form>
        <div id="r-msg"></div>
      </div>
      <div class="card full">
        <h3>Recados publicados</h3>
        <div id="r-list"><div class="spinner"></div></div>
      </div>
    </div>
  `;
  const tipoSel = document.getElementById('r-tipo');
  tipoSel.onchange = () => {
    document.getElementById('r-mat-field').style.display = tipoSel.value === 'individual' ? '' : 'none';
    document.getElementById('r-setor-field').style.display = tipoSel.value === 'coletivo' ? '' : 'none';
  };

  document.getElementById('r-form').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {};
    fd.forEach((v,k) => body[k] = v);
    body.urgente = !!body.urgente;
    try {
      await api('/recados', { method: 'POST', body: JSON.stringify(body) });
      document.getElementById('r-msg').innerHTML = '<div class="ok">Recado publicado.</div>';
      e.target.reset(); tipoSel.dispatchEvent(new Event('change'));
      carregarRecados();
    } catch (err) {
      document.getElementById('r-msg').innerHTML = `<div class="err">${err.message}</div>`;
    }
  };

  async function carregarRecados() {
    try {
      const list = await api('/recados');
      document.getElementById('r-list').innerHTML = list.map(r => `
        <div class="recado ${r.tipo} ${r.urgente?'urgente':''}">
          <div class="head">
            <div class="titulo">${escape(r.titulo)}</div>
            <span class="tag ${r.urgente?'urgente':r.tipo}">
              ${r.urgente ? 'URGENTE' : (r.tipo === 'coletivo' ? 'Coletivo' : 'Individual')}
            </span>
          </div>
          <div class="body">${escape(r.mensagem).replace(/\n/g,'<br>')}</div>
          <div class="meta">
            ${escape(r.autor_nome)} • ${formatDate(r.created_at)} • 👁 ${r.total_leituras} leituras
          </div>
        </div>
      `).join('') || '<p>Nenhum recado.</p>';
    } catch (e) {
      document.getElementById('r-list').innerHTML = `<div class="err">${e.message}</div>`;
    }
  }
  carregarRecados();
}

// =====================================================================
// AUDITORIA LGPD
// =====================================================================
async function renderAuditoria(c) {
  c.innerHTML = `<div class="card"><h3>🔒 Logs de auditoria (LGPD)</h3><div id="aud"><div class="spinner"></div></div></div>`;
  try {
    const log = await api('/users/audit/log');
    document.getElementById('aud').innerHTML = `
      <p style="color:var(--muted); font-size:.85rem">
        Últimas ${log.length} operações registradas. Conforme LGPD (art. 37), mantemos trilha de todos os acessos a dados sensíveis.
      </p>
      <div style="max-height:600px; overflow-y:auto;">
        ${log.map(a => `
          <div class="audit-row">
            <code>${formatDate(a.created_at)}</code> •
            <strong>${escape(a.acao)}</strong> •
            ${escape(a.user_nome || 'anônimo')} (${escape(a.user_matricula || '-')})
            ${a.ip ? ' • IP: ' + escape(a.ip) : ''}
            ${a.detalhes ? '<br><small style="color:var(--muted)">' + escape(a.detalhes) + '</small>' : ''}
          </div>
        `).join('')}
      </div>
    `;
  } catch (e) {
    document.getElementById('aud').innerHTML = `<div class="err">${e.message}</div>`;
  }
}

function nomeMes(m) {
  return ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho',
    'Agosto','Setembro','Outubro','Novembro','Dezembro'][m] || m;
}
function escape(s) {
  return String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
