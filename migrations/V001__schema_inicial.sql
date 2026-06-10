-- Migração inicial: tabelas e dados de exemplo
CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    situacao VARCHAR(20) DEFAULT 'ATIVO'
);

CREATE TABLE IF NOT EXISTS lancamento (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100),
    data_lancamento DATE,
    valor NUMERIC(10, 2),
    tipo_lancamento VARCHAR(20),
    situacao VARCHAR(20)
);

INSERT INTO usuario (nome, email, senha, situacao)
VALUES ('Administrador', 'admin', 'admin123', 'ATIVO')
ON CONFLICT (email) DO NOTHING;

INSERT INTO lancamento (descricao, data_lancamento, valor, tipo_lancamento, situacao)
SELECT * FROM (VALUES
    ('Salário', '2026-03-05'::DATE, 5000.00, 'RECEITA', 'CONCLUIDO'),
    ('Aluguel', '2026-03-10'::DATE, 1500.00, 'DESPESA', 'CONCLUIDO'),
    ('Mercado', '2026-03-12'::DATE, 600.00, 'DESPESA', 'CONCLUIDO'),
    ('Energia', '2026-03-15'::DATE, 150.00, 'DESPESA', 'PENDENTE'),
    ('Água', '2026-03-15'::DATE, 80.00, 'DESPESA', 'PENDENTE'),
    ('Internet', '2026-03-15'::DATE, 100.00, 'DESPESA', 'CONCLUIDO'),
    ('Freelance', '2026-03-20'::DATE, 1200.00, 'RECEITA', 'CONCLUIDO'),
    ('Gasolina', '2026-03-22'::DATE, 200.00, 'DESPESA', 'CONCLUIDO'),
    ('Manutenção', '2026-03-25'::DATE, 450.00, 'DESPESA', 'PENDENTE'),
    ('Rendimentos', '2026-03-26'::DATE, 120.00, 'RECEITA', 'CONCLUIDO')
) AS seed(descricao, data_lancamento, valor, tipo_lancamento, situacao)
WHERE NOT EXISTS (SELECT 1 FROM lancamento LIMIT 1);
