const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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
