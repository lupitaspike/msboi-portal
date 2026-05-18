// MS Boi - Frontend PWA (vanilla JS, sem build step)
// Telas: login → trocar senha (se obrigatório) → dashboard com tabs

const root = document.getElementById('root');
const state = {
  token: localStorage.getItem('msboi.token') || null,
  user: JSON.parse(localStorage.getItem('msboi.user') || 'null'),
  tab: 'inicio',
  recados: [],
  holerites: [],
  chatHistory: [],
};

// =====================================================================
// API helper
// =====================================================================
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch('/api' + path, { ...opts, headers });
  let data; try { data = await res.json(); } catch { data = null; }
  if (!res.ok) throw new Error((data && data.error) || `Erro ${res.status}`);
  return data;
}

function saveSession(token, user) {
  state.token = token; state.user = user;
  localStorage.setItem('msboi.token', token);
  localStorage.setItem('msboi.user', JSON.stringify(user));
}
function clearSession() {
  state.token = null; state.user = null;
  localStorage.removeItem('msboi.token');
  localStorage.removeItem('msboi.user');
  render();
}

// =====================================================================
// Telas
// =====================================================================
function viewLogin() {
  root.innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <div class="logo">
          <div class="bull">🐂</div>
          <h1>MS BOI</h1>
          <div class="sub">Portal do Colaborador</div>
        </div>
        <div id="login-err"></div>
        <form id="login-form">
          <div class="field">
            <label>Matrícula</label>
            <input name="matricula" required autocomplete="username" inputmode="text" />
          </div>
          <div class="field">
            <label>CPF</label>
            <input name="cpf" required inputmode="numeric" placeholder="apenas números" />
          </div>
          <div class="field">
            <label>Senha</label>
            <input name="senha" type="password" required autocomplete="current-password" />
          </div>
          <button class="btn" type="submit">Entrar</button>
        </form>
        <div class="lgpd-notice">
          🔒 <strong>LGPD:</strong> Seus dados pessoais e o conteúdo do seu holerite são tratados de forma sigilosa, com criptografia, registro de acessos e finalidade exclusiva de gestão de RH. Acessos não autorizados serão investigados.
        </div>
      </div>
    </div>
  `;
  document.getElementById('login-form').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const errBox = document.getElementById('login-err');
    errBox.innerHTML = '';
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          matricula: f.get('matricula'),
          cpf: f.get('cpf'),
          senha: f.get('senha'),
        }),
      });
      saveSession(data.token, data.user);
      render();
    } catch (err) {
      errBox.innerHTML = `<div class="err">${err.message}</div>`;
    }
  };
}

function viewChangePassword() {
  root.innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <div class="logo">
          <div class="bull">🔐</div>
          <h1>Trocar senha</h1>
          <div class="sub">Por segurança, defina uma nova senha</div>
        </div>
        <div id="cp-err"></div>
        <form id="cp-form">
          <div class="field">
            <label>Senha atual</label>
            <input name="atual" type="password" required />
          </div>
          <div class="field">
            <label>Nova senha</label>
            <input name="nova" type="password" required />
            <small style="color:var(--muted)">Mínimo 8 caracteres, com maiúscula, minúscula, número e especial.</small>
          </div>
          <div class="field">
            <label>Confirmar nova senha</label>
            <input name="confirma" type="password" required />
          </div>
          <button class="btn" type="submit">Atualizar senha</button>
          <button type="button" class="btn btn-ghost" id="logout-cp" style="margin-top:.5rem">Sair</button>
        </form>
      </div>
    </div>
  `;
  document.getElementById('logout-cp').onclick = clearSession;
  document.getElementById('cp-form').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const atual = f.get('atual'), nova = f.get('nova'), conf = f.get('confirma');
    const errBox = document.getElementById('cp-err');
    errBox.innerHTML = '';
    if (nova !== conf) {
      errBox.innerHTML = '<div class="err">A confirmação não bate com a nova senha.</div>';
      return;
    }
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ senhaAtual: atual, novaSenha: nova }),
      });
      state.user.mustChangePassword = false;
      localStorage.setItem('msboi.user', JSON.stringify(state.user));
      render();
    } catch (err) {
      errBox.innerHTML = `<div class="err">${err.message}</div>`;
    }
  };
}

