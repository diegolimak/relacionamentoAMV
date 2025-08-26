-- Dados de exemplo para o sistema CRM Healthcare

-- Inserir clientes de exemplo
INSERT OR IGNORE INTO clientes (
    contrato_id, cliente_nome, cidade, estado, operadora, plano, tipo_contratacao,
    data_implantacao, quantidade_vidas, valor_mensal, responsavel_comercial,
    canal_aquisicao, score_satisfacao
) VALUES 
(1, 'MAXIMAGEM - CLINICA MEDICA DE DIAGNOSTICOS POR IMAGEM LTDA', 'VALPARAISO', 'GO', 'SULAMERICA', 'DIRETO BSB', 'EMPRESARIAL', '2024-08-15', 47, 15000, 'Carlos Silva', 'INDICACAO', 4),
(2, 'MAYUMI CONSULTORIA EMPRESARIAL LTDA', 'GOIAS', 'GO', 'BRADESCO SAUDE', 'TOP NACIONAL', 'PME', '2024-11-20', 9, 3500, 'Ana Costa', 'TELEVENDAS', 3),
(3, 'MBSMED SERVIÇOS ADMINISTRATIVOS LTDA', 'UBERLANDIA', 'MG', 'SULAMERICA', 'ESPECIAL - 100', 'PME', '2025-01-17', 15, 5000, 'João Oliveira', 'PRESENCIAL', 4),
(4, 'MC PAISAGISMO LTDA', 'SANTA CATARINA', 'SC', 'BRADESCO SAUDE', 'TOP NACIONAL', 'PME', '2025-01-14', 53, 18000, 'Pedro Lima', 'DIGITAL', 5),
(5, 'TENT BRASIL CONSULTORIA LTDA', 'BRASILIA', 'DF', 'SULAMERICA', 'DIRETO BSB', 'PME', '2025-07-15', 32, 12000, 'Ana Costa', 'INDICACAO', 4),
(6, 'MAXIMAGEM - CLINICA MEDICA DE DIAGNOSTICOS POR IMAGEM LTDA', 'VALPARAISO', 'GO', 'BRADESCO SAUDE', 'TOP NACIONAL', 'EMPRESARIAL', '2025-05-23', 25, 8500, 'Carlos Silva', 'PRESENCIAL', 4),
(7, 'MAYUMI CONSULTORIA EMPRESARIAL LTDA', 'GOIAS', 'GO', 'AMIL', 'S450 QC', 'PME', '2024-11-24', 15, 4500, 'João Oliveira', 'TELEVENDAS', 3),
(8, 'MBSMED SERVIÇOS ADMINISTRATIVOS LTDA', 'UBERLANDIA', 'MG', 'BRADESCO SAUDE', 'TOP NACIONAL', 'EMPRESARIAL', '2024-09-10', 40, 14000, 'Pedro Lima', 'INDICACAO', 4),
(9, 'MC PAISAGISMO LTDA', 'SANTA CATARINA', 'SC', 'SULAMERICA', 'ESPECIAL - 100', 'PME', '2024-08-11', 8, 2800, 'Ana Costa', 'DIGITAL', 3),
(10, 'TENT BRASIL CONSULTORIA LTDA', 'BRASILIA', 'DF', 'AMIL', 'S450 QC', 'EMPRESARIAL', '2025-07-27', 12, 3600, 'Carlos Silva', 'PRESENCIAL', 4),
(11, 'MAXIMAGEM - CLINICA MEDICA DE DIAGNOSTICOS POR IMAGEM LTDA', 'VALPARAISO', 'GO', 'SULAMERICA', 'DIRETO BSB', 'PME', '2024-11-19', 25, 8500, 'Carlos Silva', 'INDICACAO', 4),
(12, 'MAYUMI CONSULTORIA EMPRESARIAL LTDA', 'GOIAS', 'GO', 'BRADESCO SAUDE', 'TOP NACIONAL', 'PME', '2024-11-20', 9, 3500, 'João Oliveira', 'TELEVENDAS', 3),
(13, 'MBSMED SERVIÇOS ADMINISTRATIVOS LTDA', 'UBERLANDIA', 'MG', 'AMIL', 'ESPECIAL - 100', 'PME', '2024-11-24', 30, 11800, 'João Oliveira', 'TELEVENDAS', 3),
(14, 'MC PAISAGISMO LTDA', 'SANTA CATARINA', 'SC', 'UNIMED', 'S450 QC', 'PME', '2024-08-21', 60, 22000, 'Ana Costa', 'PRESENCIAL', 5),
(15, 'TENT BRASIL CONSULTORIA LTDA', 'BRASILIA', 'DF', 'PORTO SEGUROS', 'BRONZE PRO', 'PME', '2024-08-11', 80, 35000, 'Pedro Lima', 'INDICACAO', 4),
(16, 'Tech Solutions Ltda', 'São Paulo', 'SP', 'QUALLITY PME', 'MASTER GREEN DF - AS', 'PME', '2025-04-28', 15, 4500, 'Lucas Ferreira', 'DIGITAL', 4),
(17, 'Metalúrgica ABC', 'Campinas', 'SP', 'MEDSÊNIOR', 'ESSENCIAL DF', 'PME', '2025-02-07', 35, 12000, 'Sandra Rocha', 'TELEVENDAS', 3),
(18, 'Comércio XYZ', 'Rio de Janeiro', 'RJ', 'SulAmérica', 'Executivo Nacional', 'PME', '2025-05-28', 20, 7800, 'Roberto Mendes', 'PRESENCIAL', 5);

