const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/usuarios/cadastro — Cadastrar novo usuário
router.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ sucesso: false, mensagem: 'Preencha todos os campos.' });
    }

    try {
        // Verifica se o email já está cadastrado
        const existe = await pool.query('SELECT id FROM usuario WHERE email = $1', [email]);
        if (existe.rows.length > 0) {
            return res.status(409).json({ sucesso: false, mensagem: 'Este e-mail já está cadastrado.' });
        }

        const result = await pool.query(
            'INSERT INTO usuario (nome, email, senha, situacao) VALUES ($1, $2, $3, $4) RETURNING id, nome, email',
            [nome, email, senha, 'ATIVO']
        );

        res.status(201).json({
            sucesso: true,
            mensagem: 'Cadastro realizado com sucesso!',
            usuario: result.rows[0]
        });
    } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao cadastrar.' });
    }
});

// POST /api/usuarios/login — Login por email e senha
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ sucesso: false, mensagem: 'Preencha email e senha.' });
    }

    try {
        const result = await pool.query(
            'SELECT id, nome, email FROM usuario WHERE email = $1 AND senha = $2 AND situacao = $3',
            [email, senha, 'ATIVO']
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha inválidos.' });
        }

        const usuario = result.rows[0];
        res.json({
            sucesso: true,
            mensagem: 'Login realizado!',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
            }
        });
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
});

module.exports = router;
