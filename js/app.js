document.addEventListener('DOMContentLoaded', () => {
    // Categorias
    const categories = {
        expense: [
            'Acessórios para casa',
            'Água',
            'Alimentação',
            'Aluguel',
            'Assinaturas (streamings)',
            'Condomínio',
            'Compras de roupas',
            'Compras online',
            'Energia',
            'Farmácia',
            'Financiamentos',
            'Faturas (cartão, celular, assinaturas, empréstimos)',
            'Gás',
            'Internet',
            'IPTU',
            'Lazer',
            'Lanches (delivery)',
            'Mensalidades (faculdade, academia)',
            'Plano de saúde',
            'Restaurantes',
            'Saúde',
            'Seguros',
            'Tarifas bancárias',
            'Transporte',
            'Viagens',
            'Outros'
        ],
        income: [
            'Salário',
            'Freelance',
            'Investimentos',
            'Bolsa Família',
            'Aposentadoria',
            'Pensão',
            'Aluguel recebido',
            'Bônus',
            'Comissões',
            'Presente',
            'Outras receitas'
        ]
    };

    // DOM Elements
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const menuItems = document.querySelectorAll('.menu-item');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeToggleIcon = themeToggle.querySelector('i:last-child');
    const body = document.body;
    const contentSections = document.querySelectorAll('.content-section');
    
    // Transaction Elements
    const transactionModalForm = document.getElementById('transactionModalForm');
    const modalDateInput = document.getElementById('modalDate');
    const modalItemInput = document.getElementById('modalItem');
    const modalAmountInput = document.getElementById('modalAmount');
    const modalTypeInput = document.getElementById('modalType');
    const modalCategoryInput = document.getElementById('modalCategory');
    const modalPaymentMethodInput = document.getElementById('modalPaymentMethod');
    
    // Balance Elements
    const remainingBalancePix = document.getElementById('remainingBalancePix');
    const remainingBalanceCash = document.getElementById('remainingBalanceCash');
    const remainingBalanceCard = document.getElementById('remainingBalanceCard');
    
    // Settings Elements
    const saveSettingsBtn = document.getElementById('saveSettings');
    const saveUserSettingsBtn = document.getElementById('saveUserSettings');
    
    // Goals Elements
    const addGoalBtn = document.getElementById('addGoalBtn');
    const goalNameInput = document.getElementById('goalName');
    const goalTargetInput = document.getElementById('goalTarget');
    const goalDateInput = document.getElementById('goalDate');
    const goalImageInput = document.getElementById('goalImage');
    const goalImagePreview = document.getElementById('goalImagePreview');
    
    // Modal Elements
    const transactionModal = document.getElementById('transactionModal');
    const goalModal = document.getElementById('goalModal');
    const editModal = document.getElementById('editModal');
    const confirmModal = document.getElementById('confirmModal');
    const scheduledPaymentModal = document.getElementById('scheduledPaymentModal');
    const saveTransactionBtn = document.getElementById('saveTransaction');
    const cancelTransactionBtn = document.getElementById('cancelTransaction');
    const saveGoalBtn = document.getElementById('saveGoal');
    const cancelGoalBtn = document.getElementById('cancelGoal');
    const addScheduledPaymentBtn = document.getElementById('addScheduledPaymentBtn');
    const saveScheduledPaymentBtn = document.getElementById('saveScheduledPayment');
    const cancelScheduledPaymentBtn = document.getElementById('cancelScheduledPayment');
    const scheduledPaymentForm = document.getElementById('scheduledPaymentForm');
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    
    // Alert Modal Elements
    const alertModal = document.getElementById('alertModal');
    const alertMessage = document.getElementById('alertMessage');
    const confirmAlert = document.getElementById('confirmAlert');
    
    // Charts
    const expensesChartCtx = document.getElementById('expensesChart').getContext('2d');
    const incomeVsExpensesChartCtx = document.getElementById('incomeVsExpensesChart').getContext('2d');
    const paymentMethodsChartCtx = document.getElementById('paymentMethodsChart').getContext('2d');
    
    let expensesChart, incomeVsExpensesChart, paymentMethodsChart;
    
    // Data
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let goals = JSON.parse(localStorage.getItem('goals')) || [];
    
    // Migrar metas antigas para o novo formato
    if (goals.length > 0 && !goals[0].hasOwnProperty('current')) {
        goals = goals.map(goal => ({
            ...goal,
            current: 0,
            monthlyContribution: 0,
            contributions: [],
            type: 'other',
            completed: false
        }));
        saveGoals();
    }
    
    let upcomingBills = JSON.parse(localStorage.getItem('upcomingBills')) || [];
    let initialBalances = JSON.parse(localStorage.getItem('initialBalances')) || {
        pix: 0,
        cash: 0,
        card: 0
    };
    let userName = localStorage.getItem('userName') || 'João Silva';
    let userEmail = localStorage.getItem('userEmail') || 'joao@exemplo.com';
    let currency = localStorage.getItem('currency') || 'BRL';
    let selectedThemeColor = localStorage.getItem('themeColor') || 'masculine-1';
    let currentEditIndex = null;

    // Initialize
    function init() {
        // Set current date as default
        const today = new Date().toISOString().split('T')[0];
        modalDateInput.value = today;
        goalDateInput.value = today;
        document.getElementById('scheduledDate').value = today;
        
        // Load user settings
        document.getElementById('userName').value = userName;
        document.getElementById('userEmail').value = userEmail;
        document.getElementById('currency').value = currency;
        
        // Update user profile in sidebar
        document.querySelector('.user-name').textContent = userName;
        document.querySelector('.user-email').textContent = userEmail;
        
        // Setup category dropdowns
        updateCategoryDropdowns();
        
        // Load data
        updateBalanceDisplay();
        updateBalanceDisplays();
        renderTransactionHistory();
        renderAllTransactions();
        updateCharts();
        renderGoals();
        renderUpcomingBills();
        
        // Verificar pagamentos agendados
        checkScheduledPayments();
        
        // Check empty state
        checkEmptyState();
        
        // Setup event listeners
        setupEventListeners();
        
        // Apply selected theme color
        applyThemeColor();
        
        // Show dashboard by default
        showSection('dashboard');
        
        // Alert modal event listener
        confirmAlert.addEventListener('click', () => {
            alertModal.classList.remove('active');
        });

        checkGoalsProgress();
        setInterval(checkGoalsProgress, 86400000); // 24 horas

        // Atualizar resumo de metas
        updateGoalsSummary();
    }
    
    // Setup Event Listeners
    function setupEventListeners() {
        // Menu Toggle
        menuToggle.addEventListener('click', toggleSidebar);
        closeSidebar.addEventListener('click', toggleSidebar);
        
        // Menu Items
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                showSection(section);
                toggleSidebar();
            });
        });
        
        // Theme Toggle
        themeToggle.addEventListener('click', toggleTheme);
        
        // Transaction Modal Form
        saveTransactionBtn.addEventListener('click', addTransactionFromModal);
        cancelTransactionBtn.addEventListener('click', () => closeModal(transactionModal));
        modalTypeInput.addEventListener('change', () => updateCategoryDropdowns());
        
        // Goal Modal
        if (addGoalBtn) addGoalBtn.addEventListener('click', openAddGoalModal);
        if (saveGoalBtn) saveGoalBtn.addEventListener('click', saveGoal);
        if (cancelGoalBtn) cancelGoalBtn.addEventListener('click', () => closeModal(goalModal));
        
        // Image preview for goal
        if (goalImageInput) {
            goalImageInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        goalImagePreview.src = event.target.result;
                        goalImagePreview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Theme color selection
        document.querySelectorAll('.theme-color-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.theme-color-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        
        // Settings
        if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);
        if (saveUserSettingsBtn) saveUserSettingsBtn.addEventListener('click', saveUserSettings);
        
        // Balance method buttons
        document.querySelectorAll('.balance-method-btn').forEach(btn => {
            btn.addEventListener('click', handleBalanceAction);
        });
        
        // Scheduled Payments
        if (addScheduledPaymentBtn) addScheduledPaymentBtn.addEventListener('click', openScheduledPaymentModal);
        if (saveScheduledPaymentBtn) saveScheduledPaymentBtn.addEventListener('click', saveScheduledPayment);
        if (cancelScheduledPaymentBtn) cancelScheduledPaymentBtn.addEventListener('click', () => closeModal(scheduledPaymentModal));
        
        // Floating action button
        document.getElementById('addTransactionBtn').addEventListener('click', openAddTransactionModal);
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });
        
        // Close modals with close buttons
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal-overlay');
                closeModal(modal);
            });
        });

        // Filter events
        document.getElementById('filterType2').addEventListener('change', filterTransactions);
        document.getElementById('filterCategory2').addEventListener('change', filterTransactions);
        document.getElementById('filterPayment2').addEventListener('change', filterTransactions);
        document.getElementById('searchInput2').addEventListener('input', filterTransactions);
        document.getElementById('clearFilters2').addEventListener('click', clearFilters);
        
        // Edit and Delete handlers
        document.getElementById('confirmDelete').addEventListener('click', confirmDeleteTransaction);
        document.getElementById('cancelDelete').addEventListener('click', () => closeModal(confirmModal));
        document.getElementById('saveEdit').addEventListener('click', saveEditedTransaction);
        document.getElementById('cancelEdit').addEventListener('click', () => closeModal(editModal));
        
        // Event delegation for goal actions
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('edit-goal') || e.target.closest('.edit-goal')) {
                const goalItem = e.target.closest('.goal-item');
                const goalId = parseInt(goalItem.dataset.id);
                const goalIndex = goals.findIndex(g => g.id === goalId);
                if (goalIndex !== -1) {
                    openEditGoalModal(goalIndex);
                }
            }
            
            if (e.target.classList.contains('delete-goal') || e.target.closest('.delete-goal')) {
                const goalItem = e.target.closest('.goal-item');
                const goalId = parseInt(goalItem.dataset.id);
                const goalIndex = goals.findIndex(g => g.id === goalId);
                if (goalIndex !== -1) {
                    deleteGoal(goalIndex);
                }
            }
            
            if (e.target.classList.contains('complete-goal-btn') || e.target.closest('.complete-goal-btn')) {
                const goalItem = e.target.closest('.goal-item');
                const goalId = parseInt(goalItem.dataset.id);
                completeGoal(goalId);
            }
        });
    }
    
    // Função para mostrar alertas em modal
    async function showAlert(message) {
        alertMessage.textContent = message;
        alertModal.classList.add('active');
        
        return new Promise((resolve) => {
            const handler = () => {
                alertModal.classList.remove('active');
                confirmAlert.removeEventListener('click', handler);
                resolve();
            };
            confirmAlert.addEventListener('click', handler);
        });
    }
    
    // Função para mostrar confirmações em modal
    async function showConfirmModal(message) {
        alertMessage.textContent = message;
        alertModal.classList.add('active');
        
        return new Promise((resolve) => {
            const handler = () => {
                alertModal.classList.remove('active');
                confirmAlert.removeEventListener('click', handler);
                resolve(true);
            };
            const cancelHandler = () => {
                alertModal.classList.remove('active');
                document.querySelector('#alertModal .modal-close').removeEventListener('click', cancelHandler);
                resolve(false);
            };
            confirmAlert.addEventListener('click', handler);
            document.querySelector('#alertModal .modal-close').addEventListener('click', cancelHandler);
        });
    }
    
    // Verificar pagamentos agendados
    function checkScheduledPayments() {
        const today = new Date().toISOString().split('T')[0];
        let needsUpdate = false;
        
        upcomingBills.forEach((bill, index) => {
            if (bill.date <= today && !bill.paid) {
                if (bill.autoDebit) {
                    // Processar débito automático
                    processScheduledPayment(index);
                    needsUpdate = true;
                } else if (!bill.pending) {
                    // Marcar como pendente de confirmação
                    upcomingBills[index].pending = true;
                    needsUpdate = true;
                }
            }
        });
        
        if (needsUpdate) {
            saveUpcomingBills();
            renderUpcomingBills();
        }
    }
    
    // Processar pagamento agendado
    async function processScheduledPayment(index) {
        const bill = upcomingBills[index];
        
        // Verificar saldo
        const { currentPix, currentCash, currentCard } = calculateCurrentBalances();
        let hasBalance = true;
        
        if (bill.paymentMethod === 'pix' && bill.amount > currentPix) {
            hasBalance = false;
        } else if (bill.paymentMethod === 'cash' && bill.amount > currentCash) {
            hasBalance = false;
        } else if (bill.paymentMethod === 'card' && bill.amount > currentCard) {
            hasBalance = false;
        }
        
        if (hasBalance) {
            // Adicionar transação
            const transaction = {
                id: Date.now(),
                date: bill.date,
                item: bill.name,
                amount: bill.amount,
                type: 'expense',
                category: 'Faturas (cartão, celular, assinaturas, empréstimos)',
                paymentMethod: bill.paymentMethod,
                isScheduled: true
            };
            
            transactions.push(transaction);
            upcomingBills[index].paid = true;
            upcomingBills[index].processedDate = new Date().toISOString().split('T')[0];
            upcomingBills[index].pending = false;
            upcomingBills[index].insufficientBalance = false;
            
            saveTransactions();
            saveUpcomingBills();
            renderTransactionHistory();
            renderAllTransactions();
            updateBalanceDisplay();
            updateCharts();
        } else {
            // Saldo insuficiente - marcar como pendente
            upcomingBills[index].pending = true;
            upcomingBills[index].insufficientBalance = true;
            saveUpcomingBills();
        }
        
        renderUpcomingBills();
    }
    
    // Confirmar pagamento manual
    async function payScheduledBill(index) {
        await processScheduledPayment(index);
    }
    
    // Abrir modal de pagamento agendado
    function openScheduledPaymentModal() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('scheduledDate').value = today;
        scheduledPaymentForm.reset();
        scheduledPaymentModal.classList.add('active');
    }
    
    // Salvar pagamento agendado
    async function saveScheduledPayment(e) {
        e.preventDefault();
        
        const name = document.getElementById('scheduledItem').value.trim() || 'Pagamento de Fatura';
        const amount = parseFloat(document.getElementById('scheduledAmount').value);
        const dateInput = document.getElementById('scheduledDate');
        
        if (!dateInput.value) {
            showAlert('Por favor, selecione uma data!');
            return;
        }

        // Correção para o problema da data
        const dateParts = dateInput.value.split('-');
        const formattedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
        
        const paymentMethod = document.getElementById('scheduledPaymentMethod').value;
        const autoDebit = document.getElementById('scheduledAutoDebit').checked;
        
        if (isNaN(amount)) {
            showAlert('Por favor, insira um valor válido!');
            return;
        }

        const bill = {
            id: Date.now(),
            name,
            amount,
            date: formattedDate,
            paymentMethod,
            autoDebit,
            paid: false,
            pending: false,
            insufficientBalance: false,
            category: 'Faturas (cartão, celular, assinaturas)'
        };
        
        upcomingBills.push(bill);
        saveUpcomingBills();
        renderUpcomingBills();
        checkScheduledPayments();
        
        closeModal(scheduledPaymentModal);
    }

    // Adicionar transação do modal
    async function addTransactionFromModal(e) {
        e.preventDefault();
        
        const date = modalDateInput.value;
        const item = modalItemInput.value.trim();
        const amount = parseFloat(modalAmountInput.value);
        const type = modalTypeInput.value;
        const category = modalCategoryInput.value;
        const paymentMethod = modalPaymentMethodInput.value;
        
        if (!item || isNaN(amount)) {
            await showAlert('Por favor, preencha todos os campos corretamente!');
            return;
        }
        
        // Check balance for expenses
        if (type === 'expense') {
            const { currentPix, currentCash, currentCard } = calculateCurrentBalances();
            
            if (paymentMethod === 'pix' && amount > currentPix) {
                await showAlert('Saldo Pix insuficiente!');
                return;
            }
            
            if (paymentMethod === 'cash' && amount > currentCash) {
                await showAlert('Saldo em Cédulas insuficiente!');
                return;
            }
            
            if (paymentMethod === 'card' && amount > currentCard) {
                await showAlert('Saldo no Cartão insuficiente!');
                return;
            }
        }
        
        const transaction = {
            id: Date.now(),
            date,
            item,
            amount,
            type,
            category,
            paymentMethod,
            isScheduled: false
        };
        
        transactions.push(transaction);
        saveTransactions();
        renderTransactionHistory();
        renderAllTransactions();
        updateBalanceDisplay();
        updateCharts();
        checkEmptyState();
        
        closeModal(transactionModal);
    }
    
    // Filter transactions
    function filterTransactions() {
        const typeFilter = document.getElementById('filterType2').value;
        const categoryFilter = document.getElementById('filterCategory2').value;
        const paymentFilter = document.getElementById('filterPayment2').value;
        const searchTerm = document.getElementById('searchInput2').value.toLowerCase();
        
        const filtered = transactions.filter(transaction => {
            return (typeFilter === 'all' || transaction.type === typeFilter) &&
                   (categoryFilter === 'all' || transaction.category === categoryFilter) &&
                   (paymentFilter === 'all' || transaction.paymentMethod === paymentFilter) &&
                   (transaction.item.toLowerCase().includes(searchTerm) || 
                    transaction.category.toLowerCase().includes(searchTerm));
        });
        
        renderAllTransactions(filtered);
    }
    
    // Clear filters
    function clearFilters() {
        document.getElementById('filterType2').value = 'all';
        document.getElementById('filterCategory2').value = 'all';
        document.getElementById('filterPayment2').value = 'all';
        document.getElementById('searchInput2').value = '';
        renderAllTransactions();
    }
    
    // Toggle Sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }
    
    // Show Section
    function showSection(sectionId) {
        // Hide all sections
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Deactivate all menu items
        menuItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Show selected section
        const section = document.getElementById(`${sectionId}-section`);
        if (section) {
            section.classList.add('active');
        } else {
            console.error(`Seção ${sectionId} não encontrada`);
            // Fallback para dashboard se a seção não existir
            document.getElementById('dashboard-section').classList.add('active');
            document.querySelector('.menu-item[data-section="dashboard"]').classList.add('active');
            return;
        }
        
        // Activate selected menu item
        const menuItem = document.querySelector(`.menu-item[data-section="${sectionId}"]`);
        if (menuItem) {
            menuItem.classList.add('active');
        }
        
        // Update page title
        document.querySelector('.page-title').textContent = 
            sectionId === 'dashboard' ? 'Dashboard Financeiro' : 
            sectionId === 'transactions' ? 'Transações' :
            sectionId === 'reports' ? 'Relatórios' :
            sectionId === 'goals' ? 'Metas' :
            sectionId === 'settings' ? 'Configurações' : 'Dashboard Financeiro';
        
        // Atualiza os valores iniciais quando a seção de configurações é aberta
        if (sectionId === 'settings') {
            document.getElementById('initialBalancePix').value = initialBalances.pix;
            document.getElementById('initialBalanceCash').value = initialBalances.cash;
            document.getElementById('initialBalanceCard').value = initialBalances.card;
            updateBalanceDisplays();
            
            // Selecionar a cor do tema atual
            document.querySelectorAll('.theme-color-option').forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.color === selectedThemeColor) {
                    option.classList.add('selected');
                }
            });
        }
    }
    
    // Toggle Theme
    function toggleTheme() {
        const isDark = body.getAttribute('data-theme') === 'dark';
        body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeToggleIcon.classList.toggle('fa-toggle-on', !isDark);
        themeToggleIcon.classList.toggle('fa-toggle-off', isDark);
        themeToggleIcon.classList.toggle('text-warning', !isDark);
        
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }
    
    // Apply Theme Color
    function applyThemeColor() {
        document.documentElement.style.setProperty('--primary-color', `var(--primary-${selectedThemeColor})`);
    }
    
    // Update Category Dropdowns
    function updateCategoryDropdowns() {
        const type = modalTypeInput.value;
        
        // Update modal category dropdown
        modalCategoryInput.innerHTML = categories[type].map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');
        
        // Update filter category dropdowns
        document.querySelectorAll('#filterCategory, #filterCategory2').forEach(filter => {
            filter.innerHTML = `
                <option value="all">Todas Categorias</option>
                ${categories.expense.concat(categories.income).map(cat => 
                    `<option value="${cat}">${cat}</option>`
                ).join('')}
            `;
        });
    }
    
    // Handle Balance Actions (Add/Subtract)
    function handleBalanceAction(e) {
        e.preventDefault();
        const method = this.dataset.method;
        const input = document.getElementById(`initialBalance${method.charAt(0).toUpperCase() + method.slice(1)}`);
        let value = parseFloat(input.value) || 0;
        
        if (this.classList.contains('add')) {
            value += 100; // Adiciona R$ 100
        } else {
            value = Math.max(0, value - 100); // Subtrai R$ 100 (não pode ser negativo)
        }
        
        input.value = value.toFixed(2);
    }
    
    // Update Balance Displays (Settings)
    function updateBalanceDisplays() {
        document.getElementById('pixBalanceDisplay').textContent = formatCurrency(initialBalances.pix);
        document.getElementById('cashBalanceDisplay').textContent = formatCurrency(initialBalances.cash);
        document.getElementById('cardBalanceDisplay').textContent = formatCurrency(initialBalances.card);
    }
    
    // Format Currency
    function formatCurrency(value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
    
    // Save Settings
    function saveSettings() {
        initialBalances = {
            pix: parseFloat(document.getElementById('initialBalancePix').value) || 0,
            cash: parseFloat(document.getElementById('initialBalanceCash').value) || 0,
            card: parseFloat(document.getElementById('initialBalanceCard').value) || 0
        };
        
        localStorage.setItem('initialBalances', JSON.stringify(initialBalances));
        updateBalanceDisplay();
        updateBalanceDisplays();
        
        // Feedback visual para o usuário
        showSuccessFeedback(saveSettingsBtn, 'Salvo!');
    }
    
    // Save User Settings
    function saveUserSettings() {
        userName = document.getElementById('userName').value;
        userEmail = document.getElementById('userEmail').value;
        currency = document.getElementById('currency').value;
        selectedThemeColor = document.querySelector('.theme-color-option.selected').dataset.color;
        
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('currency', currency);
        localStorage.setItem('themeColor', selectedThemeColor);
        
        // Atualizar no sidebar
        document.querySelector('.user-name').textContent = userName;
        document.querySelector('.user-email').textContent = userEmail;
        
        // Aplicar nova cor do tema
        applyThemeColor();
        
        // Feedback visual para o usuário
        showSuccessFeedback(saveUserSettingsBtn, 'Salvo!');
    }
    
    // Show Success Feedback
    function showSuccessFeedback(button, message) {
        const originalText = button.innerHTML;
        button.innerHTML = `<i class="fas fa-check"></i> ${message}`;
        button.classList.add('btn-success');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('btn-success');
        }, 2000);
    }
    
    // Open Add Transaction Modal
    function openAddTransactionModal() {
        // Reset form and set current date
        const today = new Date().toISOString().split('T')[0];
        modalDateInput.value = today;
        transactionModalForm.reset();
        updateCategoryDropdowns();
        
        // Open modal
        transactionModal.classList.add('active');
    }
    
    // Open Add Goal Modal
    function openAddGoalModal() {
        // Reset form and set current date
        const today = new Date().toISOString().split('T')[0];
        goalDateInput.value = today;
        document.getElementById('goalForm').reset();
        goalImagePreview.style.display = 'none';
        
        // Reset selected color
        document.querySelectorAll('.theme-color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === selectedThemeColor) {
                option.classList.add('selected');
            }
        });
        
        // Reset edit index
        currentEditIndex = null;
        
        // Open modal
        goalModal.classList.add('active');
    }
    
    // Save Goal
    async function saveGoal() {
        const name = goalNameInput.value.trim();
        const target = parseFloat(goalTargetInput.value);
        const date = goalDateInput.value;
        const imageFile = goalImageInput.files[0];
        const selectedColor = document.querySelector('.theme-color-option.selected').dataset.color;
        const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value) || 0;
        const goalType = document.getElementById('goalType').value;
        
        if (!name || isNaN(target) || !date) {
            await showAlert('Por favor, preencha todos os campos obrigatórios!');
            return;
        }
        
        const goal = {
            name,
            target,
            date,
            themeColor: selectedColor,
            monthlyContribution,
            type: goalType
        };
        
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                goal.image = event.target.result;
                saveGoalToStorage(goal);
            };
            reader.readAsDataURL(imageFile);
        } else {
            saveGoalToStorage(goal);
        }
    }
    
    // Save Goal to Storage
    function saveGoalToStorage(goal) {
        if (currentEditIndex !== null) {
            goals[currentEditIndex] = {
                ...goal,
                id: goals[currentEditIndex].id, // Manter o ID existente
                current: goals[currentEditIndex].current || 0, // Manter o progresso atual
                contributions: goals[currentEditIndex].contributions || [], // Manter histórico
                completed: goals[currentEditIndex].completed || false // Manter status
            };
        } else {
            const newGoal = {
                ...goal,
                id: Date.now(),
                current: 0,
                contributions: [],
                completed: false,
                createdAt: new Date().toISOString()
            };
            goals.push(newGoal);
        }
        
        saveGoals();
        renderGoals();
        closeModal(goalModal);
        currentEditIndex = null;
    }

    // Adicionar contribuição à meta
    async function addContribution(goalId, amount) {
        const goalIndex = goals.findIndex(g => g.id === goalId);
        if (goalIndex !== -1) {
            goals[goalIndex].current += amount;
            goals[goalIndex].contributions.push({
                date: new Date().toISOString().split('T')[0],
                amount: amount
            });
            
            // Verificar se a meta foi alcançada
            if (goals[goalIndex].current >= goals[goalIndex].target && !goals[goalIndex].completed) {
                goals[goalIndex].completed = true;
                goals[goalIndex].completedAt = new Date().toISOString();
                await showAlert(`Parabéns! Você alcançou a meta "${goals[goalIndex].name}"!`);
            }
            
            saveGoals();
            renderGoals();
            updateGoalsSummary();
        }
    }

    // Calcular projeção da meta
    function calculateProjection(goal) {
        if (!goal.monthlyContribution || goal.monthlyContribution <= 0) {
            return null;
        }
        
        const remaining = goal.target - goal.current;
        const monthsNeeded = Math.ceil(remaining / goal.monthlyContribution);
        const completionDate = new Date();
        completionDate.setMonth(completionDate.getMonth() + monthsNeeded);
        
        return {
            monthsNeeded,
            completionDate: completionDate.toISOString().split('T')[0]
        };
    }

    // Verificar progresso das metas
    function checkGoalsProgress() {
        goals.forEach(goal => {
            if (goal.completed) return;
            
            const progress = (goal.current / goal.target) * 100;
            const daysLeft = Math.ceil((new Date(goal.date) - new Date()) / (1000 * 60 * 60 * 24));
            
            if (progress < 50 && daysLeft < 30) {
                showAlert(`Meta "${goal.name}" em risco! Apenas ${Math.floor(progress)}% alcançado com ${daysLeft} dias restantes.`);
            }
        });
    }
    
    // Save Goals
    function saveGoals() {
        localStorage.setItem('goals', JSON.stringify(goals));
    }
    
    // Calculate Balances
    function calculateCurrentBalances() {
        let currentPix = initialBalances.pix;
        let currentCash = initialBalances.cash;
        let currentCard = initialBalances.card;
        
        transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                if (transaction.paymentMethod === 'pix') currentPix -= transaction.amount;
                else if (transaction.paymentMethod === 'cash') currentCash -= transaction.amount;
                else if (transaction.paymentMethod === 'card') currentCard -= transaction.amount;
            } else {
                if (transaction.paymentMethod === 'pix') currentPix += transaction.amount;
                else if (transaction.paymentMethod === 'cash') currentCash += transaction.amount;
                else if (transaction.paymentMethod === 'card') currentCard += transaction.amount;
            }
        });
        
        return { currentPix, currentCash, currentCard };
    }
    
    // Update Balance Display
    function updateBalanceDisplay() {
        const { currentPix, currentCash, currentCard } = calculateCurrentBalances();
        
        remainingBalancePix.textContent = formatCurrency(currentPix);
        remainingBalanceCash.textContent = formatCurrency(currentCash);
        remainingBalanceCard.textContent = formatCurrency(currentCard);
        
        // Update color based on balance
        remainingBalancePix.className = `card-value ${currentPix >= 0 ? 'card-positive' : 'card-negative'}`;
        remainingBalanceCash.className = `card-value ${currentCash >= 0 ? 'card-positive' : 'card-negative'}`;
        remainingBalanceCard.className = `card-value ${currentCard >= 0 ? 'card-positive' : 'card-negative'}`;
    }
    
    // Render Transaction History
    function renderTransactionHistory(transactionsToRender = transactions.slice(0, 5)) {
        const container = document.getElementById('transactionHistory');
        container.innerHTML = '';
        
        if (transactionsToRender.length === 0) {
            document.getElementById('emptyState').style.display = 'block';
            return;
        }
        
        transactionsToRender.forEach(transaction => {
            const transactionEl = document.createElement('div');
            transactionEl.className = 'transaction-item';
            
            // Ícone baseado na categoria
            const iconClass = transaction.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down';
            const iconBg = transaction.type === 'income' ? 'success' : 'danger';
            
            let paymentMethodIcon = '';
            switch(transaction.paymentMethod) {
                case 'pix': 
                    paymentMethodIcon = '<i class="fas fa-qrcode"></i>';
                    break;
                case 'cash': 
                    paymentMethodIcon = '<i class="fas fa-money-bill-wave"></i>';
                    break;
                case 'card': 
                    paymentMethodIcon = '<i class="fas fa-credit-card"></i>';
                    break;
            }
            
            transactionEl.innerHTML = `
                <div class="transaction-icon bg-${iconBg}">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${transaction.item} 
                        ${transaction.isScheduled ? '<span class="scheduled-tag"><i class="fas fa-calendar-check"></i> Agendado</span>' : ''}
                    </div>
                    <div class="transaction-meta">
                        <span>${new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                        <span>${transaction.category}</span>
                    </div>
                    <div class="transaction-payment-method ${transaction.paymentMethod}">
                        ${paymentMethodIcon} ${transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type === 'income' ? 'amount-positive' : 'amount-negative'}">
                    ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
                </div>
            `;
            
            container.appendChild(transactionEl);
        });
        
        document.getElementById('emptyState').style.display = 'none';
    }
    
    // Render All Transactions
    function renderAllTransactions(transactionsToRender = transactions) {
        const container = document.getElementById('allTransactions');
        container.innerHTML = '';
        
        if (transactionsToRender.length === 0) {
            document.getElementById('emptyState2').style.display = 'block';
            return;
        }
        
        transactionsToRender.forEach((transaction, index) => {
            const transactionEl = document.createElement('div');
            transactionEl.className = 'transaction-item';
            transactionEl.dataset.index = index;
            
            // Ícone baseado na categoria
            const iconClass = transaction.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down';
            const iconBg = transaction.type === 'income' ? 'success' : 'danger';
            
            let paymentMethodIcon = '';
            switch(transaction.paymentMethod) {
                case 'pix': 
                    paymentMethodIcon = '<i class="fas fa-qrcode"></i>';
                    break;
                case 'cash': 
                    paymentMethodIcon = '<i class="fas fa-money-bill-wave"></i>';
                    break;
                case 'card': 
                    paymentMethodIcon = '<i class="fas fa-credit-card"></i>';
                    break;
            }
            
            // HTML da transação
            transactionEl.innerHTML = `
                <div class="transaction-icon bg-${iconBg}">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${transaction.item} 
                        ${transaction.isScheduled ? '<span class="scheduled-tag"><i class="fas fa-calendar-check"></i> Agendado</span>' : ''}
                    </div>
                    <div class="transaction-meta">
                        <span>${new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                        <span>${transaction.category}</span>
                    </div>
                    <div class="transaction-payment-method ${transaction.paymentMethod}">
                        ${paymentMethodIcon} ${transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type === 'income' ? 'amount-positive' : 'amount-negative'}">
                    ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
                </div>
                ${!transaction.isFixed ? `
                <div class="transaction-actions">
                    <button class="action-btn edit" onclick="window.app.openEditModal(${index})">
                        <i class="fas fa-pencil"></i>
                    </button>
                    <button class="action-btn delete" onclick="window.app.openDeleteModal(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ` : ''}
            `;
            
            container.appendChild(transactionEl);
        });
        
        document.getElementById('emptyState2').style.display = 'none';
    }
    
    // Render Upcoming Bills
    function renderUpcomingBills() {
        const container = document.getElementById('upcomingBills');
        container.innerHTML = '';
        
        if (upcomingBills.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 1rem;">
                    <i class="fas fa-calendar" style="font-size: 1.5rem;"></i>
                    <p>Nenhum pagamento agendado</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por data mais próxima
        upcomingBills.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        upcomingBills.forEach((bill, index) => {
            const billEl = document.createElement('div');
            billEl.className = 'bill-item';
            
            const formattedDate = new Date(bill.date).toLocaleDateString('pt-BR');
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = bill.date < today && !bill.paid;
            
            let statusText = '';
            if (bill.paid) {
                statusText = `Pago em ${new Date(bill.processedDate).toLocaleDateString('pt-BR')}`;
            } else if (bill.insufficientBalance) {
                statusText = 'Saldo insuficiente';
            } else if (bill.pending) {
                statusText = 'Aguardando confirmação';
            } else if (isOverdue) {
                statusText = 'Vencido';
            } else {
                statusText = `Vence em ${formattedDate}`;
            }
            
            let paymentMethodIcon = '';
            switch(bill.paymentMethod) {
                case 'pix': 
                    paymentMethodIcon = '<i class="fas fa-qrcode"></i>';
                    break;
                case 'cash': 
                    paymentMethodIcon = '<i class="fas fa-money-bill-wave"></i>';
                    break;
                case 'card': 
                    paymentMethodIcon = '<i class="fas fa-credit-card"></i>';
                    break;
            }
            
            billEl.innerHTML = `
                <div class="bill-details">
                    <div class="bill-title">${bill.name}</div>
                    <div class="bill-meta">
                        <span>${statusText}</span>
                        <span>${paymentMethodIcon} ${bill.paymentMethod.charAt(0).toUpperCase() + bill.paymentMethod.slice(1)}</span>
                    </div>
                </div>
                <div class="bill-amount">- ${formatCurrency(bill.amount)}</div>
                <div class="bill-actions">
                    ${!bill.paid && bill.pending ? 
                        `<button class="bill-pay-btn" onclick="window.app.payScheduledBill(${index})">
                            <i class="fas fa-check"></i> Confirmar Pagamento
                        </button>` : ''}
                    <button class="action-btn delete" onclick="window.app.deleteUpcomingBill(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            if (isOverdue) {
                billEl.style.borderLeft = '4px solid var(--danger-color)';
            } else if (bill.pending) {
                billEl.style.borderLeft = '4px solid var(--warning-color)';
            } else if (bill.paid) {
                billEl.style.borderLeft = '4px solid var(--success-color)';
            }
            
            container.appendChild(billEl);
        });
    }
    
    // Delete Upcoming Bill
    async function deleteUpcomingBill(index) {
        const confirmed = await showConfirmModal('Deseja realmente excluir este pagamento agendado?');
        if (confirmed) {
            upcomingBills.splice(index, 1);
            saveUpcomingBills();
            renderUpcomingBills();
        }
    }
    
    // Save Upcoming Bills
    function saveUpcomingBills() {
        localStorage.setItem('upcomingBills', JSON.stringify(upcomingBills));
    }
    
    // Open Edit Modal
    async function openEditModal(index) {
        const transaction = transactions[index];
        
        // Verificar se é uma transação agendada
        if (transaction.isScheduled) {
            await showAlert('Transações agendadas não podem ser editadas. Você pode cancelar o pagamento agendado na seção de Pagamentos Agendados.');
            return;
        }
        
        currentEditIndex = index;
        
        // Preencher o modal de edição
        document.getElementById('editDate').value = transaction.date;
        document.getElementById('editItem').value = transaction.item;
        document.getElementById('editAmount').value = transaction.amount;
        document.getElementById('editType').value = transaction.type;
        
        // Atualizar categorias
        const editCategory = document.getElementById('editCategory');
        editCategory.innerHTML = categories[transaction.type].map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');
        editCategory.value = transaction.category;
        
        document.getElementById('editPaymentMethod').value = transaction.paymentMethod;
        
        // Abrir modal
        editModal.classList.add('active');
    }
    
    // Open Delete Modal
    function openDeleteModal(index) {
        currentEditIndex = index;
        confirmModal.classList.add('active');
    }
    
    // Confirm Delete Transaction
    function confirmDeleteTransaction() {
        if (currentEditIndex !== null) {
            transactions.splice(currentEditIndex, 1);
            saveTransactions();
            renderTransactionHistory();
            renderAllTransactions();
            updateBalanceDisplay();
            updateCharts();
            checkEmptyState();
            currentEditIndex = null;
        }
        closeModal(confirmModal);
    }
    
    // Save Edited Transaction
    function saveEditedTransaction() {
        if (currentEditIndex === null) return;
        
        const transaction = transactions[currentEditIndex];
        
        transaction.date = document.getElementById('editDate').value;
        transaction.item = document.getElementById('editItem').value.trim();
        transaction.amount = parseFloat(document.getElementById('editAmount').value);
        transaction.type = document.getElementById('editType').value;
        transaction.category = document.getElementById('editCategory').value;
        transaction.paymentMethod = document.getElementById('editPaymentMethod').value;
        
        saveTransactions();
        renderTransactionHistory();
        renderAllTransactions();
        updateBalanceDisplay();
        updateCharts();
        checkEmptyState();
        
        closeModal(editModal);
    }
    
    // Render Goals
    function renderGoals() {
        const container = document.getElementById('goalsList');
        container.innerHTML = '';
        
        if (goals.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 2rem;">
                    <i class="fas fa-bullseye" style="font-size: 2rem;"></i>
                    <h3>Nenhuma meta definida</h3>
                    <p>Crie sua primeira meta para começar a economizar</p>
                </div>
            `;
            return;
        }
        
        // Separar metas concluídas e ativas
        const completedGoals = goals.filter(g => g.completed);
        const activeGoals = goals.filter(g => !g.completed);
        
        // Render metas ativas
        activeGoals.forEach((goal, index) => renderGoalItem(container, goal, index));
        
        // Render metas concluídas se houver
        if (completedGoals.length > 0) {
            const completedSection = document.createElement('div');
            completedSection.className = 'completed-goals';
            completedSection.innerHTML = `
                <h3>Metas Concluídas</h3>
            `;
            
            container.appendChild(completedSection);
            completedGoals.forEach((goal, index) => renderGoalItem(completedSection, goal, index, true));
        }
        
        // Atualizar resumo no dashboard
        updateGoalsSummary();
    }
    
    // Render Goal Item
    function renderGoalItem(container, goal, index, isCompleted = false) {
        const goalEl = document.createElement('div');
        goalEl.className = `goal-item ${isCompleted ? 'completed' : ''}`;
        goalEl.dataset.id = goal.id;
        
        // Calcular progresso e tempo restante
        const progress = Math.min((goal.current / goal.target) * 100, 100);
        const today = new Date();
        const goalDate = new Date(goal.date);
        const timeDiff = goalDate - today;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        let timeLeftText = '';
        if (daysLeft < 0) {
            timeLeftText = 'Meta vencida';
        } else if (daysLeft < 30) {
            timeLeftText = `Faltam ${daysLeft} dias`;
        } else {
            const monthsLeft = Math.ceil(daysLeft / 30);
            timeLeftText = `Faltam ${monthsLeft} meses`;
        }
        
        // Calcular projeção se houver contribuição mensal
        const projection = goal.monthlyContribution > 0 ? calculateProjection(goal) : null;
        
        goalEl.innerHTML = `
            <div class="goal-header">
                <div class="goal-content">
                    ${goal.image ? `<img src="${goal.image}" class="goal-image" alt="${goal.name}">` : ''}
                    <div>
                        <h3>${goal.name}</h3>
                        <div class="goal-time-left">${isCompleted ? 'Concluída!' : timeLeftText}</div>
                        <div class="goal-type">${getGoalTypeName(goal.type)}</div>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="action-btn edit-goal">
                        <i class="fas fa-pencil"></i>
                    </button>
                    <button class="action-btn delete-goal">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progress}%; background: var(--primary-${goal.themeColor || 'masculine-1'})"></div>
            </div>
            
            <div class="goal-progress-info">
                <span>${formatCurrency(goal.current)} de ${formatCurrency(goal.target)} (${Math.round(progress)}%)</span>
            </div>
            
            ${projection && !isCompleted ? `
            <div class="projection-info">
                <small>Projeção: ${projection.monthsNeeded} meses (${projection.completionDate})</small>
            </div>
            ` : ''}
            
            ${!isCompleted ? `
            <div class="goal-contribution">
                <input type="number" id="contribution-${goal.id}" placeholder="Valor da contribuição" class="form-control">
                <button class="btn btn-sm" onclick="window.app.addContribution(${goal.id}, document.getElementById('contribution-${goal.id}').value)">
                    Adicionar
                </button>
            </div>
            ` : ''}
            
            ${!isCompleted && progress >= 100 ? `
            <button class="complete-goal-btn" onclick="window.app.completeGoal(${goal.id})">
                Concluir Meta
            </button>
            ` : ''}
        `;
        
        container.appendChild(goalEl);
    }

    function getGoalTypeName(type) {
        const types = {
            'travel': 'Viagem',
            'electronics': 'Eletrônicos',
            'education': 'Educação',
            'emergency': 'Fundo de Emergência',
            'other': 'Outro'
        };
        return types[type] || type;
    }

    function updateGoalsSummary() {
        const summaryContainer = document.querySelector('.goals-summary');
        if (!summaryContainer) return;
        
        const activeGoals = goals.filter(g => !g.completed);
        const completedGoals = goals.filter(g => g.completed);
        
        let totalActive = 0;
        let totalSaved = 0;
        let totalNeeded = 0;
        
        activeGoals.forEach(goal => {
            totalActive++;
            totalSaved += goal.current;
            totalNeeded += (goal.target - goal.current);
        });
        
        summaryContainer.innerHTML = `
            <div class="goals-summary-grid">
                <div class="summary-card">
                    <h4>Metas Ativas</h4>
                    <div class="summary-value">${totalActive}</div>
                </div>
                <div class="summary-card">
                    <h4>Total Economizado</h4>
                    <div class="summary-value">${formatCurrency(totalSaved)}</div>
                </div>
                <div class="summary-card">
                    <h4>Falta Economizar</h4>
                    <div class="summary-value">${formatCurrency(totalNeeded)}</div>
                </div>
                <div class="summary-card">
                    <h4>Metas Concluídas</h4>
                    <div class="summary-value">${completedGoals.length}</div>
                </div>
            </div>
            
            ${activeGoals.length > 0 ? `
            <div class="goals-priority">
                <h4>Prioridades</h4>
                ${activeGoals
                    .sort((a, b) => (new Date(a.date) - new Date(b.date)))
                    .slice(0, 3)
                    .map(goal => `
                        <div class="priority-item">
                            <div class="priority-name">${goal.name}</div>
                            <div class="priority-date">${new Date(goal.date).toLocaleDateString('pt-BR')}</div>
                            <div class="priority-progress">
                                <div class="progress-bar" style="width: ${Math.min((goal.current / goal.target) * 100, 100)}%"></div>
                            </div>
                        </div>
                    `).join('')}
            </div>
            ` : ''}
        `;
    }
    
    // Open Edit Goal Modal
    function openEditGoalModal(index) {
        const goal = goals[index];
        currentEditIndex = index;
        
        goalNameInput.value = goal.name;
        goalTargetInput.value = goal.target;
        goalDateInput.value = goal.date;
        document.getElementById('goalType').value = goal.type || 'other';
        document.getElementById('monthlyContribution').value = goal.monthlyContribution || '';
        
        if (goal.image) {
            goalImagePreview.src = goal.image;
            goalImagePreview.style.display = 'block';
        } else {
            goalImagePreview.style.display = 'none';
        }
        
        // Selecionar a cor do tema
        document.querySelectorAll('.theme-color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === goal.themeColor) {
                option.classList.add('selected');
            }
        });
        
        // Abrir modal
        goalModal.classList.add('active');
    }
    
    // Complete Goal
    async function completeGoal(goalId) {
        const goalIndex = goals.findIndex(g => g.id === goalId);
        if (goalIndex !== -1) {
            goals[goalIndex].completed = true;
            goals[goalIndex].completedAt = new Date().toISOString();
            saveGoals();
            renderGoals();
            await showAlert(`Parabéns! Você concluiu a meta "${goals[goalIndex].name}"!`);
        }
    }
    
    // Delete Goal
    async function deleteGoal(index) {
        const confirmed = await showConfirmModal('Deseja realmente excluir esta meta?');
        if (confirmed) {
            goals.splice(index, 1);
            saveGoals();
            renderGoals();
            updateGoalsSummary();
        }
    }
    
    // Update Charts
    function updateCharts() {
        // Verificar se há dados para mostrar
        const hasExpenseData = transactions.some(t => t.type === 'expense');
        const hasIncomeData = transactions.some(t => t.type === 'income');
        
        if (!hasExpenseData && !hasIncomeData) {
            document.querySelectorAll('.chart-container').forEach(container => {
                container.innerHTML = '<p style="color: var(--text-light); font-style: italic;">Nenhum dado disponível</p>';
            });
            return;
        }
        
        // Expenses by Category
        const expensesByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});
        
        // Income vs Expenses
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Payment Methods
        const paymentMethods = transactions.reduce((acc, t) => {
            acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
            return acc;
        }, {});
        
        // Destroy existing charts if they exist
        if (expensesChart) expensesChart.destroy();
        if (incomeVsExpensesChart) incomeVsExpensesChart.destroy();
        if (paymentMethodsChart) paymentMethodsChart.destroy();
        
        // Expenses by Category Chart
        expensesChart = new Chart(expensesChartCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(expensesByCategory),
                datasets: [{
                    data: Object.values(expensesByCategory),
                    backgroundColor: [
                        '#f72585',
                        '#b5179e',
                        '#7209b7',
                        '#560bad',
                        '#480ca8',
                        '#3a0ca3',
                        '#3f37c9',
                        '#4361ee',
                        '#4895ef',
                        '#4cc9f0'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Income vs Expenses Chart
        incomeVsExpensesChart = new Chart(incomeVsExpensesChartCtx, {
            type: 'bar',
            data: {
                labels: ['Receitas', 'Despesas'],
                datasets: [{
                    label: 'Valor',
                    data: [totalIncome, totalExpenses],
                    backgroundColor: [
                        '#4cc9f0',
                        '#f72585'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatCurrency(context.raw);
                            }
                        }
                    }
                }
            }
        });
        
        // Payment Methods Chart
        paymentMethodsChart = new Chart(paymentMethodsChartCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(paymentMethods).map(method => {
                    switch (method) {
                        case 'pix': return 'Pix';
                        case 'cash': return 'Dinheiro';
                        case 'card': return 'Cartão';
                        default: return method;
                    }
                }),
                datasets: [{
                    data: Object.values(paymentMethods),
                    backgroundColor: [
                        '#4895ef',
                        '#f8961e',
                        '#f72585'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Check Empty State
    function checkEmptyState() {
        if (transactions.length === 0) {
            document.getElementById('emptyState').style.display = 'block';
        } else {
            document.getElementById('emptyState').style.display = 'none';
        }
    }
    
    // Save Transactions
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    // Close Modal
    function closeModal(modal) {
        modal.classList.remove('active');
        currentEditIndex = null;
    }
    
    // Initialize the app
    init();
    
    // Expose functions to global scope for inline event handlers
    window.app = {
        openEditModal,
        openDeleteModal,
        openEditGoalModal,
        deleteGoal,
        completeGoal,
        deleteUpcomingBill,
        payScheduledBill,
        showSection,
        addContribution: function(goalId, amount) {
            const input = document.getElementById(`contribution-${goalId}`);
            const amountValue = parseFloat(amount);
            
            if (!isNaN(amountValue) && amountValue > 0) {
                addContribution(goalId, amountValue);
                input.value = '';
            } else {
                showAlert('Por favor, insira um valor válido para a contribuição.');
            }
        },
        completeGoal: function(goalId) {
            const goalIndex = goals.findIndex(g => g.id === goalId);
            if (goalIndex !== -1) {
                goals[goalIndex].completed = true;
                goals[goalIndex].completedAt = new Date().toISOString();
                saveGoals();
                renderGoals();
                showAlert(`Parabéns! Você concluiu a meta "${goals[goalIndex].name}"!`);
            }
        },
        openAddGoalModal,
        saveGoal,
        addTransactionFromModal,
        openAddTransactionModal
    };
});