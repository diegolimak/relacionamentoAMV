# CRM Healthcare - Sistema de Gestão de Benefícios

## 🏥 Visão Geral
Sistema completo de CRM desenvolvido especificamente para corretoras de benefícios de saúde, com foco em gestão proativa de clientes, controle de reajustes e análise demográfica de beneficiários.

## ✨ Funcionalidades Implementadas

### 📊 Dashboard Executivo
- **KPIs em tempo real**: Clientes ativos, reajustes próximos, alertas pendentes, faturamento
- **Gráficos interativos**: Distribuição de clientes por categoria, faturamento por categoria
- **Interface glassmorphism moderna** com design atual do mercado

### 👥 Gestão de Clientes
- **Base completa de clientes** com 18 contratos de exemplo
- **Categorização automática**: Premium (100+ vidas), Gold (50+), Silver (20+), Bronze (<20)
- **Status de reajuste inteligente**: Iminente, vencido, distante
- **Filtros avançados** por status, operadora, categoria
- **Cálculos automáticos**: Dias de relacionamento, faturamento anual estimado

### 📈 Sistema de Reajustes Inteligente
- **Aba "Próximos 90 dias"**: Contratos com reajuste iminente
- **Aba "Por Operadora"**: Percentuais oficiais 2025 da Corretora Amor à Vida
  - UNIMED: 19.50%
  - AMIL: 15.98% 
  - BRADESCO SAÚDE: 15.11%
  - SULAMERICA: 15.23%
  - PORTO SEGUROS: 15.87%
  - SEGUROS UNIMED: 11.92%
- **Simulador de impacto** financeiro por operadora
- **Alertas automáticos** baseados em datas de reajuste
- **Propostas automáticas** geradas via triggers

### 🔍 Análise Demográfica
- **Distribuição por gênero** com gráficos interativos
- **Análise de faixa etária**: Menores, adultos jovens, adultos, seniors, idosos
- **Controle de parentesco**: Titulares, cônjuges, filhos, dependentes
- **Aniversariantes do mês** para ações de relacionamento
- **23 beneficiários** cadastrados para análise completa

### 🚨 Centro de Alertas
- **10 tipos de alertas**: Reajuste iminente, documentos pendentes, aniversários, follow-ups
- **Sistema de priorização**: Urgente, alta, média, baixa
- **Workflow de resolução** com timestamps e observações
- **Integração com CRM** para ações diretas

## 🛠 Arquitetura Técnica

### Backend
- **Hono Framework** - Runtime edge otimizado
- **Cloudflare D1** - SQLite distribuído globalmente
- **5 migrações completas** com schema otimizado
- **Views materializadas** para performance
- **Triggers automáticos** para alertas e propostas

### Frontend
- **Vanilla JavaScript** com arquitetura de classes
- **TailwindCSS** com glassmorphism design
- **Chart.js** para visualizações interativas
- **Sistema de cache** para otimização de performance
- **Controles de emergência** para depuração (Ctrl+Shift+S/R)

### Base de Dados
- **Clientes**: 18 contratos de exemplo com dados realistas
- **Beneficiários**: 23 pessoas com análise demográfica completa
- **Operadoras**: 9 principais operadoras do mercado
- **Reajustes**: Percentuais oficiais 2025 configurados
- **Interações**: 11 interações de CRM registradas
- **Alertas**: 10 alertas ativos para teste

## 🚀 URLs de Acesso

### Desenvolvimento
- **Local**: http://localhost:3000
- **Sandbox**: https://3000-irbp0gukjnzd2fbjuscp1.e2b.dev

### APIs Principais
- `/api/crm/estatisticas` - KPIs do dashboard
- `/api/crm/clientes` - Lista de clientes com filtros
- `/api/reajustes/operadoras` - Percentuais por operadora
- `/api/demografico/estatisticas` - Análise demográfica
- `/api/alertas` - Centro de alertas

## 📈 Status do Projeto

### ✅ Implementado e Testado
- [x] Estrutura completa Hono + Cloudflare Pages
- [x] Database D1 com 5 migrações aplicadas
- [x] 15+ APIs RESTful funcionais
- [x] Interface completa com 5 seções principais
- [x] Sistema de reajustes com dados oficiais 2025
- [x] Análise demográfica completa
- [x] Centro de alertas funcional
- [x] Correções de todos os bugs JavaScript
- [x] Testes de performance e estabilidade

### 🎯 Próximos Desenvolvimentos
- [ ] Sistema de autenticação e controle de acesso
- [ ] Relatórios PDF exportáveis
- [ ] Integração com APIs de operadoras
- [ ] Módulo de cobrança e financeiro
- [ ] Dashboard mobile responsivo
- [ ] Sistema de notificações push
- [ ] Integração com WhatsApp Business
- [ ] Módulo de propostas comerciais

## 💻 Tecnologias Utilizadas
- **Runtime**: Cloudflare Workers + Hono Framework
- **Database**: Cloudflare D1 (SQLite distribuído)
- **Frontend**: HTML5, CSS3, JavaScript ES6+, TailwindCSS
- **Charts**: Chart.js 4.x
- **Icons**: FontAwesome 6.4
- **Build**: Vite 6.x
- **Deploy**: Wrangler CLI

## 🔧 Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Aplicar migrações
npm run db:migrate:local

# Popular com dados de seed
npm run db:seed

# Build do projeto
npm run build

# Iniciar desenvolvimento
pm2 start ecosystem.config.cjs

# Deploy para produção
npm run deploy:prod
```

## 📝 Estrutura do Projeto
```
webapp/
├── src/index.tsx           # Backend Hono completo
├── public/static/          # Frontend assets
│   ├── app.js             # Interface principal (45KB+)
│   └── styles.css         # Estilos glassmorphism  
├── migrations/            # 5 migrações D1
├── wrangler.jsonc         # Configuração Cloudflare
├── ecosystem.config.cjs   # PM2 para desenvolvimento
└── README.md             # Documentação completa
```

## 📊 Estatísticas do Sistema
- **18 contratos** ativos de exemplo
- **23 beneficiários** para análise demográfica  
- **9 operadoras** principais do mercado
- **6 percentuais** de reajuste 2025 configurados
- **10 alertas** ativos para gestão
- **15+ APIs** RESTful documentadas
- **Zero bugs** JavaScript identificados

## 🎯 Casos de Uso Principais
1. **Gestão Proativa**: Identificar clientes com reajuste nos próximos 90 dias
2. **Análise Financeira**: Simular impacto de reajustes por operadora
3. **Relacionamento**: Controlar aniversários e datas importantes
4. **Compliance**: Alertas para documentos e pendências
5. **Performance**: Dashboard executivo com KPIs em tempo real

---

**Desenvolvido com foco total na correção de bugs e performance otimizada para corretoras de benefícios de saúde.**