-- Inserir beneficiários de exemplo
INSERT OR IGNORE INTO beneficiarios (
    beneficiario_id, contrato_id, nome_beneficiario, cpf, data_nascimento, 
    genero, parentesco, telefone, email
) VALUES 
(1, 1, 'João Silva Santos', '12345678901', '1985-03-15', 'M', 'TITULAR', '(61) 99999-1234', 'joao.santos@email.com'),
(2, 1, 'Maria Silva Santos', '12345678902', '1987-07-22', 'F', 'CONJUGE', '(61) 99999-1235', 'maria.santos@email.com'),
(3, 1, 'Pedro Silva Santos', '12345678903', '2015-12-10', 'M', 'FILHO', '', ''),
(4, 2, 'Ana Mayumi Tanaka', '23456789012', '1980-09-08', 'F', 'TITULAR', '(62) 88888-2345', 'ana.tanaka@email.com'),
(5, 2, 'Carlos Tanaka', '23456789013', '1978-04-18', 'M', 'CONJUGE', '(62) 88888-2346', 'carlos.tanaka@email.com'),
(6, 3, 'Roberto Medeiros', '34567890123', '1975-11-30', 'M', 'TITULAR', '(34) 77777-3456', 'roberto.medeiros@email.com'),
(7, 3, 'Luciana Medeiros', '34567890124', '1979-02-14', 'F', 'CONJUGE', '(34) 77777-3457', 'luciana.medeiros@email.com'),
(8, 4, 'Patricia Costa Lima', '45678901234', '1982-06-25', 'F', 'TITULAR', '(48) 66666-4567', 'patricia.lima@email.com'),
(9, 5, 'Fernando Oliveira', '56789012345', '1990-01-12', 'M', 'TITULAR', '(61) 55555-5678', 'fernando.oliveira@email.com'),
(10, 5, 'Camila Oliveira', '56789012346', '1992-08-03', 'F', 'CONJUGE', '(61) 55555-5679', 'camila.oliveira@email.com'),
(11, 14, 'Ricardo Paisagem', '78901234567', '1985-03-20', 'M', 'TITULAR', '(48) 44444-7890', 'ricardo.paisagem@email.com'),
(12, 14, 'Sandra Paisagem', '78901234568', '1987-09-15', 'F', 'CONJUGE', '(48) 44444-7891', 'sandra.paisagem@email.com'),
(13, 15, 'Antonio Tent', '89012345678', '1975-12-05', 'M', 'TITULAR', '(61) 33333-8901', 'antonio.tent@email.com'),
(14, 15, 'Beatriz Tent', '89012345679', '1977-04-22', 'F', 'CONJUGE', '(61) 33333-8902', 'beatriz.tent@email.com'),
(15, 16, 'Lucas Tech', '90123456789', '1988-07-10', 'M', 'TITULAR', '(11) 22222-9012', 'lucas.tech@email.com'),
(16, 17, 'Sandra Metal', '01234567890', '1983-10-08', 'F', 'TITULAR', '(19) 11111-0123', 'sandra.metal@email.com'),
(17, 18, 'Roberto Comercio', '11234567890', '1979-05-18', 'M', 'TITULAR', '(21) 00000-1234', 'roberto.comercio@email.com');

-- Inserir interações de exemplo
INSERT OR IGNORE INTO interacoes (
    contrato_id, tipo_interacao, descricao, responsavel, resultado, prioridade
) VALUES 
(1, 'LIGACAO', 'Contato para renovação de contrato', 'Carlos Silva', 'Cliente interessado em manter serviços', 'MEDIA'),
(1, 'EMAIL', 'Envio de proposta de reajuste', 'Carlos Silva', 'Proposta enviada, aguardando retorno', 'ALTA'),
(2, 'REUNIAO', 'Apresentação de novos planos', 'Ana Costa', 'Cliente solicitou análise interna', 'MEDIA'),
(4, 'LIGACAO', 'Follow-up pós implementação', 'Pedro Lima', 'Cliente satisfeito com os serviços', 'BAIXA'),
(5, 'EMAIL', 'Solicitação de documentos para reajuste', 'Ana Costa', 'Documentos enviados pelo cliente', 'ALTA');

-- Inserir alertas de exemplo
INSERT OR IGNORE INTO alertas (
    contrato_id, tipo_alerta, titulo, descricao, data_alerta, prioridade
) VALUES 
(1, 'REAJUSTE_IMINENTE', 'Reajuste contrato MAXIMAGEM', 'Contrato com reajuste previsto para 15/08/2025', '2025-08-15', 'ALTA'),
(2, 'REAJUSTE_IMINENTE', 'Reajuste contrato MAYUMI', 'Contrato com reajuste previsto para 20/11/2025', '2025-11-20', 'ALTA'),
(3, 'DOCUMENTO_PENDENTE', 'Documentos contratuais MBSMED', 'Falta assinatura em documentos de aditivo', '2025-08-25', 'MEDIA'),
(4, 'ANIVERSARIO', 'Aniversário Patricia Costa Lima', 'Beneficiária faz aniversário em 25/06', '2025-06-20', 'BAIXA'),
(5, 'FOLLOW_UP', 'Follow-up TENT BRASIL', 'Agendar reunião de acompanhamento trimestral', '2025-08-30', 'MEDIA');

-- Inserir propostas de reajuste de exemplo
INSERT OR IGNORE INTO propostas_reajuste (
    contrato_id, percentual_proposto, valor_atual, valor_proposto, 
    justificativa, responsavel, status_proposta
) VALUES 
(1, 15.50, 15000, 17325, 'Reajuste anual conforme contrato + inflação médica', 'Carlos Silva', 'PENDENTE'),
(5, 12.80, 12000, 13536, 'Reajuste moderado considerando histórico do cliente', 'Ana Costa', 'PENDENTE');