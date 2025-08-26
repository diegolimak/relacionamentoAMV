import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ==================== CRM APIs ====================

// Estatísticas gerais do CRM
app.get('/api/crm/estatisticas', async (c) => {
  try {
    const { env } = c

    // Clientes ativos e cancelados
    const clientesStats = await env.DB.prepare(`
      SELECT 
        status_cliente,
        COUNT(*) as count
      FROM clientes 
      GROUP BY status_cliente
    `).all()

    // Reajustes próximos (90 dias)
    const reajustesProximos = await env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM clientes 
      WHERE status_cliente = 'ATIVO'
      AND date(data_implantacao, '+1 year') BETWEEN date('now') AND date('now', '+90 days')
    `).first()

    // Alertas pendentes
    const alertasPendentes = await env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM alertas 
      WHERE status_alerta = 'PENDENTE'
    `).first()

    // Faturamento ativo
    const faturamentoAtivo = await env.DB.prepare(`
      SELECT COALESCE(SUM(valor_mensal * 12), 0) as total
      FROM clientes 
      WHERE status_cliente = 'ATIVO' AND valor_mensal IS NOT NULL
    `).first()

    // Categorias de clientes
    const categoriaClientes = await env.DB.prepare(`
      SELECT 
        CASE 
          WHEN quantidade_vidas >= 100 THEN 'PREMIUM'
          WHEN quantidade_vidas >= 50 THEN 'GOLD'
          WHEN quantidade_vidas >= 20 THEN 'SILVER'
          ELSE 'BRONZE'
        END as categoria_cliente,
        COUNT(*) as count
      FROM clientes 
      WHERE status_cliente = 'ATIVO'
      GROUP BY categoria_cliente
    `).all()

    const clientesAtivos = clientesStats.results?.find((s: any) => s.status_cliente === 'ATIVO')?.count || 0
    const clientesCancelados = clientesStats.results?.find((s: any) => s.status_cliente === 'CANCELADO')?.count || 0

    return c.json({
      success: true,
      data: {
        clientesAtivos,
        clientesCancelados,
        reajustesProximos: reajustesProximos?.count || 0,
        alertasPendentes: alertasPendentes?.count || 0,
        faturamentoAtivo: faturamentoAtivo?.total || 0,
        categoriaClientes: categoriaClientes.results || []
      }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Dashboard CRM - dados agregados
app.get('/api/crm/dashboard', async (c) => {
  try {
    const { env } = c

    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(CASE WHEN status_cliente = 'ATIVO' THEN 1 END) as clientesAtivos,
        COUNT(CASE WHEN status_cliente = 'CANCELADO' THEN 1 END) as clientesCancelados,
        COUNT(*) as totalClientes,
        COUNT(CASE WHEN quantidade_vidas >= 100 THEN 1 END) as clientesPremium,
        COALESCE(SUM(CASE WHEN status_cliente = 'ATIVO' AND valor_mensal IS NOT NULL THEN valor_mensal * 12 ELSE 0 END), 0) as faturamentoTotal
      FROM clientes
    `).first()

    const alertasPendentes = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM alertas WHERE status_alerta = 'PENDENTE'
    `).first()

    const clientesReajuste90 = await env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM clientes 
      WHERE status_cliente = 'ATIVO'
      AND date(data_implantacao, '+1 year') BETWEEN date('now') AND date('now', '+90 days')
    `).first()

    const interacoesHoje = await env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM interacoes 
      WHERE date(data_interacao) = date('now')
    `).first()

    const taxaRetencao = await env.DB.prepare(`
      SELECT 
        ROUND(
          (COUNT(CASE WHEN status_cliente = 'ATIVO' THEN 1 END) * 100.0 / COUNT(*)), 1
        ) as taxa
      FROM clientes
    `).first()

    return c.json({
      success: true,
      data: {
        totalClientes: stats?.totalClientes || 0,
        clientesAtivos: stats?.clientesAtivos || 0,
        clientesCancelados: stats?.clientesCancelados || 0,
        clientesPremium: stats?.clientesPremium || 0,
        alertasPendentes: alertasPendentes?.count || 0,
        faturamentoTotal: stats?.faturamentoTotal || 0,
        clientesReajuste90: clientesReajuste90?.count || 0,
        interacoesHoje: interacoesHoje?.count || 0,
        taxaRetencao: taxaRetencao?.taxa || "0.0"
      }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Lista de clientes com view detalhada
app.get('/api/crm/clientes', async (c) => {
  try {
    const { env } = c
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status') || ''
    const operadora = c.req.query('operadora') || ''

    let query = `
      SELECT 
        c.*,
        CASE 
          WHEN c.status_cliente = 'ATIVO' THEN 
            CAST((julianday('now') - julianday(c.data_implantacao)) AS INTEGER)
          ELSE 
            CAST((julianday(c.data_cancelamento) - julianday(c.data_implantacao)) AS INTEGER)
        END as dias_ativo,
        
        CAST((julianday('now') - julianday(c.data_implantacao)) AS INTEGER) as dias_total_relacionamento,
        
        CASE 
          WHEN c.quantidade_vidas >= 100 THEN 'PREMIUM'
          WHEN c.quantidade_vidas >= 50 THEN 'GOLD'
          WHEN c.quantidade_vidas >= 20 THEN 'SILVER'
          ELSE 'BRONZE'
        END as categoria_cliente,
        
        CASE 
          WHEN c.status_cliente = 'ATIVO' AND 
               date(c.data_implantacao, '+1 year') BETWEEN date('now') AND date('now', '+90 days') THEN 'REAJUSTE_IMINENTE'
          WHEN c.status_cliente = 'ATIVO' AND 
               date(c.data_implantacao, '+1 year') <= date('now') THEN 'REAJUSTE_VENCIDO'
          ELSE 'REAJUSTE_DISTANTE'
        END as status_reajuste,
        
        date(c.data_implantacao, '+1 year') as data_proximo_reajuste,
        COALESCE(c.valor_mensal * 12 * (1 - c.desconto_percentual/100), 0) as faturamento_anual_estimado,
        
        (SELECT COUNT(*) FROM alertas a WHERE a.contrato_id = c.contrato_id AND a.status_alerta = 'PENDENTE') as alertas_pendentes
      FROM clientes c
      WHERE 1=1
    `

    const params: any[] = []
    if (status) {
      query += ` AND c.status_cliente = ?`
      params.push(status)
    }
    if (operadora) {
      query += ` AND c.operadora = ?`
      params.push(operadora)
    }

    query += ` ORDER BY c.data_implantacao DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const result = await env.DB.prepare(query).bind(...params).all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Clientes ativos para gráficos
app.get('/api/crm/clientes-ativos', async (c) => {
  try {
    const { env } = c

    const result = await env.DB.prepare(`
      SELECT 
        c.*,
        CASE 
          WHEN c.quantidade_vidas >= 100 THEN 'PREMIUM'
          WHEN c.quantidade_vidas >= 50 THEN 'GOLD'
          WHEN c.quantidade_vidas >= 20 THEN 'SILVER'
          ELSE 'BRONZE'
        END as categoria_cliente,
        COALESCE(c.valor_mensal * 12, 0) as faturamento_anual_estimado
      FROM clientes c
      WHERE c.status_cliente = 'ATIVO'
      ORDER BY c.quantidade_vidas DESC
    `).all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Reajustes próximos (90 dias)
app.get('/api/crm/reajustes-90-dias', async (c) => {
  try {
    const { env } = c

    const result = await env.DB.prepare(`
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
        CAST((julianday(date(c.data_implantacao, '+1 year')) - julianday('now')) AS INTEGER) as dias_ate_reajuste,
        CASE 
          WHEN CAST((julianday(date(c.data_implantacao, '+1 year')) - julianday('now')) AS INTEGER) <= 30 THEN 'URGENTE'
          WHEN CAST((julianday(date(c.data_implantacao, '+1 year')) - julianday('now')) AS INTEGER) <= 60 THEN 'ALTA'
          ELSE 'MEDIA'
        END as prioridade_reajuste,
        COALESCE(c.valor_mensal * 1.15, 0) as valor_estimado_reajuste
      FROM clientes c
      WHERE c.status_cliente = 'ATIVO'
      AND date(c.data_implantacao, '+1 year') BETWEEN date('now') AND date('now', '+90 days')
      ORDER BY dias_ate_reajuste ASC
    `).all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Reajustes por operadora
app.get('/api/reajustes/operadoras', async (c) => {
  try {
    const { env } = c

    const result = await env.DB.prepare(`
      SELECT 
        o.nome as operadora_nome,
        ro.percentual_reajuste,
        ro.ano_referencia,
        ro.data_vigencia,
        ro.numero_resolucao,
        COUNT(CASE WHEN c.status_cliente = 'ATIVO' THEN 1 END) as clientes_ativos,
        COUNT(CASE WHEN date(c.data_implantacao, '+1 year') BETWEEN date('now') AND date('now', '+90 days') THEN 1 END) as clientes_reajuste_proximo,
        COALESCE(SUM(CASE WHEN c.status_cliente = 'ATIVO' AND c.valor_mensal IS NOT NULL THEN c.valor_mensal END), 0) as faturamento_mensal_atual,
        COALESCE(SUM(CASE WHEN c.status_cliente = 'ATIVO' AND c.valor_mensal IS NOT NULL THEN c.valor_mensal * (1 + ro.percentual_reajuste/100) END), 0) as faturamento_mensal_pos_reajuste
      FROM operadoras o
      LEFT JOIN reajustes_operadoras ro ON o.operadora_id = ro.operadora_id AND ro.ano_referencia = 2025
      LEFT JOIN clientes c ON c.operadora = o.nome
      WHERE o.ativa = 1
      GROUP BY o.operadora_id, o.nome, ro.percentual_reajuste, ro.ano_referencia, ro.data_vigencia, ro.numero_resolucao
      ORDER BY ro.percentual_reajuste DESC
    `).all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Impacto geral dos reajustes
app.get('/api/reajustes/impacto-geral', async (c) => {
  try {
    const { env } = c

    const result = await env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT c.contrato_id) as total_contratos_ativos,
        COUNT(DISTINCT CASE WHEN ro.percentual_reajuste IS NOT NULL THEN c.contrato_id END) as contratos_com_reajuste,
        COALESCE(AVG(ro.percentual_reajuste), 0) as percentual_medio,
        COALESCE(SUM(c.valor_mensal), 0) as faturamento_atual,
        COALESCE(SUM(c.valor_mensal * (1 + COALESCE(ro.percentual_reajuste, 15)/100)), 0) as faturamento_pos_reajuste,
        COALESCE(SUM(c.valor_mensal * COALESCE(ro.percentual_reajuste, 15)/100), 0) as impacto_financeiro_mensal
      FROM clientes c
      LEFT JOIN operadoras o ON o.nome = c.operadora
      LEFT JOIN reajustes_operadoras ro ON o.operadora_id = ro.operadora_id AND ro.ano_referencia = 2025
      WHERE c.status_cliente = 'ATIVO' AND c.valor_mensal IS NOT NULL
    `).first()

    return c.json({
      success: true,
      data: result || {}
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Simular impacto de reajuste
app.post('/api/reajustes/simular', async (c) => {
  try {
    const { env } = c
    const { operadora, percentual } = await c.req.json()

    if (!operadora || !percentual) {
      return c.json({ success: false, error: 'Operadora e percentual são obrigatórios' }, 400)
    }

    const result = await env.DB.prepare(`
      SELECT 
        c.contrato_id,
        c.cliente_nome,
        c.valor_mensal as valor_atual,
        ROUND(c.valor_mensal * (1 + ?/100), 2) as valor_novo,
        ROUND(c.valor_mensal * ?/100, 2) as diferenca_mensal,
        ROUND(c.valor_mensal * ?/100 * 12, 2) as diferenca_anual
      FROM clientes c
      WHERE c.operadora = ? 
      AND c.status_cliente = 'ATIVO' 
      AND c.valor_mensal IS NOT NULL
      ORDER BY c.valor_mensal DESC
    `).bind(percentual, percentual, percentual, operadora).all()

    const totals = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_contratos,
        COALESCE(SUM(c.valor_mensal), 0) as faturamento_atual,
        COALESCE(SUM(c.valor_mensal * (1 + ?/100)), 0) as faturamento_novo,
        COALESCE(SUM(c.valor_mensal * ?/100), 0) as impacto_mensal,
        COALESCE(SUM(c.valor_mensal * ?/100 * 12), 0) as impacto_anual
      FROM clientes c
      WHERE c.operadora = ? 
      AND c.status_cliente = 'ATIVO' 
      AND c.valor_mensal IS NOT NULL
    `).bind(percentual, percentual, percentual, operadora).first()

    return c.json({
      success: true,
      data: {
        detalhes: result.results || [],
        totalizacao: totals || {}
      }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ==================== DEMOGRÁFICO APIs ====================

// Estatísticas demográficas
app.get('/api/demografico/estatisticas', async (c) => {
  try {
    const { env } = c

    // Distribuição por gênero
    const genero = await env.DB.prepare(`
      SELECT 
        genero,
        COUNT(*) as count
      FROM beneficiarios b
      INNER JOIN clientes c ON b.contrato_id = c.contrato_id
      WHERE b.status_beneficiario = 'ATIVO' AND c.status_cliente = 'ATIVO'
      GROUP BY genero
    `).all()

    // Distribuição por faixa etária
    const faixaEtaria = await env.DB.prepare(`
      SELECT 
        CASE 
          WHEN CAST((julianday('now') - julianday(b.data_nascimento)) / 365.25 AS INTEGER) < 18 THEN 'MENOR_18'
          WHEN CAST((julianday('now') - julianday(b.data_nascimento)) / 365.25 AS INTEGER) BETWEEN 18 AND 30 THEN 'ADULTO_JOVEM'
          WHEN CAST((julianday('now') - julianday(b.data_nascimento)) / 365.25 AS INTEGER) BETWEEN 31 AND 50 THEN 'ADULTO'
          WHEN CAST((julianday('now') - julianday(b.data_nascimento)) / 365.25 AS INTEGER) BETWEEN 51 AND 65 THEN 'ADULTO_SENIOR'
          ELSE 'IDOSO'
        END as faixa_etaria,
        COUNT(*) as count
      FROM beneficiarios b
      INNER JOIN clientes c ON b.contrato_id = c.contrato_id
      WHERE b.status_beneficiario = 'ATIVO' AND c.status_cliente = 'ATIVO'
      GROUP BY faixa_etaria
    `).all()

    // Distribuição por parentesco
    const parentesco = await env.DB.prepare(`
      SELECT 
        parentesco,
        COUNT(*) as count
      FROM beneficiarios b
      INNER JOIN clientes c ON b.contrato_id = c.contrato_id
      WHERE b.status_beneficiario = 'ATIVO' AND c.status_cliente = 'ATIVO'
      GROUP BY parentesco
    `).all()

    return c.json({
      success: true,
      data: {
        genero: genero.results || [],
        faixaEtaria: faixaEtaria.results || [],
        parentesco: parentesco.results || []
      }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Aniversariantes do mês
app.get('/api/demografico/aniversariantes', async (c) => {
  try {
    const { env } = c
    const mes = c.req.query('mes') || new Date().getMonth() + 1

    const result = await env.DB.prepare(`
      SELECT 
        b.nome_beneficiario,
        b.data_nascimento,
        b.parentesco,
        c.cliente_nome,
        c.responsavel_comercial,
        CAST((julianday('now') - julianday(b.data_nascimento)) / 365.25 AS INTEGER) as idade_atual,
        CASE 
          WHEN strftime('%m-%d', b.data_nascimento) >= strftime('%m-%d', 'now') THEN 
            date('now', 'start of year', '+' || (strftime('%j', b.data_nascimento) - 1) || ' days')
          ELSE 
            date('now', 'start of year', '+1 year', '+' || (strftime('%j', b.data_nascimento) - 1) || ' days')
        END as proximo_aniversario
      FROM beneficiarios b
      INNER JOIN clientes c ON b.contrato_id = c.contrato_id
      WHERE b.status_beneficiario = 'ATIVO' 
      AND c.status_cliente = 'ATIVO'
      AND CAST(strftime('%m', b.data_nascimento) AS INTEGER) = ?
      ORDER BY strftime('%d', b.data_nascimento)
    `).bind(mes).all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ==================== ALERTAS APIs ====================

// Lista de alertas
app.get('/api/alertas', async (c) => {
  try {
    const { env } = c
    const status = c.req.query('status') || ''
    const tipo = c.req.query('tipo') || ''

    let query = `
      SELECT 
        a.*,
        c.cliente_nome,
        c.operadora,
        c.responsavel_comercial
      FROM alertas a
      INNER JOIN clientes c ON a.contrato_id = c.contrato_id
      WHERE 1=1
    `

    const params: any[] = []
    if (status) {
      query += ` AND a.status_alerta = ?`
      params.push(status)
    }
    if (tipo) {
      query += ` AND a.tipo_alerta = ?`
      params.push(tipo)
    }

    query += ` ORDER BY a.prioridade DESC, a.data_alerta DESC`

    const result = await env.DB.prepare(query).bind(...params).all()

    return c.json({
      success: true,
      data: result.results || []
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Resolver alerta
app.post('/api/alertas/:id/resolver', async (c) => {
  try {
    const { env } = c
    const alertaId = c.req.param('id')
    const { observacoes } = await c.req.json()

    await env.DB.prepare(`
      UPDATE alertas 
      SET status_alerta = 'RESOLVIDO',
          resolved_at = datetime('now'),
          observacoes = ?
      WHERE alerta_id = ?
    `).bind(observacoes || '', alertaId).run()

    return c.json({ success: true, message: 'Alerta resolvido com sucesso' })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// Default route - CRM Healthcare Interface
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CRM Healthcare - Sistema de Gestão de Benefícios</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            primary: '#1f2937',
                            secondary: '#3b82f6',
                            accent: '#10b981',
                            warning: '#f59e0b',
                            danger: '#ef4444'
                        }
                    }
                }
            }
        </script>
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100 font-sans">
        <!-- Navigation -->
        <nav class="bg-primary text-white shadow-lg sticky top-0 z-50">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center space-x-4">
                        <i class="fas fa-heartbeat text-2xl text-accent"></i>
                        <h1 class="text-xl font-bold">CRM Healthcare</h1>
                    </div>
                    
                    <div class="hidden md:flex space-x-6">
                        <a href="#dashboard" class="nav-link hover:text-blue-200 transition-colors">Dashboard</a>
                        <a href="#clientes" class="nav-link hover:text-blue-200 transition-colors">Clientes</a>
                        <a href="#reajustes" class="nav-link hover:text-blue-200 transition-colors">Reajustes</a>
                        <a href="#beneficiarios" class="nav-link hover:text-blue-200 transition-colors">Beneficiários</a>
                        <a href="#alertas" class="nav-link hover:text-blue-200 transition-colors">Alertas</a>
                    </div>
                    
                    <button id="mobile-menu-button" class="md:hidden">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>
                
                <div id="mobile-menu" class="hidden md:hidden pb-4">
                    <a href="#dashboard" class="block py-2 hover:text-blue-200 transition-colors">Dashboard</a>
                    <a href="#clientes" class="block py-2 hover:text-blue-200 transition-colors">Clientes</a>
                    <a href="#reajustes" class="block py-2 hover:text-blue-200 transition-colors">Reajustes</a>
                    <a href="#beneficiarios" class="block py-2 hover:text-blue-200 transition-colors">Beneficiários</a>
                    <a href="#alertas" class="block py-2 hover:text-blue-200 transition-colors">Alertas</a>
                </div>
            </div>
        </nav>

        <div class="container mx-auto px-4 py-8">
            <!-- Dashboard Section -->
            <section id="dashboard">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
                    <p class="text-gray-600">Visão geral do sistema de gestão de benefícios</p>
                </div>

                <!-- KPI Cards -->
                <div id="kpi-cards" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <!-- KPI cards will be rendered here -->
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div class="glass-card rounded-xl p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Distribuição de Clientes</h3>
                        <div class="relative h-64">
                            <canvas id="clientesChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="glass-card rounded-xl p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Faturamento por Categoria</h3>
                        <div class="relative h-64">
                            <canvas id="faturamentoChart"></canvas>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Clientes Section -->
            <section id="clientes" class="hidden">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Gestão de Clientes</h2>
                    <p class="text-gray-600">Controle completo da base de clientes</p>
                </div>

                <div class="glass-card rounded-xl p-6">
                    <div id="clientes-table">
                        <!-- Tabela será renderizada aqui -->
                    </div>
                </div>
            </section>

            <!-- Reajustes Section -->
            <section id="reajustes" class="hidden">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Gestão de Reajustes</h2>
                    <p class="text-gray-600">Controle de reajustes e comunicação proativa</p>
                </div>

                <!-- Tabs Navigation -->
                <div class="mb-6">
                    <div class="border-b border-gray-200">
                        <nav class="-mb-px flex space-x-8">
                            <button id="tab-reajustes-90" 
                                    class="reajustes-tab py-2 px-1 border-b-2 font-medium text-sm border-secondary text-secondary">
                                Próximos 90 dias
                            </button>
                            <button id="tab-operadoras" 
                                    class="reajustes-tab py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                                Por Operadora
                            </button>
                        </nav>
                    </div>
                </div>

                <!-- Tab Content -->
                <div id="tab-content-reajustes-90" class="tab-content">
                    <div class="glass-card rounded-xl p-6">
                        <div id="reajustes-90-table">
                            <!-- Tabela será renderizada aqui -->
                        </div>
                    </div>
                </div>

                <div id="tab-content-operadoras" class="tab-content hidden">
                    <div class="glass-card rounded-xl p-6">
                        <div id="operadoras-table">
                            <!-- Tabela será renderizada aqui -->
                        </div>
                    </div>
                </div>
            </section>

            <!-- Beneficiários Section -->
            <section id="beneficiarios" class="hidden">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Análise Demográfica</h2>
                    <p class="text-gray-600">Estatísticas e análises dos beneficiários</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div class="glass-card rounded-xl p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Distribuição por Gênero</h3>
                        <div class="relative h-48">
                            <canvas id="generoChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="glass-card rounded-xl p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Faixa Etária</h3>
                        <div class="relative h-48">
                            <canvas id="idadeChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="glass-card rounded-xl p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Parentesco</h3>
                        <div class="relative h-48">
                            <canvas id="parentescoChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="glass-card rounded-xl p-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">Aniversariantes do Mês</h3>
                    <div id="aniversariantes-table">
                        <!-- Tabela será renderizada aqui -->
                    </div>
                </div>
            </section>

            <!-- Alertas Section -->
            <section id="alertas" class="hidden">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Centro de Alertas</h2>
                    <p class="text-gray-600">Gerenciamento de alertas e notificações</p>
                </div>

                <div class="glass-card rounded-xl p-6">
                    <div id="alertas-table">
                        <!-- Tabela será renderizada aqui -->
                    </div>
                </div>
            </section>
        </div>

        <!-- Loading Overlay -->
        <div id="loading-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                <span class="text-gray-700">Carregando...</span>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app