-- Views para relatórios e análises otimizadas

-- View para clientes com informações agregadas
CREATE VIEW IF NOT EXISTS vw_clientes_detalhado AS
SELECT 
    c.contrato_id,
    c.cliente_nome,
    c.cidade,
    c.estado,
    c.operadora,
    c.plano,
    c.tipo_contratacao,
    c.data_implantacao,
    c.data_cancelamento,
    c.status_cliente,
    c.quantidade_vidas,
    c.valor_mensal,
    c.desconto_percentual,
    c.responsavel_comercial,
    c.canal_aquisicao,
    c.score_satisfacao,
    c.ultimo_contato,
    c.proxima_acao,
    
    -- Cálculos derivados
    CASE 
        WHEN c.status_cliente = 'ATIVO' THEN 
            CAST((julianday('now') - julianday(c.data_implantacao)) AS INTEGER)
        ELSE 
            CAST((julianday(c.data_cancelamento) - julianday(c.data_implantacao)) AS INTEGER)
    END as dias_ativo,
    
    CAST((julianday('now') - julianday(c.data_implantacao)) AS INTEGER) as dias_total_relacionamento,
    
    -- Categoria do cliente baseada em vidas
    CASE 
        WHEN c.quantidade_vidas >= 100 THEN 'PREMIUM'
        WHEN c.quantidade_vidas >= 50 THEN 'GOLD'
        WHEN c.quantidade_vidas >= 20 THEN 'SILVER'
        ELSE 'BRONZE'
    END as categoria_cliente,
    
    -- Status de reajuste baseado na data de implantação
    CASE 
        WHEN c.status_cliente = 'ATIVO' AND 
             date(c.data_implantacao, '+1 year') BETWEEN date('now') AND date('now', '+90 days') THEN 'REAJUSTE_IMINENTE'
        WHEN c.status_cliente = 'ATIVO' AND 
             date(c.data_implantação, '+1 year') <= date('now') THEN 'REAJUSTE_VENCIDO'
        ELSE 'REAJUSTE_DISTANTE'
    END as status_reajuste,
    
    date(c.data_implantacao, '+1 year') as data_proximo_reajuste,
    
    -- Faturamento anual estimado
    COALESCE(c.valor_mensal * 12 * (1 - c.desconto_percentual/100), 0) as faturamento_anual_estimado,
    
    -- Data da última interação
    (SELECT MAX(i.data_interacao) 
     FROM interacoes i 
     WHERE i.contrato_id = c.contrato_id) as ultima_interacao,
    
    -- Contagem de alertas pendentes
    (SELECT COUNT(*) 
     FROM alertas a 
     WHERE a.contrato_id = c.contrato_id 
     AND a.status_alerta = 'PENDENTE') as alertas_pendentes,
     
    -- Contagem de propostas pendentes
    (SELECT COUNT(*) 
     FROM propostas_reajuste p 
     WHERE p.contrato_id = c.contrato_id 
     AND p.status_proposta = 'PENDENTE') as propostas_pendentes

FROM clientes c;

-- View para análise demográfica de beneficiários
CREATE VIEW IF NOT EXISTS vw_demografico_beneficiarios AS
SELECT 
    b.beneficiario_id,
    b.contrato_id,
    b.nome_beneficiario,
    b.data_nascimento,
    b.genero,
    b.parentesco,
    b.status_beneficiario,
    c.cliente_nome,
    c.operadora,
    c.status_cliente,
    
    -- Cálculo de idade
    CAST((julianday('now') - julianday(b.data_nascimento)) / 365.25 AS INTEGER) as idade_atual,
    
    -- Faixa etária
    CASE 
        WHEN CAST((julianday('now') - julianday(b.data_nascimento)) / 365.25 AS INTEGER) < 18 THEN 'MENOR_18'
        WHEN CAST((julianday('now') - julianday(b.data_nascimento)) / 365.25 AS INTEGER) BETWEEN 18 AND 30 THEN 'ADULTO_JOVEM'
        WHEN CAST((julianday('now') - julianday(b.data_nascimento)) / 365.25 AS INTEGER) BETWEEN 31 AND 50 THEN 'ADULTO'
        WHEN CAST((julianday('now') - julianday(b.data_nascimento)) / 365.25 AS INTEGER) BETWEEN 51 AND 65 THEN 'ADULTO_SENIOR'
        ELSE 'IDOSO'
    END as faixa_etaria,
    
    -- Mês de aniversário
    CAST(strftime('%m', b.data_nascimento) AS INTEGER) as mes_aniversario,
    
    -- Próximo aniversário
    CASE 
        WHEN strftime('%m-%d', b.data_nascimento) >= strftime('%m-%d', 'now') THEN 
            date('now', 'start of year', '+' || (strftime('%j', b.data_nascimento) - 1) || ' days')
        ELSE 
            date('now', 'start of year', '+1 year', '+' || (strftime('%j', b.data_nascimento) - 1) || ' days')
    END as proximo_aniversario

FROM beneficiarios b
INNER JOIN clientes c ON b.contrato_id = c.contrato_id
WHERE b.status_beneficiario = 'ATIVO' AND c.status_cliente = 'ATIVO';

-- View para reajustes próximos (90 dias)
CREATE VIEW IF NOT EXISTS vw_reajustes_90_dias AS
SELECT 
    c.contrato_id,
    c.cliente_nome,
    c.operadora,
    c.plano,
    c.tipo_contratacao,
    c.quantidade_vidas,
    c.valor_mensal,
    c.data_implantacao,
    date(c.data_implantacao, '+1 year') as data_proximo_reajuste,
    c.responsavel_comercial,
    c.score_satisfacao,
    
    -- Dias até o reajuste
    CAST((julianday(date(c.data_implantacao, '+1 year')) - julianday('now')) AS INTEGER) as dias_ate_reajuste,
    
    -- Categoria de urgência
    CASE 
        WHEN CAST((julianday(date(c.data_implantacao, '+1 year')) - julianday('now')) AS INTEGER) <= 30 THEN 'URGENTE'
        WHEN CAST((julianday(date(c.data_implantacao, '+1 year')) - julianday('now')) AS INTEGER) <= 60 THEN 'ALTA'
        ELSE 'MEDIA'
    END as prioridade_reajuste,
    
    -- Valor estimado do reajuste (15% padrão)
    COALESCE(c.valor_mensal * 1.15, 0) as valor_estimado_reajuste

FROM clientes c
WHERE c.status_cliente = 'ATIVO'
AND date(c.data_implantacao, '+1 year') BETWEEN date('now') AND date('now', '+90 days')
ORDER BY dias_ate_reajuste ASC;