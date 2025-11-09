// Importações dos Módulos de Serviço
import { AppCore } from "./firebaseCore.js";
import { UIService } from "./ui.js";
import { AuthService } from "./auth.js";
import { ChecklistService } from "./checklist.js";
import { initDarkMode } from "./darkMode.js";

/**
 * EventListeners: Ponto central para ligar UI (HTML) com a Lógica (JS).
 * (Mantido no main.js por ser o ponto de entrada)
 */
const EventListeners = {
    init() {
        try {
            // Login / Logout
            // ===== CORREÇÃO APLICADA AQUI (.bind(AuthService)) =====
            document.getElementById('login-form').addEventListener('submit', AuthService.handleLogin.bind(AuthService));
            document.getElementById('btn-logout-tecnico').addEventListener('click', AuthService.handleLogout.bind(AuthService));
            document.getElementById('btn-logout-gestor').addEventListener('click', AuthService.handleLogout.bind(AuthService));

            // Navegação Técnico
            document.getElementById('btn-abertura').addEventListener('click', () => ChecklistService.start('abertura'));
            document.getElementById('btn-fechamento').addEventListener('click', () => ChecklistService.start('fechamento'));
            document.getElementById('btn-voltar').addEventListener('click', () => UIService.showTecnicoView('selection'));

            // Formulário
            document.getElementById('checklist-form').addEventListener('submit', ChecklistService.handleSubmit.bind(ChecklistService));
            
            document.getElementById('btn-success-ok').addEventListener('click', () => {
                UIService.successMessage.style.display = 'none';
                UIService.showTecnicoView('selection');
            });
            
            // Lógica condicional
            UIService.setupConditionalLogic();
            
            console.log("Listeners de eventos inicializados.");
        } catch(error) {
            console.error("Erro ao iniciar listeners:", error);
            UIService.showLoginError("Erro ao carregar a interface. Recarregue a página.");
        }
    }
};

// ======================================================
// INICIALIZAÇÃO DO APP
// ======================================================
if (AppCore.init()) {
    EventListeners.init();
    AuthService.listenForAuthChanges();
    initDarkMode();
} else {
    // Se o Firebase falhar, exibe a tela de login com erro
    UIService.showView('login');
    UIService.showLoginError("Erro fatal ao carregar. Verifique a conexão.");
}