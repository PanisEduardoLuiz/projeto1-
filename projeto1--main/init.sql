CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY, nome VARCHAR(100), login VARCHAR(50), senha VARCHAR(50), situacao VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS lancamento (
    id SERIAL PRIMARY KEY, descricao VARCHAR(100), data_lancamento DATE, valor NUMERIC(10,2), tipo_lancamento VARCHAR(20), situacao VARCHAR(20)
);

INSERT INTO usuario (nome, login, senha, situacao) VALUES ('Admin', 'admin', '123456', 'ATIVO');

INSERT INTO lancamento (descricao, data_lancamento, valor, tipo_lancamento, situacao) VALUES
('Salário', '2026-03-05', 5000.00, 'RECEITA', 'CONCLUIDO'),
('Aluguel', '2026-03-10', 1500.00, 'DESPESA', 'PAGO'),
('Mercado', '2026-03-12', 600.00, 'DESPESA', 'PAGO'),
('Energia', '2026-03-15', 150.00, 'DESPESA', 'PENDENTE'),
('Água', '2026-03-15', 80.00, 'DESPESA', 'PENDENTE'),
('Internet', '2026-03-15', 100.00, 'DESPESA', 'PAGO'),
('Freelance', '2026-03-20', 1200.00, 'RECEITA', 'CONCLUIDO'),
('Gasolina', '2026-03-22', 200.00, 'DESPESA', 'PAGO'),
('Manutenção', '2026-03-25', 450.00, 'DESPESA', 'PENDENTE'),
('Rendimentos', '2026-03-26', 120.00, 'RECEITA', 'CONCLUIDO');
