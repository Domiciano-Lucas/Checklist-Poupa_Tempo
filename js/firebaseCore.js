// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ======================================================
// 1. CONFIGURAÇÃO FIREBASE
// ======================================================
const firebaseConfig = {
    apiKey: "AIzaSyCV97jMnn51ilgF5j-fpdTzR-c9MY19B-k",
    authDomain: "checklist-poupatempo.firebaseapp.com",
    projectId: "checklist-poupatempo",
    storageBucket: "checklist-poupatempo.firebasestorage.app",
    messagingSenderId: "470875876173",
    appId: "1:470875876173:web:b5138e359bacf0e091a504"
};

// ======================================================
// 2. MÓDULO DE SERVIÇO PRINCIPAL
// ======================================================

/**
 * AppCore: Guarda o estado central e os serviços do Firebase.
 */
export const AppCore = {
    db: null,
    auth: null,
    currentUser: null, 
    currentChecklistType: null,

    init() {
        try {
            const app = initializeApp(firebaseConfig);
            AppCore.db = getFirestore(app);
            AppCore.auth = getAuth(app);
            setLogLevel('debug');
            console.log("Firebase inicializado com sucesso.");
            return true;
        } catch (error) {
            console.error("Erro na inicialização do Firebase:", error);
            // O UIService será importado no main.js para lidar com o erro
            return false;
        }
    }
};