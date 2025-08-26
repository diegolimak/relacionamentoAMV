-- Script para popular dados de teste no sistema CRM Healthcare

-- Dados adicionais de teste para beneficiários
INSERT OR IGNORE INTO beneficiarios (
    contrato_id, nome_beneficiario, cpf, data_nascimento, genero, parentesco, telefone, email
) VALUES 
(6, 'Dr. Máximo Imagem', '11111111111', '1970-03-15', 'M', 'TITULAR', '(62) 99999-0001', 'dr.maximo@maximagem.com.br'),
(6, 'Dra. Claudia Imagem', '22222222222', '1972-08-20', 'F', 'CONJUGE', '(62) 99999-0002', 'dra.claudia@maximagem.com.br'),
(7, 'Mayumi Tanaka', '33333333333', '1985-12-10', 'F', 'TITULAR', '(62) 88888-0003', 'mayumi@mayumiconsult.com.br'),
(8, 'Dr. Medeiros Senior', '44444444444', '1965-05-25', 'M', 'TITULAR', '(34) 77777-0004', 'dr.medeiros@mbsmed.com.br'),
(9, 'Maria do Carmo Paisagem', '55555555555', '1980-09-12', 'F', 'TITULAR', '(48) 66666-0005', 'maria@mcpaisagismo.com.br'),
(10, 'Tent Consultor', '66666666666', '1978-11-08', 'M', 'TITULAR', '(61) 55555-0006', 'tent@tentbrasil.com.br');

-- Interações adicionais para enriquecer o histórico
INSERT OR IGNORE INTO interacoes (
    contrato_id, tipo_interacao, descricao, data_interacao, responsavel, resultado, prioridade
) VALUES 
(1, 'PROPOSTA', 'Proposta de reajuste anual enviada', '2025-08-21', 'Carlos Silva', 'Aguardando aprovação da diretoria', 'ALTA'),
(2, 'LIGACAO', 'Contato para agendamento de reunião', '2025-08-23', 'Ana Costa', 'Reunião agendada para próxima semana', 'MEDIA'),
(4, 'EMAIL', 'Follow-up sobre satisfação do serviço', '2025-08-16', 'Pedro Lima', 'Cliente muito satisfeito, score 5', 'BAIXA'),
(5, 'REUNIAO', 'Reunião de acompanhamento trimestral', '2025-08-25', 'Ana Costa', 'Definidas ações para próximo período', 'MEDIA'),
(6, 'SUPORTE', 'Suporte técnico para sistema de gestão', '2025-08-20', 'Carlos Silva', 'Problema resolvido, sistema funcionando', 'ALTA'),
(15, 'PROPOSTA', 'Proposta de desconto especial por volume', '2025-08-18', 'Pedro Lima', 'Cliente considerando a proposta', 'ALTA');

-- Alertas específicos para teste
INSERT OR IGNORE INTO alertas (
    contrato_id, tipo_alerta, titulo, descricao, data_alerta, data_vencimento, prioridade, responsavel
) VALUES 
(14, 'ANIVERSARIO', 'Aniversário Ricardo Paisagem', 'Beneficiário titular faz aniversário em 20/03', '2025-03-15', '2025-03-20', 'BAIXA', 'Pedro Lima'),
(15, 'ANIVERSARIO', 'Aniversário Antonio Tent', 'Beneficiário titular faz aniversário em 05/12', '2025-11-30', '2025-12-05', 'BAIXA', 'Ana Costa'),
(16, 'FOLLOW_UP', 'Acompanhamento Tech Solutions', 'Cliente novo, realizar follow-up de implementação', '2025-08-30', '2025-09-15', 'MEDIA', 'Lucas Ferreira'),
(17, 'DOCUMENTO_PENDENTE', 'Documentos Metalúrgica ABC', 'Pendente envio de documentos corporativos atualizados', '2025-08-25', '2025-09-10', 'ALTA', 'Sandra Rocha'),
(18, 'REAJUSTE_IMINENTE', 'Reajuste Comércio XYZ', 'Primeiro reajuste do cliente, atenção especial', '2025-05-01', '2025-05-28', 'MEDIA', 'Roberto Mendes');

-- Verificar dados inseridos
SELECT 'Total de clientes:', COUNT(*) FROM clientes;
SELECT 'Total de beneficiários:', COUNT(*) FROM beneficiarios;
SELECT 'Total de interações:', COUNT(*) FROM interacoes;
SELECT 'Total de alertas:', COUNT(*) FROM alertas;
SELECT 'Total de operadoras:', COUNT(*) FROM operadoras;
SELECT 'Total de reajustes configurados:', COUNT(*) FROM reajustes_operadoras;