// =====================================================================
// App principal (autenticado)
// =====================================================================
function viewApp() {
  root.innerHTML = `
    <div class="app">
      <header class="app-header">
        <div class="title">🐂 <span>MS Boi</span></div>
        <div style="display:flex; align-items:center; gap:.75rem;">
          <div class="user">${state.user.nome.split(' ')[0]}</div>
          <button class="logout-btn" id="logout">Sair</button>
        </div>
      </header>
      <main class="app-main" id="main"></main>
      <nav class="tab-bar">
        <button class="tab ${state.tab==='inicio'?'active':''}" data-tab="inicio">
          <span class="icon">🏠</span>Início
        </button>
        <button class="tab ${state.tab==='holerites'?'active':''}" data-tab="holerites">
          <span class="icon">📄</span>Holerite
        </button>
        <button class="tab ${state.tab==='recados'?'active':''}" data-tab="recados">
          <span class="icon">📬</span>Recados
        </button>
        <button class="tab ${state.tab==='chat'?'active':''}" data-tab="chat">
          <span class="icon">💬</span>RH Bot
        </button>
      </nav>
    </div>
  `;
  document.getElementById('logout').onclick = clearSession;
  document.querySelectorAll('.tab').forEach(b => {
    b.onclick = () => { state.tab = b.dataset.tab; renderTab(); };
  });
  renderTab();
}

function renderTab() {
  document.querySelectorAll('.tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === state.tab);
  });
  const main = document.getElementById('main');
  if (state.tab === 'inicio') return renderInicio(main);
  if (state.tab === 'holerites') return renderHolerites(main);
  if (state.tab === 'recados') return renderRecados(main);
  if (state.tab === 'chat') return renderChat(main);
}

// ------------------------ Início ------------------------
async function renderInicio(main) {
  main.innerHTML = `<div class="spinner"></div>`;
  try {
    const [recados, holerites] = await Promise.all([
      api('/recados/meus'),
      api('/holerites/meus'),
    ]);
    state.recados = recados;
    state.holerites = holerites;
    const naoLidos = recados.filter(r => !r.lido).length;
    const ultHolerite = holerites[0];

    main.innerHTML = `
      <h2 style="margin-top:0">Olá, ${state.user.nome.split(' ')[0]} 👋</h2>
      <p style="color:var(--muted); margin-top:-0.5rem">
        ${state.user.cargo || ''} ${state.user.setor ? '— ' + state.user.setor : ''}
      </p>

      <div class="card" id="card-recados">
        <h3>📬 Recados</h3>
        <p style="margin:0; color:var(--muted)">
          ${naoLidos > 0
            ? `<strong>${naoLidos} recado(s) não lido(s).</strong> Toque para ver.`
            : 'Você está em dia com os recados.'}
        </p>
      </div>

      <div class="card" id="card-holerite">
        <h3>📄 Último holerite</h3>
        ${ultHolerite
          ? `<p style="margin:0">${nomeMes(ultHolerite.mes)} / ${ultHolerite.ano}
              ${ultHolerite.valor_liquido ? ` — R$ ${ultHolerite.valor_liquido.toFixed(2)}` : ''}</p>`
          : `<p style="margin:0; color:var(--muted)">Nenhum holerite disponível ainda.</p>`}
      </div>

      <div class="card" id="card-chat">
        <h3>💬 Dúvidas de RH?</h3>
        <p style="margin:0; color:var(--muted)">
          Pergunte ao RH Bot sobre CLT, NR-36 e a CCT da MS Boi.
        </p>
      </div>
    `;
    document.getElementById('card-recados').onclick = () => { state.tab='recados'; renderTab(); };
    document.getElementById('card-holerite').onclick = () => { state.tab='holerites'; renderTab(); };
    document.getElementById('card-chat').onclick = () => { state.tab='chat'; renderTab(); };
  } catch (e) {
    main.innerHTML = `<div class="err">${e.message}</div>`;
  }
}

