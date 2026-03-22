const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const { testConnection } = require('./config/db');
const routes = require('./routes/index');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Fichiers statiques (images produits) ─────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', routes);

app.get('/api/health', (_, res) => res.json({ status: '✅ API is running', time: new Date() }));

app.use((_, res) => res.status(404).json({ success: false, message: 'Route introuvable.' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
});

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Backend → http://localhost:${PORT}`);
  });
}

start();