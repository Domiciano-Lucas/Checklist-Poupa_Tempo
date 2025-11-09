/**
 * UIService: Controla a visibilidade das telas e elementos da UI.
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

    showView(viewName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });

        const screen = this.screens[viewName];
        if (screen) {
            if (viewName === 'login') {
                screen.classList.add('active');
                screen.style.display = 'flex'; 
            } else {
                screen.style.display = 'block';
            }
        }
    },

    showTecnicoView(viewName) {
        this.selectionView.style.display = 'none';
        this.checklistView.style.display = 'none';
        if (viewName === 'selection') {
            this.selectionView.style.display = 'block';
        } else if (viewName === 'checklist') {
            this.checklistView.style.display = 'block';
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
                spinner.style.display = show ? 'inline-block' : 'none';
            }
        }
    },
    
    showLoginError(message) {
        this.loginError.textContent = message;
        this.loginError.style.display = 'block';
    },
    hideLoginError() {
        this.loginError.style.display = 'none';
    },

    showChecklistError(message) {
        this.checklistError.textContent = message;
        this.checklistError.style.display = 'block';
    },
    hideChecklistError() {
        this.checklistError.style.display = 'none';
    },
    
    setupConditionalLogic() {
        const setupListener = (radioName, triggerValue, fieldId) => {
            const radios = document.querySelectorAll(`input[name="${radioName}"]`);
            const field = document.getElementById(fieldId);
            
            radios.forEach(radio => {
                radio.addEventListener('change', (event) => {
                    if (event.target.value === triggerValue) {
                        field.style.display = 'block';
                    } else {
                        field.style.display = 'none';
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