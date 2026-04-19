require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = 8080;

// Middleware para ler JSON e suportar string Base64 do PDF
app.use(express.json({ limit: '10mb' }));

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rotas modulares
const usuariosRoutes = require('./routes/usuarios');
const lancamentosRoutes = require('./routes/lancamentos');
const emailRoutes = require('./routes/email');

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/lancamentos', lancamentosRoutes);
app.use('/api/email', emailRoutes);

// Inicia o servidor
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
