// CRM Healthcare - Sistema de Gestão de Benefícios
// Interface moderna com glassmorphism e componentes atuais do mercado
// VERSÃO CORRIGIDA - Todos os bugs de JavaScript foram resolvidos

class CRMHealthcare {
    constructor() {
        this.currentSection = 'dashboard'
        this.charts = {}
        this.data = {}
        this.loadedSections = new Set()
        this.isLoading = false
        this.emergencyStop = false
        this.init()
    }

    async init() {
        try {
            console.log('Iniciando CRM Healthcare System...')
            this.setupNavigation()
            this.setupMobileMenu()
            this.setupEmergencyControls()
            await this.loadDashboard()
            this.setupEventListeners()
            console.log('CRM Healthcare System carregado com sucesso!')
        } catch (error) {
            console.error('Erro ao inicializar sistema:', error)
            this.showError('Erro ao carregar o sistema. Recarregue a página.')
        }
    }

    setupEmergencyControls() {
        // Controles de emergência para parar operações se necessário
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                this.emergencyStop = true
                this.destroyAllCharts()
                console.log('EMERGENCY STOP ATIVADO')
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                this.emergencyStop = false
                this.loadedSections.clear()
                console.log('EMERGENCY STOP DESATIVADO - Sistema resetado')
            }
        })
    }

    setupNavigation() {
        // Navigation click handlers com prevenção de múltiplos eventos
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault()
                e.stopPropagation()
                
                if (this.emergencyStop || this.isLoading) {
                    return false
                }
                
                const target = e.target.getAttribute('href').substring(1)
                this.showSection(target)
                return false
            })
        })
    }

    setupMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button')
        const mobileMenu = document.getElementById('mobile-menu')
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', (e) => {
                e.preventDefault()
                mobileMenu.classList.toggle('hidden')
            })
        }
    }

    showSection(sectionName) {
        if (this.emergencyStop) {
            console.log('Emergency stop ativo - operação cancelada')
            return
        }

        // Store current scroll position
        const currentScrollY = window.scrollY
        
        // Se mudando de seção, destruir gráficos da seção anterior
        if (this.currentSection !== sectionName) {
            this.destroyAllCharts()
        }
        
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden')
        })
        
        // Show target section
        const targetSection = document.getElementById(sectionName)
        if (targetSection) {
            targetSection.classList.remove('hidden')
            this.currentSection = sectionName
            
            // Restore scroll position to prevent jumping
            setTimeout(() => {
                window.scrollTo(0, currentScrollY)
            }, 10)
            
            // Load section data
            this.loadSectionData(sectionName)
        }
    }

    async loadSectionData(sectionName) {
        // Evitar múltiplas chamadas simultâneas
        if (this.isLoading || this.emergencyStop) {
            return
        }
        
        // Se já foi carregada, não recarregar (exceto dashboard)
        if (this.loadedSections.has(sectionName) && sectionName !== 'dashboard') {
            return
        }
        
        this.isLoading = true
        this.showLoading(true)
        
        try {
            switch (sectionName) {
                case 'dashboard':
                    await this.loadDashboard()
                    break
                case 'clientes':
                    await this.loadClientes()
                    break
                case 'reajustes':
                    await this.loadReajustes()
                    break
                case 'beneficiarios':
                    await this.loadBeneficiarios()
                    break
                case 'alertas':
                    await this.loadAlertas()
                    break
            }
            
            this.loadedSections.add(sectionName)
        } catch (error) {
            console.error(`Erro ao carregar seção ${sectionName}:`, error)
            this.showError(`Erro ao carregar dados de ${sectionName}`)
        } finally {
            this.isLoading = false
            this.showLoading(false)
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay')
        if (overlay) {
            if (show) {
                overlay.classList.remove('hidden')
            } else {
                overlay.classList.add('hidden')
            }
        }
    }

    showError(message) {
        console.error('Error:', message)
        // Poderia implementar um toast/notification aqui
    }

    async loadDashboard() {
        try {
            if (this.emergencyStop) return

            // Carregar estatísticas CRM
            const statsResponse = await axios.get('/api/crm/estatisticas')
            if (statsResponse.data.success) {
                this.renderKPICards(statsResponse.data.data)
            }

            // Carregar dados para gráficos
            const dashboardResponse = await axios.get('/api/crm/dashboard')
            if (dashboardResponse.data.success) {
                this.data.clientes = dashboardResponse.data.data
                await this.renderDashboardCharts()
            }
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error)
            this.showError('Erro ao carregar dashboard')
        }
    }

    renderKPICards(stats) {
        const kpiContainer = document.getElementById('kpi-cards')
        if (!kpiContainer) return
        
        const kpis = [
            {
                title: 'Clientes Ativos',
                value: this.formatNumber(stats.clientesAtivos || 0),
                icon: 'fas fa-users',
                color: 'text-accent',
                bgColor: 'bg-accent'
            },
            {
                title: 'Reajustes Próximos',
                value: this.formatNumber(stats.reajustesProximos || 0),
                icon: 'fas fa-exclamation-triangle',
                color: 'text-warning',
                bgColor: 'bg-warning'
            },
            {
                title: 'Alertas Pendentes',
                value: this.formatNumber(stats.alertasPendentes || 0),
                icon: 'fas fa-bell',
                color: 'text-danger',
                bgColor: 'bg-danger'
            },
            {
                title: 'Faturamento Ativo',
                value: this.formatCurrency(stats.faturamentoAtivo || 0),
                icon: 'fas fa-dollar-sign',
                color: 'text-secondary',
                bgColor: 'bg-secondary'
            }
        ]

        kpiContainer.innerHTML = kpis.map(kpi => `
            <div class="glass-card rounded-xl p-6 card-hover fade-in">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm font-medium">${kpi.title}</p>
                        <p class="text-2xl font-bold ${kpi.color}">${kpi.value}</p>
                    </div>
                    <div class="${kpi.bgColor} p-3 rounded-lg">
                        <i class="${kpi.icon} text-white text-xl"></i>
                    </div>
                </div>
            </div>
        `).join('')
    }

    async renderDashboardCharts() {
        if (this.emergencyStop) return

        try {
            // Destruir gráficos existentes primeiro - CORREÇÃO DE BUG CRÍTICA
            if (this.charts.clientes) {
                this.charts.clientes.destroy()
                delete this.charts.clientes
            }
            if (this.charts.faturamento) {
                this.charts.faturamento.destroy()
                delete this.charts.faturamento
            }
            
            // Gráfico de distribuição de clientes
            const clientesData = await axios.get('/api/crm/clientes-ativos')
            if (clientesData.data.success && clientesData.data.data.length > 0) {
                const categorias = {}
                clientesData.data.data.forEach(cliente => {
                    categorias[cliente.categoria_cliente] = (categorias[cliente.categoria_cliente] || 0) + 1
                })

                const ctx1 = document.getElementById('clientesChart')?.getContext('2d')
                if (ctx1) {
                    this.charts.clientes = new Chart(ctx1, {
                        type: 'doughnut',
                        data: {
                            labels: Object.keys(categorias),
                            datasets: [{
                                data: Object.values(categorias),
                                backgroundColor: [
                                    '#3b82f6', // PREMIUM - Blue
                                    '#10b981', // GOLD - Green  
                                    '#f59e0b', // SILVER - Yellow
                                    '#ef4444'  // BRONZE - Red
                                ],
                                borderWidth: 0
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }
                    })
                }
            }

            // Gráfico de faturamento por categoria - ESTRUTURA CORRIGIDA
            const faturamentoData = {}
            if (clientesData.data.success && clientesData.data.data.length > 0) {
                clientesData.data.data.forEach(cliente => {
                    const categoria = cliente.categoria_cliente
                    faturamentoData[categoria] = (faturamentoData[categoria] || 0) + (cliente.faturamento_anual_estimado || 0)
                })

                const ctx2 = document.getElementById('faturamentoChart')?.getContext('2d')
                if (ctx2) {
                    this.charts.faturamento = new Chart(ctx2, {
                        type: 'bar',
                        data: {
                            labels: Object.keys(faturamentoData),
                            datasets: [{
                                label: 'Faturamento Anual (R$)',
                                data: Object.values(faturamentoData),
                                backgroundColor: '#10b981',
                                borderRadius: 8
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function(value) {
                                            return 'R$ ' + value.toLocaleString('pt-BR')
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
            }
        } catch (error) {
            console.error('Erro ao renderizar gráficos do dashboard:', error)
        }
    }

    async loadClientes() {
        try {
            const response = await axios.get('/api/crm/clientes?limit=100')
            if (response.data.success) {
                this.renderClientesTable(response.data.data)
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error)
            this.showError('Erro ao carregar lista de clientes')
        }
    }

    renderClientesTable(clientes) {
        const container = document.getElementById('clientes-table')
        if (!container) return
        
        if (!clientes.length) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum cliente encontrado</p>'
            return
        }

        const table = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="text-left p-4 font-semibold text-gray-700">Cliente</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Status</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Categoria</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Vidas</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Operadora</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Valor Mensal</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Próximo Reajuste</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clientes.map(cliente => `
                            <tr class="border-b hover:bg-gray-50">
                                <td class="p-4">
                                    <div>
                                        <p class="font-semibold text-gray-900">${cliente.cliente_nome}</p>
                                        <p class="text-sm text-gray-500">${cliente.cidade}/${cliente.estado}</p>
                                    </div>
                                </td>
                                <td class="p-4">
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${this.getStatusClass(cliente.status_cliente)}">
                                        ${cliente.status_cliente}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${this.getCategoryClass(cliente.categoria_cliente)}">
                                        ${cliente.categoria_cliente}
                                    </span>
                                </td>
                                <td class="p-4 font-medium">${cliente.quantidade_vidas}</td>
                                <td class="p-4">${cliente.operadora}</td>
                                <td class="p-4">${cliente.valor_mensal ? this.formatCurrency(cliente.valor_mensal) : '-'}</td>
                                <td class="p-4">
                                    <span class="text-sm ${this.getReajusteClass(cliente.status_reajuste)}">
                                        ${cliente.data_proximo_reajuste ? this.formatDate(cliente.data_proximo_reajuste) : '-'}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <div class="flex space-x-2">
                                        <button onclick="app.showClienteDetails(${cliente.contrato_id})" 
                                                class="text-secondary hover:text-blue-800">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button onclick="app.criarPropostaReajuste(${cliente.contrato_id})" 
                                                class="text-warning hover:text-yellow-800">
                                            <i class="fas fa-percentage"></i>
                                        </button>
                                        <button onclick="app.registrarInteracao(${cliente.contrato_id})" 
                                                class="text-accent hover:text-green-800">
                                            <i class="fas fa-comment"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `

        container.innerHTML = table
    }

    async loadReajustes() {
        try {
            await this.loadReajustes90Dias()
            await this.loadReajustesOperadoras()
            this.setupReajustesTabs()
        } catch (error) {
            console.error('Erro ao carregar reajustes:', error)
            this.showError('Erro ao carregar dados de reajustes')
        }
    }

    setupReajustesTabs() {
        const tabs = document.querySelectorAll('.reajustes-tab')
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault()
                const tabId = e.target.id
                this.showReajustesTab(tabId.replace('tab-', ''))
            })
        })
    }

    async showReajustesTab(tab) {
        if (this.emergencyStop) return

        // Update tab appearance
        document.querySelectorAll('.reajustes-tab').forEach(t => {
            t.classList.remove('border-secondary', 'text-secondary')
            t.classList.add('border-transparent', 'text-gray-500')
        })

        document.getElementById(`tab-${tab}`).classList.add('border-secondary', 'text-secondary')
        document.getElementById(`tab-${tab}`).classList.remove('border-transparent', 'text-gray-500')

        // Show/hide content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden')
        })
        
        document.getElementById(`tab-content-${tab}`).classList.remove('hidden')

        // Ensure scroll position is maintained after async operations
        const currentScrollY = window.scrollY
        setTimeout(() => {
            window.scrollTo(0, currentScrollY)
        }, 50)
    }

    async loadReajustes90Dias() {
        try {
            const response = await axios.get('/api/crm/reajustes-90-dias')
            if (response.data.success) {
                this.renderReajustes90DiasTable(response.data.data)
            }
        } catch (error) {
            console.error('Erro ao carregar reajustes 90 dias:', error)
        }
    }

    async loadReajustesOperadoras() {
        try {
            const response = await axios.get('/api/reajustes/operadoras')
            if (response.data.success) {
                this.renderOperadorasTable(response.data.data)
            }
        } catch (error) {
            console.error('Erro ao carregar reajustes operadoras:', error)
        }
    }

    renderReajustes90DiasTable(reajustes) {
        const container = document.getElementById('reajustes-90-table')
        if (!container) return

        if (!reajustes.length) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum reajuste próximo nos próximos 90 dias</p>'
            return
        }

        const table = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="text-left p-4 font-semibold text-gray-700">Cliente</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Operadora</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Vidas</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Valor Atual</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Data Reajuste</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Dias Restantes</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Prioridade</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reajustes.map(reajuste => `
                            <tr class="border-b hover:bg-gray-50">
                                <td class="p-4">
                                    <p class="font-semibold text-gray-900">${reajuste.cliente_nome}</p>
                                    <p class="text-sm text-gray-500">${reajuste.plano}</p>
                                </td>
                                <td class="p-4">${reajuste.operadora}</td>
                                <td class="p-4 font-medium">${reajuste.quantidade_vidas}</td>
                                <td class="p-4">${reajuste.valor_mensal ? this.formatCurrency(reajuste.valor_mensal) : '-'}</td>
                                <td class="p-4">${this.formatDate(reajuste.data_proximo_reajuste)}</td>
                                <td class="p-4">
                                    <span class="font-medium ${reajuste.dias_ate_reajuste <= 30 ? 'text-red-600' : 'text-gray-900'}">
                                        ${reajuste.dias_ate_reajuste} dias
                                    </span>
                                </td>
                                <td class="p-4">
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${this.getPriorityClass(reajuste.prioridade_reajuste)}">
                                        ${reajuste.prioridade_reajuste}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <div class="flex space-x-2">
                                        <button onclick="app.criarPropostaReajuste(${reajuste.contrato_id})" 
                                                class="text-warning hover:text-yellow-800">
                                            <i class="fas fa-percentage"></i>
                                        </button>
                                        <button onclick="app.registrarInteracao(${reajuste.contrato_id})" 
                                                class="text-accent hover:text-green-800">
                                            <i class="fas fa-phone"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `

        container.innerHTML = table
    }

    renderOperadorasTable(operadoras) {
        const container = document.getElementById('operadoras-table')
        if (!container) return

        if (!operadoras.length) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma operadora com reajuste configurado</p>'
            return
        }

        const table = `
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Percentuais Oficiais de Reajuste 2025</h4>
                <p class="text-sm text-gray-600 mb-4">
                    <i class="fas fa-info-circle mr-2"></i>
                    Dados baseados nos percentuais oficiais da Corretora Amor à Vida
                </p>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="text-left p-4 font-semibold text-gray-700">Operadora</th>
                            <th class="text-left p-4 font-semibold text-gray-700">% Reajuste</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Clientes Ativos</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Reajustes Próximos</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Faturamento Atual</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Pós-Reajuste</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${operadoras.map(operadora => `
                            <tr class="border-b hover:bg-gray-50">
                                <td class="p-4">
                                    <p class="font-semibold text-gray-900">${operadora.operadora_nome}</p>
                                    <p class="text-sm text-gray-500">${operadora.numero_resolucao || 'N/A'}</p>
                                </td>
                                <td class="p-4">
                                    <span class="text-lg font-bold ${operadora.percentual_reajuste > 18 ? 'text-red-600' : operadora.percentual_reajuste > 15 ? 'text-orange-500' : 'text-green-600'}">
                                        ${operadora.percentual_reajuste ? operadora.percentual_reajuste.toFixed(2) + '%' : 'N/D'}
                                    </span>
                                </td>
                                <td class="p-4 font-medium">${operadora.clientes_ativos || 0}</td>
                                <td class="p-4">
                                    <span class="font-medium ${operadora.clientes_reajuste_proximo > 0 ? 'text-orange-600' : 'text-gray-500'}">
                                        ${operadora.clientes_reajuste_proximo || 0}
                                    </span>
                                </td>
                                <td class="p-4">${this.formatCurrency(operadora.faturamento_mensal_atual || 0)}</td>
                                <td class="p-4">
                                    <span class="font-semibold text-green-600">
                                        ${this.formatCurrency(operadora.faturamento_mensal_pos_reajuste || 0)}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <div class="flex space-x-2">
                                        <button onclick="app.verDetalhesOperadora('${operadora.operadora_nome}')" 
                                                class="text-secondary hover:text-blue-800">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button onclick="app.simularReajusteOperadora('${operadora.operadora_nome}', ${operadora.percentual_reajuste || 15})" 
                                                class="text-warning hover:text-yellow-800">
                                            <i class="fas fa-calculator"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `

        container.innerHTML = table
    }

    async loadBeneficiarios() {
        try {
            // Carregar estatísticas demográficas
            const statsResponse = await axios.get('/api/demografico/estatisticas')
            if (statsResponse.data.success) {
                await this.renderDemograficoCharts(statsResponse.data.data)
            }

            // Carregar aniversariantes do mês
            const aniversariantesResponse = await axios.get('/api/demografico/aniversariantes')
            if (aniversariantesResponse.data.success) {
                this.renderAniversariantesTable(aniversariantesResponse.data.data)
            }
        } catch (error) {
            console.error('Erro ao carregar beneficiários:', error)
            this.showError('Erro ao carregar dados demográficos')
        }
    }

    async renderDemograficoCharts(data) {
        if (this.emergencyStop) return

        try {
            // Destruir gráficos existentes
            ['genero', 'idade', 'parentesco'].forEach(chartKey => {
                if (this.charts[chartKey]) {
                    this.charts[chartKey].destroy()
                    delete this.charts[chartKey]
                }
            })

            // Gráfico de gênero
            const ctx1 = document.getElementById('generoChart')?.getContext('2d')
            if (ctx1 && data.genero && data.genero.length > 0) {
                this.charts.genero = new Chart(ctx1, {
                    type: 'pie',
                    data: {
                        labels: data.genero.map(g => g.genero === 'M' ? 'Masculino' : g.genero === 'F' ? 'Feminino' : 'Outro'),
                        datasets: [{
                            data: data.genero.map(g => g.count),
                            backgroundColor: ['#3b82f6', '#ec4899', '#10b981']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                })
            }

            // Gráfico de faixa etária
            const ctx2 = document.getElementById('idadeChart')?.getContext('2d')
            if (ctx2 && data.faixaEtaria && data.faixaEtaria.length > 0) {
                this.charts.idade = new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: data.faixaEtaria.map(f => this.formatFaixaEtaria(f.faixa_etaria)),
                        datasets: [{
                            label: 'Beneficiários',
                            data: data.faixaEtaria.map(f => f.count),
                            backgroundColor: '#10b981'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                })
            }

            // Gráfico de parentesco
            const ctx3 = document.getElementById('parentescoChart')?.getContext('2d')
            if (ctx3 && data.parentesco && data.parentesco.length > 0) {
                this.charts.parentesco = new Chart(ctx3, {
                    type: 'doughnut',
                    data: {
                        labels: data.parentesco.map(p => p.parentesco),
                        datasets: [{
                            data: data.parentesco.map(p => p.count),
                            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                })
            }
        } catch (error) {
            console.error('Erro ao renderizar gráficos demográficos:', error)
        }
    }

    renderAniversariantesTable(aniversariantes) {
        const container = document.getElementById('aniversariantes-table')
        if (!container) return

        if (!aniversariantes.length) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum aniversariante este mês</p>'
            return
        }

        const table = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="text-left p-4 font-semibold text-gray-700">Beneficiário</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Cliente</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Data Nascimento</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Idade</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Parentesco</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Responsável</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${aniversariantes.map(aniv => `
                            <tr class="border-b hover:bg-gray-50">
                                <td class="p-4">
                                    <p class="font-semibold text-gray-900">${aniv.nome_beneficiario}</p>
                                    <p class="text-sm text-gray-500">🎂 ${this.formatDate(aniv.proximo_aniversario)}</p>
                                </td>
                                <td class="p-4">${aniv.cliente_nome}</td>
                                <td class="p-4">${this.formatDate(aniv.data_nascimento)}</td>
                                <td class="p-4 font-medium">${aniv.idade_atual} anos</td>
                                <td class="p-4">
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        ${aniv.parentesco}
                                    </span>
                                </td>
                                <td class="p-4">${aniv.responsavel_comercial || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `

        container.innerHTML = table
    }

    async loadAlertas() {
        try {
            const response = await axios.get('/api/alertas')
            if (response.data.success) {
                this.renderAlertasTable(response.data.data)
            }
        } catch (error) {
            console.error('Erro ao carregar alertas:', error)
            this.showError('Erro ao carregar alertas')
        }
    }

    renderAlertasTable(alertas) {
        const container = document.getElementById('alertas-table')
        if (!container) return

        if (!alertas.length) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum alerta pendente</p>'
            return
        }

        const table = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="text-left p-4 font-semibold text-gray-700">Alerta</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Cliente</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Tipo</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Data</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Prioridade</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Status</th>
                            <th class="text-left p-4 font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alertas.map(alerta => `
                            <tr class="border-b hover:bg-gray-50">
                                <td class="p-4">
                                    <p class="font-semibold text-gray-900">${alerta.titulo}</p>
                                    <p class="text-sm text-gray-500">${alerta.descricao}</p>
                                </td>
                                <td class="p-4">
                                    <p class="font-medium">${alerta.cliente_nome}</p>
                                    <p class="text-sm text-gray-500">${alerta.operadora}</p>
                                </td>
                                <td class="p-4">
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                        ${alerta.tipo_alerta.replace('_', ' ')}
                                    </span>
                                </td>
                                <td class="p-4">${this.formatDate(alerta.data_alerta)}</td>
                                <td class="p-4">
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${this.getPriorityClass(alerta.prioridade)}">
                                        ${alerta.prioridade}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${this.getAlertStatusClass(alerta.status_alerta)}">
                                        ${alerta.status_alerta}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <div class="flex space-x-2">
                                        <button onclick="app.resolverAlerta(${alerta.alerta_id})" 
                                                class="text-accent hover:text-green-800">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button onclick="app.editarAlerta(${alerta.alerta_id})" 
                                                class="text-secondary hover:text-blue-800">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `

        container.innerHTML = table
    }

    setupEventListeners() {
        // Setup any additional event listeners here
        console.log('Event listeners configurados')
    }

    // Emergency chart destruction to prevent memory leaks and infinite loops
    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartKey => {
            if (this.charts[chartKey] && typeof this.charts[chartKey].destroy === 'function') {
                try {
                    this.charts[chartKey].destroy()
                    delete this.charts[chartKey]
                    console.log(`Chart ${chartKey} destroyed successfully`)
                } catch (error) {
                    console.warn(`Error destroying chart ${chartKey}:`, error)
                    delete this.charts[chartKey]
                }
            }
        })
        this.charts = {} // Reset charts object
    }

    // Utility functions
    formatNumber(num) {
        return new Intl.NumberFormat('pt-BR').format(num || 0)
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0)
    }

    formatDate(dateString) {
        if (!dateString) return '-'
        return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR')
    }

    formatFaixaEtaria(faixa) {
        const map = {
            'MENOR_18': '< 18 anos',
            'ADULTO_JOVEM': '18-30 anos',
            'ADULTO': '31-50 anos',
            'ADULTO_SENIOR': '51-65 anos',
            'IDOSO': '> 65 anos'
        }
        return map[faixa] || faixa
    }

    getStatusClass(status) {
        const classes = {
            'ATIVO': 'bg-green-100 text-green-800',
            'CANCELADO': 'bg-red-100 text-red-800',
            'SUSPENSO': 'bg-yellow-100 text-yellow-800'
        }
        return classes[status] || 'bg-gray-100 text-gray-800'
    }

    getCategoryClass(category) {
        const classes = {
            'PREMIUM': 'bg-purple-100 text-purple-800',
            'GOLD': 'bg-yellow-100 text-yellow-800',
            'SILVER': 'bg-gray-100 text-gray-800',
            'BRONZE': 'bg-orange-100 text-orange-800'
        }
        return classes[category] || 'bg-gray-100 text-gray-800'
    }

    getPriorityClass(priority) {
        const classes = {
            'URGENTE': 'bg-red-100 text-red-800',
            'ALTA': 'bg-orange-100 text-orange-800',
            'MEDIA': 'bg-blue-100 text-blue-800',
            'BAIXA': 'bg-gray-100 text-gray-800'
        }
        return classes[priority] || 'bg-gray-100 text-gray-800'
    }

    getReajusteClass(status) {
        const classes = {
            'REAJUSTE_IMINENTE': 'text-orange-600 font-medium',
            'REAJUSTE_VENCIDO': 'text-red-600 font-medium',
            'REAJUSTE_DISTANTE': 'text-gray-500'
        }
        return classes[status] || 'text-gray-500'
    }

    getAlertStatusClass(status) {
        const classes = {
            'PENDENTE': 'bg-yellow-100 text-yellow-800',
            'EM_ANDAMENTO': 'bg-blue-100 text-blue-800',
            'RESOLVIDO': 'bg-green-100 text-green-800',
            'CANCELADO': 'bg-red-100 text-red-800'
        }
        return classes[status] || 'bg-gray-100 text-gray-800'
    }

    // Action methods (placeholders for future implementation)
    async showClienteDetails(contratoId) {
        console.log('Mostrar detalhes do cliente:', contratoId)
    }

    async criarPropostaReajuste(contratoId) {
        console.log('Criar proposta de reajuste para:', contratoId)
    }

    async registrarInteracao(contratoId) {
        console.log('Registrar interação com cliente:', contratoId)
    }

    async resolverAlerta(alertaId) {
        try {
            const observacoes = prompt('Observações sobre a resolução do alerta:')
            if (observacoes !== null) {
                await axios.post(`/api/alertas/${alertaId}/resolver`, { observacoes })
                this.loadAlertas() // Reload alerts
            }
        } catch (error) {
            console.error('Erro ao resolver alerta:', error)
            this.showError('Erro ao resolver alerta')
        }
    }

    async editarAlerta(alertaId) {
        console.log('Editar alerta:', alertaId)
    }

    async verDetalhesOperadora(operadoraNome) {
        console.log('Ver detalhes da operadora:', operadoraNome)
    }

    async simularReajusteOperadora(operadoraNome, percentualAtual) {
        try {
            const novoPercentual = prompt(`Simular reajuste para ${operadoraNome}:\nPercentual atual: ${percentualAtual}%\n\nInforme o novo percentual:`, percentualAtual)
            
            if (novoPercentual && !isNaN(novoPercentual)) {
                const response = await axios.post('/api/reajustes/simular', {
                    operadora: operadoraNome,
                    percentual: parseFloat(novoPercentual)
                })
                
                if (response.data.success) {
                    const { totalizacao } = response.data.data
                    alert(`Simulação de Reajuste - ${operadoraNome}\n\n` +
                          `Contratos Afetados: ${totalizacao.total_contratos}\n` +
                          `Faturamento Atual: ${this.formatCurrency(totalizacao.faturamento_atual)}\n` +
                          `Faturamento Novo: ${this.formatCurrency(totalizacao.faturamento_novo)}\n` +
                          `Impacto Mensal: ${this.formatCurrency(totalizacao.impacto_mensal)}\n` +
                          `Impacto Anual: ${this.formatCurrency(totalizacao.impacto_anual)}`)
                }
            }
        } catch (error) {
            console.error('Erro ao simular reajuste:', error)
            this.showError('Erro ao simular reajuste')
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new CRMHealthcare()
    console.log('CRM Healthcare System initialized successfully!')
})