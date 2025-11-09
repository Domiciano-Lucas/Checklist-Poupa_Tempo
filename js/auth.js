// Importações de Serviços
import { AppCore } from "./firebaseCore.js";
import { UIService } from "./ui.js";

// Importações do Firebase
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


/**
 * AuthService: Cuida de toda a lógica de autenticação.
 */
export const AuthService = {
    listenForAuthChanges() {
        onAuthStateChanged(AppCore.auth, async (user) => {
            if (user) {
                UIService.showView('loading');
                await this.checkUserRole(user.uid);
            } else {
                AppCore.currentUser = null;
                UIService.showView('login');
                UIService.loadRememberedEmail();
            }
        });
    },

    async checkUserRole(uid) {
        try {
            const userDocRef = doc(AppCore.db, "usuarios", uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userRole = userData.role;

                if (userRole === 'tecnico') {
                    AppCore.currentUser = {
                        uid: uid,
                        nome: userData.nome,
                        unidadeId: userData.unidadeId, 
                        unidadeNome: userData.unidadeNome, 
                        role: 'tecnico'
                    };
                    UIService.updateUserInfo(AppCore.currentUser);
                    UIService.showView('tecnico');
                    UIService.showTecnicoView('selection');
                } else if (userRole === 'gestor') {
                    AppCore.currentUser = {
                        uid: uid,
                        nome: userData.nome,
                        unidadeId: null,
                        unidadeNome: null,
                        role: 'gestor'
                    };
                    UIService.updateUserInfo(AppCore.currentUser);
                    UIService.showView('gestor');
                } else {
                    throw new Error("Cargo de usuário desconhecido.");
                }
            } else {
                throw new Error("Dados de usuário não encontrados no Firestore.");
            }
        } catch (error) {
            console.error("Erro ao verificar cargo:", error);
            UIService.showLoginError(`Erro de permissão: ${error.message}`);
            UIService.showView('login');
            await this.handleLogout(); 
        }
    },

    async handleLogin(event) {
        event.preventDefault();
        UIService.toggleSpinner('btn-login', true);
        UIService.hideLoginError();
        
        const loginForm = document.getElementById('login-form');
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const rememberMe = document.getElementById('remember-me').checked;

        try {
            await signInWithEmailAndPassword(AppCore.auth, email, password);

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

        } catch (error) {
            UIService.showLoginError("Email ou senha inválidos.");
        } finally {
            UIService.toggleSpinner('btn-login', false);
        }
    },

    async handleLogout() {
        try {
            await signOut(AppCore.auth);
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    }
};