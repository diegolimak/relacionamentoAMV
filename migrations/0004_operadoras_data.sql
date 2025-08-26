-- Tabela de operadoras e seus percentuais de reajuste
CREATE TABLE IF NOT EXISTS operadoras (
    operadora_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    cnpj TEXT,
    telefone TEXT,
    email TEXT,
    site TEXT,
    ativa BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir operadoras principais
INSERT OR IGNORE INTO operadoras (nome, cnpj, telefone, email, site) VALUES 
('UNIMED', '12.345.678/0001-90', '0800-123-4567', 'contato@unimed.com.br', 'www.unimed.com.br'),
('AMIL', '23.456.789/0001-12', '0800-234-5678', 'atendimento@amil.com.br', 'www.amil.com.br'),
('BRADESCO SAUDE', '34.567.890/0001-23', '0800-345-6789', 'saude@bradesco.com.br', 'www.bradescosaude.com.br'),
('SULAMERICA', '45.678.901/0001-34', '0800-456-7890', 'comercial@sulaamerica.com.br', 'www.sulaamerica.com.br'),
('PORTO SEGUROS', '56.789.012/0001-45', '0800-567-8901', 'seguros@porto.com.br', 'www.portoseguros.com.br'),
('SEGUROS UNIMED', '67.890.123/0001-56', '0800-678-9012', 'seguros@unimed.com.br', 'www.segurosunimed.com.br'),
('QUALLITY PME', '78.901.234/0001-67', '0800-789-0123', 'pme@quallity.com.br', 'www.quallity.com.br'),
('MEDSÊNIOR', '89.012.345/0001-78', '0800-890-1234', 'atendimento@medsenior.com.br', 'www.medsenior.com.br'),
('SulAmérica', '90.123.456/0001-89', '0800-901-2345', 'comercial@sulamerica.com.br', 'www.sulamerica.com.br');