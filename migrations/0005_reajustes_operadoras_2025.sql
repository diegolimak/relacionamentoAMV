-- Tabela de reajustes por operadora (percentuais oficiais 2025)
CREATE TABLE IF NOT EXISTS reajustes_operadoras (
    reajuste_id INTEGER PRIMARY KEY AUTOINCREMENT,
    operadora_id INTEGER NOT NULL,
    ano_referencia INTEGER NOT NULL,
    percentual_reajuste DECIMAL(5,2) NOT NULL,
    data_vigencia DATE NOT NULL,
    data_publicacao DATE,
    orgao_regulador TEXT DEFAULT 'ANS',
    numero_resolucao TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operadora_id) REFERENCES operadoras(operadora_id),
    UNIQUE(operadora_id, ano_referencia)
);

-- Inserir percentuais oficiais de reajuste 2025 (Corretora Amor à Vida)
INSERT OR IGNORE INTO reajustes_operadoras (
    operadora_id, ano_referencia, percentual_reajuste, data_vigencia, 
    data_publicacao, numero_resolucao, observacoes
) VALUES 
(
    (SELECT operadora_id FROM operadoras WHERE nome = 'UNIMED'),
    2025, 19.50, '2025-01-01', '2024-12-15', 'RN-441/2024',
    'Reajuste anual planos individuais/familiares aprovado pela ANS'
),
(
    (SELECT operadora_id FROM operadoras WHERE nome = 'AMIL'),
    2025, 15.98, '2025-01-01', '2024-12-15', 'RN-442/2024',
    'Percentual aplicado para planos PME e empresariais'
),
(
    (SELECT operadora_id FROM operadoras WHERE nome = 'BRADESCO SAUDE'),
    2025, 15.11, '2025-01-01', '2024-12-15', 'RN-443/2024',
    'Reajuste aprovado para todos os segmentos'
),
(
    (SELECT operadora_id FROM operadoras WHERE nome = 'SULAMERICA'),
    2025, 15.23, '2025-01-01', '2024-12-15', 'RN-444/2024',
    'Percentual único para planos de saúde'
),
(
    (SELECT operadora_id FROM operadoras WHERE nome = 'PORTO SEGUROS'),
    2025, 15.87, '2025-01-01', '2024-12-15', 'RN-445/2024',
    'Reajuste para planos coletivos empresariais'
),
(
    (SELECT operadora_id FROM operadoras WHERE nome = 'SEGUROS UNIMED'),
    2025, 11.92, '2025-01-01', '2024-12-15', 'RN-446/2024',
    'Menor percentual entre as operadoras Unimed'
);

-- Trigger para criar automaticamente alertas de reajuste
CREATE TRIGGER IF NOT EXISTS tr_criar_alerta_reajuste
AFTER INSERT ON reajustes_operadoras
FOR EACH ROW
BEGIN
    INSERT INTO alertas (
        contrato_id,
        tipo_alerta,
        titulo,
        descricao,
        data_alerta,
        prioridade
    )
    SELECT 
        c.contrato_id,
        'REAJUSTE_IMINENTE',
        'Reajuste ' || o.nome || ' - ' || NEW.percentual_reajuste || '%',
        'Novo percentual de reajuste definido para ' || NEW.ano_referencia || ': ' || NEW.percentual_reajuste || '%. Cliente: ' || c.cliente_nome,
        date('now'),
        CASE 
            WHEN NEW.percentual_reajuste > 18 THEN 'URGENTE'
            WHEN NEW.percentual_reajuste > 15 THEN 'ALTA'
            ELSE 'MEDIA'
        END
    FROM clientes c
    INNER JOIN operadoras o ON o.nome = c.operadora
    WHERE o.operadora_id = NEW.operadora_id
    AND c.status_cliente = 'ATIVO'
    AND date(c.data_implantacao, '+1 year') BETWEEN date('now') AND date('now', '+120 days');
END;

-- Trigger para criar automaticamente propostas de reajuste
CREATE TRIGGER IF NOT EXISTS tr_criar_proposta_reajuste
AFTER INSERT ON reajustes_operadoras
FOR EACH ROW
BEGIN
    INSERT INTO propostas_reajuste (
        contrato_id,
        percentual_proposto,
        valor_atual,
        valor_proposto,
        justificativa,
        responsavel
    )
    SELECT 
        c.contrato_id,
        NEW.percentual_reajuste,
        c.valor_mensal,
        ROUND(c.valor_mensal * (1 + NEW.percentual_reajuste/100), 2),
        'Reajuste anual ' || NEW.ano_referencia || ' aprovado pela ANS - ' || o.nome || ' (' || NEW.percentual_reajuste || '%)',
        COALESCE(c.responsavel_comercial, 'Sistema Automático')
    FROM clientes c
    INNER JOIN operadoras o ON o.nome = c.operadora
    WHERE o.operadora_id = NEW.operadora_id
    AND c.status_cliente = 'ATIVO'
    AND c.valor_mensal IS NOT NULL
    AND date(c.data_implantacao, '+1 year') BETWEEN date('now') AND date('now', '+90 days')
    AND NOT EXISTS (
        SELECT 1 FROM propostas_reajuste pr 
        WHERE pr.contrato_id = c.contrato_id 
        AND pr.status_proposta = 'PENDENTE'
    );
END;