// ------------------------ Holerites ------------------------
async function renderHolerites(main) {
  main.innerHTML = `<div class="spinner"></div>`;
  try {
    const list = await api('/holerites/meus');
    if (list.length === 0) {
      main.innerHTML = `
        <h2>Holerites</h2>
        <div class="empty">
          <span class="icon">📄</span>
          Nenhum holerite disponível ainda.<br>
          <small>Quando o RH publicar, você verá aqui.</small>
        </div>`;
      return;
    }
    main.innerHTML = `
      <h2>Holerites</h2>
      <div id="holerites-list"></div>
    `;
    const wrap = document.getElementById('holerites-list');
    list.forEach(h => {
      const row = document.createElement('div');
      row.className = 'holerite-row';
      row.innerHTML = `
        <div class="info">
          <strong>${nomeMes(h.mes)} / ${h.ano}</strong>
          <div class="meta">${tipoLabel(h.tipo)}
            ${h.valor_liquido ? ' • R$ ' + h.valor_liquido.toFixed(2) : ''}</div>
        </div>
        <button class="btn btn-sm" data-id="${h.id}">Ver PDF</button>
      `;
      row.querySelector('button').onclick = () => abrirHolerite(h.id);
      wrap.appendChild(row);
    });
  } catch (e) {
    main.innerHTML = `<div class="err">${e.message}</div>`;
  }
}

