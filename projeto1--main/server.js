require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 8080; // Alterado para 8080 para evitar bloqueios de permissão

// Middleware necessário para ler dados enviados pelo formulário de login (JSON) e suportar string Base64 do PDF
app.use(express.json({ limit: '10mb' }));

// (a conexão agora fica em config/db.js)

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- NOVA ROTA DE LOGIN ---
app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;

  // Conferindo as credenciais exigidas (admin / admin123)
  if (usuario === 'admin' && senha === 'admin123') {
    // Login com sucesso!
    res.json({ sucesso: true, mensagem: 'Login realizado!' });
  } else {
    // Login falhou
    res.status(401).json({ sucesso: false, mensagem: 'Usuário ou senha inválidos.' });
  }
});

// Rotas modulares
const lancamentosRoutes = require('./routes/lancamentos');
const emailRoutes = require('./routes/email');
app.use('/api/lancamentos', lancamentosRoutes);
app.use('/api/email', emailRoutes);

// Inicia o servidor
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
