require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);
const host = process.env.HOST || '0.0.0.0';

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
app.listen(port, host, () => {
  const env = process.env.APP_ENV || process.env.NODE_ENV || 'development';
  console.log(`Servidor rodando em http://${host}:${port} [${env}]`);
});

// TESTE DE QUALIDADE: Simulando a chamada de uma função de segurança que "esqueceu" de ser criada
// Isso gerará um erro do tipo "ReferenceError: validarSeguranca is not defined" e derrubará o sistema.
validarSeguranca();