async function abrirHolerite(id) {
  // Fetch como blob com Authorization, abre em nova aba
  try {
    const res = await fetch('/api/holerites/' + id + '/arquivo', {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    if (!res.ok) throw new Error('Não foi possível abrir o PDF');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (e) {
    alert(e.message);
  }
}

// ------------------------ Recados ------------------------
async function renderRecados(main) {
  main.innerHTML = `<div class="spinner"></div>`;
  try {
    const list = await api('/recados/meus');
    state.recados = list;
    if (list.length === 0) {
      main.innerHTML = `
        <h2>Recados</h2>
        <div class="empty">
          <span class="icon">📭</span>
          Nenhum recado por enquanto.
        </div>`;
      return;
    }
    main.innerHTML = `<h2>Recados</h2><div id="recados-list"></div>`;
    const wrap = document.getElementById('recados-list');
    list.forEach(r => {
      const el = document.createElement('div');
      el.className = `recado ${r.tipo} ${r.urgente ? 'urgente' : ''} ${!r.lido ? 'nao-lido' : ''}`;
      const tag = r.urgente
        ? '<span class="tag urgente">⚠ Urgente</span>'
        : `<span class="tag ${r.tipo}">${r.tipo === 'coletivo' ? 'Coletivo' : 'Individual'}</span>`;
      el.innerHTML = `
        <div class="head"><div class="titulo">${escape(r.titulo)}</div> ${tag}</div>
        <div class="body">${escape(r.mensagem).replace(/\n/g, '<br>')}</div>
        <div class="meta">por ${escape(r.autor_nome)} • ${formatDate(r.created_at)}</div>
      `;
      if (!r.lido) {
        el.onclick = async () => {
          try { await api('/recados/' + r.id + '/lido', { method: 'POST' }); } catch {}
          el.classList.remove('nao-lido');
        };
      }
      wrap.appendChild(el);
    });
  } catch (e) {
    main.innerHTML = `<div class="err">${e.message}</div>`;
  }
}

// ------------------------ Chat ------------------------
function renderChat(main) {
  main.innerHTML = `
    <h2 style="margin:0">RH Bot</h2>
    <p style="color:var(--muted); margin-top:.25rem; font-size:.85rem">
      Dúvidas sobre CLT, NR-36 e CCT MS Boi. Respostas orientativas — para casos específicos, procure o RH.
    </p>
    <div class="chat-area">
      <div class="chat-messages" id="chat-msgs"></div>
      <div class="suggestion-row" id="suggestions">
        <span class="chip">Quantos dias de férias tenho?</span>
        <span class="chip">Como funciona a pausa NR-36?</span>
        <span class="chip">Como acesso meu holerite?</span>
        <span class="chip">Tenho direito a adicional noturno?</span>
      </div>
      <form class="chat-input" id="chat-form">
        <input id="chat-input" placeholder="Pergunte sobre férias, hora extra, pausas..." autocomplete="off" />
        <button type="submit">Enviar</button>
      </form>
    </div>
  `;
  const msgs = document.getElementById('chat-msgs');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');

  // mensagem inicial
  addMsg('bot', `Olá ${state.user.nome.split(' ')[0]}! Sou o RH Bot da MS Boi. Posso ajudar com dúvidas sobre CLT, NR-36 (frigorífico) e CCT. Em que posso ajudar?`);

  document.querySelectorAll('.chip').forEach(c => {
    c.onclick = () => { input.value = c.textContent; form.requestSubmit(); };
  });

  form.onsubmit = async e => {
    e.preventDefault();
    const pergunta = input.value.trim();
    if (!pergunta) return;
    addMsg('user', pergunta);
    input.value = '';
    document.getElementById('suggestions').style.display = 'none';
    const loading = addMsg('bot', '...');
    try {
      const r = await api('/chatbot/perguntar', { method: 'POST', body: JSON.stringify({ pergunta }) });
      loading.querySelector('.bubble').textContent = r.resposta;
      // botão de feedback
      const fb = document.createElement('div');
      fb.className = 'feedback';
      fb.innerHTML = `<button data-u="1">👍 útil</button> <button data-u="0">👎 não ajudou</button>`;
      fb.querySelectorAll('button').forEach(b => {
        b.onclick = async () => {
          try {
            await api('/chatbot/' + r.id + '/feedback', {
              method: 'POST',
              body: JSON.stringify({ util: b.dataset.u === '1' }),
            });
            fb.innerHTML = '<small style="color:var(--muted)">Obrigado pelo feedback!</small>';
          } catch {}
        };
      });
      loading.appendChild(fb);
    } catch (e) {
      loading.querySelector('.bubble').textContent = 'Erro: ' + e.message;
    }
    msgs.scrollTop = msgs.scrollHeight;
  };
}

function addMsg(role, text) {
  const msgs = document.getElementById('chat-msgs');
  const el = document.createElement('div');
  el.className = 'msg ' + role;
  el.innerHTML = `<div class="bubble"></div>`;
  el.querySelector('.bubble').textContent = text;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
  return el;
}

// =====================================================================
// Helpers
// =====================================================================
function nomeMes(m) {
  return ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho',
    'Agosto','Setembro','Outubro','Novembro','Dezembro'][m] || m;
}
function tipoLabel(t) {
  return { mensal: 'Mensal', adiantamento: 'Adiantamento', '13o': '13º salário',
    ferias: 'Férias', rescisao: 'Rescisão' }[t] || t;
}
function escape(s) {
  return String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// =====================================================================
// Roteador raiz
// =====================================================================
function render() {
  // sessão expirada?
  if (state.token && !state.user) clearSession();
  if (!state.token) return viewLogin();
  if (state.user.mustChangePassword) return viewChangePassword();
  return viewApp();
}

render();

// Verifica token ao carregar
if (state.token) {
  api('/auth/me').then(u => {
    state.user = u; localStorage.setItem('msboi.user', JSON.stringify(u));
    render();
  }).catch(() => clearSession());
}
