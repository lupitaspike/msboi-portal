// MS Boi - Portal do Colaborador
// Servidor Express principal
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');

// Garante diretórios persistentes em Azure App Service (/home/site/wwwroot)
['data', 'uploads/holerites'].forEach(p => {
  const full = path.join(__dirname, p);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

const authRoutes = require('./routes/auth');
const holeritesRoutes = require('./routes/holerites');
const recadosRoutes = require('./routes/recados');
const usersRoutes = require('./routes/users');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 3000;

// Segurança: cabeçalhos HTTP + CORS (ajuste a origem para produção)
app.use(helmet({
  contentSecurityPolicy: false, // desativado para servir o PWA inline
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// API
app.use('/api/auth', authRoutes);
app.use('/api/holerites', holeritesRoutes);
app.use('/api/recados', recadosRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Azure: proxy entrega o IP real em X-Forwarded-For
app.set('trust proxy', 1);

// Frontend estático (PWA) - estrutura flat: frontend/ ao lado do server.js
const FRONT = path.join(__dirname, 'frontend');
app.use(express.static(FRONT));
app.get(['/admin', '/admin/*'], (req, res) => {
  res.sendFile(path.join(FRONT, 'admin', 'index.html'));
});
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Endpoint não encontrado' });
  res.sendFile(path.join(FRONT, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
});

app.listen(PORT, () => {
  console.log(`\n🐂 MS Boi - Portal do Colaborador`);
  console.log(`   Rodando em http://localhost:${PORT}`);
  console.log(`   Admin: http://localhost:${PORT}/admin\n`);
});
