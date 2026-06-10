-- Melhoria de performance: busca por período (filtro do dashboard)
CREATE INDEX IF NOT EXISTS idx_lancamento_data ON lancamento (data_lancamento);

COMMENT ON INDEX idx_lancamento_data IS 'Suporte a filtros por data_inicio e data_fim na API';
