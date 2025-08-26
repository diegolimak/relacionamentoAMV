-- Tabela de clientes e contratos
CREATE TABLE IF NOT EXISTS clientes (
    contrato_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_nome TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    operadora TEXT NOT NULL,
    plano TEXT NOT NULL,
    tipo_contratacao TEXT CHECK(tipo_contratacao IN ('PME', 'EMPRESARIAL')),
    data_implantacao DATE NOT NULL,
    data_cancelamento DATE,
    status_cliente TEXT CHECK(status_cliente IN ('ATIVO', 'CANCELADO', 'SUSPENSO')) DEFAULT 'ATIVO',
    quantidade_vidas INTEGER NOT NULL DEFAULT 0,
    valor_mensal DECIMAL(10,2),
    desconto_percentual DECIMAL(5,2) DEFAULT 0,
    responsavel_comercial TEXT,
    canal_aquisicao TEXT CHECK(canal_aquisicao IN ('PRESENCIAL', 'TELEVENDAS', 'DIGITAL', 'INDICACAO')),
    score_satisfacao INTEGER CHECK(score_satisfacao BETWEEN 1 AND 5),
    ultimo_contato DATE,
    proxima_acao TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de beneficiários
CREATE TABLE IF NOT EXISTS beneficiarios (
    beneficiario_id INTEGER PRIMARY KEY AUTOINCREMENT,
    contrato_id INTEGER NOT NULL,
    nome_beneficiario TEXT NOT NULL,
    cpf TEXT UNIQUE,
    data_nascimento DATE NOT NULL,
    genero TEXT CHECK(genero IN ('M', 'F', 'OUTRO')),
    parentesco TEXT CHECK(parentesco IN ('TITULAR', 'CONJUGE', 'FILHO', 'DEPENDENTE')),
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    data_inclusao DATE DEFAULT CURRENT_DATE,
    data_exclusao DATE,
    status_beneficiario TEXT CHECK(status_beneficiario IN ('ATIVO', 'INATIVO', 'CANCELADO')) DEFAULT 'ATIVO',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contrato_id) REFERENCES clientes(contrato_id)
);

-- Tabela de interações CRM
CREATE TABLE IF NOT EXISTS interacoes (
    interacao_id INTEGER PRIMARY KEY AUTOINCREMENT,
    contrato_id INTEGER NOT NULL,
    tipo_interacao TEXT CHECK(tipo_interacao IN ('LIGACAO', 'EMAIL', 'REUNIAO', 'PROPOSTA', 'RECLAMACAO', 'SUPORTE')) NOT NULL,
    descricao TEXT NOT NULL,
    data_interacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    responsavel TEXT NOT NULL,
    resultado TEXT,
    proxima_acao TEXT,
    prioridade TEXT CHECK(prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE')) DEFAULT 'MEDIA',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contrato_id) REFERENCES clientes(contrato_id)
);

-- Tabela de alertas do sistema
CREATE TABLE IF NOT EXISTS alertas (
    alerta_id INTEGER PRIMARY KEY AUTOINCREMENT,
    contrato_id INTEGER NOT NULL,
    tipo_alerta TEXT CHECK(tipo_alerta IN ('REAJUSTE_IMINENTE', 'PAGAMENTO_ATRASADO', 'RENOVACAO_CONTRATO', 'DOCUMENTO_PENDENTE', 'ANIVERSARIO', 'FOLLOW_UP')) NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data_alerta DATE NOT NULL,
    data_vencimento DATE,
    status_alerta TEXT CHECK(status_alerta IN ('PENDENTE', 'EM_ANDAMENTO', 'RESOLVIDO', 'CANCELADO')) DEFAULT 'PENDENTE',
    prioridade TEXT CHECK(prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE')) DEFAULT 'MEDIA',
    responsavel TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (contrato_id) REFERENCES clientes(contrato_id)
);

-- Tabela de propostas de reajuste
CREATE TABLE IF NOT EXISTS propostas_reajuste (
    proposta_id INTEGER PRIMARY KEY AUTOINCREMENT,
    contrato_id INTEGER NOT NULL,
    percentual_proposto DECIMAL(5,2) NOT NULL,
    valor_atual DECIMAL(10,2),
    valor_proposto DECIMAL(10,2),
    justificativa TEXT,
    data_proposta DATE DEFAULT CURRENT_DATE,
    data_resposta DATE,
    status_proposta TEXT CHECK(status_proposta IN ('PENDENTE', 'ACEITA', 'REJEITADA', 'NEGOCIANDO')) DEFAULT 'PENDENTE',
    observacoes TEXT,
    responsavel TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contrato_id) REFERENCES clientes(contrato_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_operadora ON clientes(operadora);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status_cliente);
CREATE INDEX IF NOT EXISTS idx_clientes_data_implantacao ON clientes(data_implantacao);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_contrato ON beneficiarios(contrato_id);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_cpf ON beneficiarios(cpf);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_data_nascimento ON beneficiarios(data_nascimento);
CREATE INDEX IF NOT EXISTS idx_interacoes_contrato ON interacoes(contrato_id);
CREATE INDEX IF NOT EXISTS idx_interacoes_data ON interacoes(data_interacao);
CREATE INDEX IF NOT EXISTS idx_alertas_contrato ON alertas(contrato_id);
CREATE INDEX IF NOT EXISTS idx_alertas_status ON alertas(status_alerta);
CREATE INDEX IF NOT EXISTS idx_alertas_data ON alertas(data_alerta);
CREATE INDEX IF NOT EXISTS idx_propostas_contrato ON propostas_reajuste(contrato_id);
CREATE INDEX IF NOT EXISTS idx_propostas_status ON propostas_reajuste(status_proposta);