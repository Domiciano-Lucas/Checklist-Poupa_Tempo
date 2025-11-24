/**
 * UIService: Controla a visibilidade das telas e elementos da UI.
 * Atualizado para manipular classes do Tailwind (hidden) em vez de estilos inline.
 */
export const UIService = {
    screens: {
        loading: document.getElementById('loading-screen'),
        login: document.getElementById('login-screen'),
        tecnico: document.getElementById('app-screen-tecnico'),
        gestor: document.getElementById('app-screen-gestor')
    },
    selectionView: document.getElementById('selection-view'),
    checklistView: document.getElementById('checklist-view'),
    successMessage: document.getElementById('success-message'),
    loginError: document.getElementById('login-error'),
    checklistError: document.getElementById('checklist-error'), 

    // Gerencia a troca de telas principais
    showView(viewName) {
        // Oculta todas as telas
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active'); // Para o login
            screen.classList.add('hidden-screen'); // Para as outras
            if (screen.id === 'login-screen') screen.style.display = ''; // Limpa inline style antigo se houver
        });

        const screen = this.screens[viewName];
        if (screen) {
            if (viewName === 'login') {
                screen.classList.add('active'); // CSS específico do login
            } else {
                screen.classList.remove('hidden-screen');
            }
        }
    },

    // Gerencia a navegação interna do técnico (Seleção vs Formulário)
    showTecnicoView(viewName) {
        this.selectionView.classList.add('hidden-screen');
        this.checklistView.classList.add('hidden-screen');

        if (viewName === 'selection') {
            this.selectionView.classList.remove('hidden-screen');
        } else if (viewName === 'checklist') {
            this.checklistView.classList.remove('hidden-screen');
        }
    },

    updateUserInfo(user) {
        if (user.role === 'tecnico') {
            document.getElementById('user-name-display').textContent = user.nome;
            document.getElementById('unidade-display').textContent = user.unidadeNome;
        } else if (user.role === 'gestor') {
            document.getElementById('gestor-name-display').textContent = user.nome;
        }
    },

    toggleSpinner(buttonId, show) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            const spinner = btn.querySelector('.spinner-small');
            btn.disabled = show;
            if (spinner) {
                if (show) {
                    spinner.classList.remove('hidden');
                    spinner.style.display = 'inline-block'; // Garante display
                } else {
                    spinner.classList.add('hidden');
                    spinner.style.display = 'none';
                }
            }
        }
    },
    
    showLoginError(message) {
        this.loginError.textContent = message;
        this.loginError.classList.remove('hidden');
        this.loginError.style.display = 'block'; // Fallback para garantir
    },
    hideLoginError() {
        this.loginError.classList.add('hidden');
        this.loginError.style.display = 'none';
    },

    showChecklistError(message) {
        this.checklistError.textContent = message;
        this.checklistError.classList.remove('hidden');
    },
    hideChecklistError() {
        this.checklistError.classList.add('hidden');
    },
    
    setupConditionalLogic() {
        const setupListener = (radioName, triggerValue, fieldId) => {
            const radios = document.querySelectorAll(`input[name="${radioName}"]`);
            const field = document.getElementById(fieldId);
            
            radios.forEach(radio => {
                radio.addEventListener('change', (event) => {
                    if (event.target.value === triggerValue) {
                        field.style.display = 'block';
                        field.classList.remove('hidden');
                    } else {
                        field.style.display = 'none';
                        field.classList.add('hidden');
                    }
                });
            });
        };

        setupListener('item_computadores', 'outra', 'conditional_computadores');
        setupListener('item_contagem', 'nao', 'conditional_contagem');
        setupListener('item_totem_ligado', 'nao', 'conditional_totem');
        setupListener('item_tablet_corp_ok', 'nao', 'conditional_tablet_corp');
        setupListener('item_celular_corp_ok', 'nao', 'conditional_celular_corp');
        setupListener('item_celular_tic_ok', 'nao', 'conditional_celular_tic');
    },

    resetConditionalFields() {
        document.querySelectorAll('.conditional-field').forEach(field => {
            field.style.display = 'none';
            field.classList.add('hidden');
        });
    },

    loadRememberedEmail() {
        const emailInput = document.querySelector('#login-form input[name="email"]');
        const rememberMeCheck = document.getElementById('remember-me');
        const savedEmail = localStorage.getItem('rememberedEmail');

        if (savedEmail && emailInput && rememberMeCheck) {
            emailInput.value = savedEmail;
            rememberMeCheck.checked = true;
        }
    }
};