// Importações dos Módulos de Serviço
import { AppCore } from "./firebaseCore.js";
import { UIService } from "./ui.js";
import { AuthService } from "./auth.js";
import { ChecklistService } from "./checklist.js";
import { initDarkMode } from "./darkMode.js";

/**
 * EventListeners: Ponto central para ligar UI (HTML) com a Lógica (JS).
 */
const EventListeners = {
    init() {
        try {
            // ======================================================
            // 1. LOGIN / LOGOUT
            // ======================================================
            // O bind é necessário aqui para o 'this' funcionar dentro do handleLogin
            document.getElementById('login-form').addEventListener('submit', AuthService.handleLogin.bind(AuthService));
            
            // Logout não precisa de bind, pois não usa 'this' interno, mas mantemos o padrão
            document.getElementById('btn-logout-tecnico').addEventListener('click', () => AuthService.handleLogout());
            document.getElementById('btn-logout-gestor').addEventListener('click', () => AuthService.handleLogout());

            // ======================================================
            // 2. NAVEGAÇÃO TÉCNICO
            // ======================================================
            document.getElementById('btn-abertura').addEventListener('click', () => ChecklistService.start('abertura'));
            document.getElementById('btn-fechamento').addEventListener('click', () => ChecklistService.start('fechamento'));
            document.getElementById('btn-voltar').addEventListener('click', () => UIService.showTecnicoView('selection'));

            // ======================================================
            // 3. FORMULÁRIO CHECKLIST
            // ======================================================
            document.getElementById('checklist-form').addEventListener('submit', ChecklistService.handleSubmit.bind(ChecklistService));
            
            // Botão de "OK" na mensagem de sucesso
            document.getElementById('btn-success-ok').addEventListener('click', () => {
                UIService.successMessage.style.display = 'none'; // Fecha o modal
                UIService.showTecnicoView('selection'); // Volta para a seleção
            });
            
            // ======================================================
            // 4. LÓGICA CONDICIONAL (Campos amarelos)
            // ======================================================
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
    // Se o Firebase falhar na inicialização
    UIService.showView('login');
    UIService.showLoginError("Erro fatal ao carregar o Firebase. Verifique a conexão.");
}