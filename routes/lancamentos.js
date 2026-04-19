const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const nodemailer = require('nodemailer');

// Configura o transporte SMTP do Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
    },
});

const EMAIL_PADRAO = process.env.GMAIL_USER; // envia notificações para o próprio email

// Rota GET: Buscar todos os lançamentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lancamento ORDER BY data_lancamento DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no servidor');
  }
});

// Rota POST: Criar novo lançamento
router.post('/', async (req, res) => {
  const { descricao, data_lancamento, valor, tipo_lancamento, situacao } = req.body;
  try {
    const query = `
      INSERT INTO lancamento (descricao, data_lancamento, valor, tipo_lancamento, situacao)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const values = [descricao, data_lancamento, valor, tipo_lancamento, situacao];
    const result = await pool.query(query, values);

    // Tenta enviar o e-mail de alerta não bloqueante (não impede o response em caso de falha)
    try {
        const valorFormatado = Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        await transporter.sendMail({
            from: `Notificações <${process.env.GMAIL_USER}>`,
            to: EMAIL_PADRAO,
            subject: 'Novo Lançamento Criado',
            html: `<p>Um novo lançamento foi criado no sistema.</p>
                   <ul>
                     <li><strong>Descrição:</strong> ${descricao}</li>
                     <li><strong>Valor:</strong> ${valorFormatado}</li>
                     <li><strong>Tipo:</strong> ${tipo_lancamento}</li>
                     <li><strong>Situação:</strong> ${situacao}</li>
                   </ul>`
        });
    } catch(emailErr) {
        console.error('Erro ao enviar e-mail de criação:', emailErr);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar lançamento');
  }
});

// Rota PUT: Editar lançamento existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { descricao, data_lancamento, valor, tipo_lancamento, situacao } = req.body;
  try {
    // Busca o valor anterior para comparar no e-mail
    const prevResult = await pool.query('SELECT * FROM lancamento WHERE id = $1', [id]);
    const prevLancamento = prevResult.rows[0];

    const query = `
      UPDATE lancamento 
      SET descricao = $1, data_lancamento = $2, valor = $3, tipo_lancamento = $4, situacao = $5
      WHERE id = $6 RETURNING *
    `;
    const values = [descricao, data_lancamento, valor, tipo_lancamento, situacao, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).send('Lançamento não encontrado');
    }

    // Tenta enviar o e-mail de alerta não bloqueante caso encontre o registro anterior
    if (prevLancamento) {
        try {
            const valorFormatado = Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const valorAntigoFormatado = Number(prevLancamento.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            let infoAlteracoes = '';
            if (prevLancamento.valor != valor) {
                infoAlteracoes += `<li><strong>Valor:</strong> ${valorFormatado} (era ${valorAntigoFormatado})</li>`;
            } else {
                infoAlteracoes += `<li><strong>Valor:</strong> ${valorFormatado} (sem mudança)</li>`;
            }
            if (prevLancamento.situacao !== situacao) {
                infoAlteracoes += `<li><strong>Situação:</strong> ${situacao} (era ${prevLancamento.situacao})</li>`;
            } else {
                infoAlteracoes += `<li><strong>Situação:</strong> ${situacao}</li>`;
            }

            await transporter.sendMail({
                from: `Notificações <${process.env.GMAIL_USER}>`,
                to: EMAIL_PADRAO,
                subject: 'Lançamento Editado',
                html: `<p>O lançamento <strong>${descricao}</strong> (ID: ${id}) foi editado.</p>
                       <ul>
                         ${infoAlteracoes}
                         <li><strong>Tipo:</strong> ${tipo_lancamento}</li>
                       </ul>`
            });
        } catch(emailErr) {
            console.error('Erro ao enviar e-mail de edição:', emailErr);
        }
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar lançamento');
  }
});

// Rota DELETE: Excluir lançamento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM lancamento WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).send('Lançamento não encontrado');
    }
    
    res.json({ message: 'Lançamento excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir lançamento');
  }
});

module.exports = router;
