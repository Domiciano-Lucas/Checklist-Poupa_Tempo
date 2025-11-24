// Importações de Serviços
import { AppCore } from "./firebaseCore.js";
import { UIService } from "./ui.js";

// Importações do Firebase
import { 
    collection, 
    addDoc, 
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


/**
 * ChecklistService: Cuida da lógica de preenchimento, validação e salvamento.
 */
export const ChecklistService = {
    
    /**
     * Inicia o formulário, resetando campos e definindo o estado inicial.
     * @param {string} type - 'abertura' ou 'fechamento'
     */
    start(type) {
        AppCore.currentChecklistType = type;
        
        // Atualiza o título visualmente
        document.getElementById('checklist-title').textContent = `Checklist de ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        // 1. Reseta o formulário HTML nativo
        document.getElementById('checklist-form').reset();
        
        // 2. Reseta campos condicionais (esconde os selects amarelos)
        UIService.resetConditionalFields();
        
        // 3. Reseta erros visuais anteriores
        UIService.hideChecklistError();
        document.querySelectorAll('.field-error-msg').forEach(el => el.classList.add('hidden'));

        // 4. Lógica Específica do Toggle de 3 Estados (Salas)
        // Força todos para o estado "indefinido" (o input do meio) ao abrir
        const salas = ['sala_medica', 'sala_reuniao', 'sala_teorico', 'sala_adm'];
        salas.forEach(sala => {
            const neutralInput = document.getElementById(`${sala}_neutro`);
            if (neutralInput) neutralInput.checked = true;
        });
        
        // Exibe a tela
        UIService.showTecnicoView('checklist');
    },

    /**
     * Coleta os dados brutos do formulário.
     */
    getFormData() {
        const formData = new FormData(document.getElementById('checklist-form'));
        
        // Mapeamento dos campos
        const items = {
            computadores: formData.get('item_computadores'),
            computadoresMotivo: formData.get('item_computadores_motivo'),
            
            contagemEquip: formData.get('item_contagem'),
            contagemMotivo: formData.get('item_contagem_motivo'),
            
            totemLigado: formData.get('item_totem_ligado'),
            totemMotivo: formData.get('item_totem_motivo'),
            
            tabletCorpOk: formData.get('item_tablet_corp_ok'),
            tabletCorpMotivo: formData.get('item_tablet_corp_motivo'),
            tabletCorpPosse: formData.get('item_tablet_corp_posse'),
            
            celularCorpOk: formData.get('item_celular_corp_ok'),
            celularCorpMotivo: formData.get('item_celular_corp_motivo'),
            celularCorpPosse: formData.get('item_celular_corp_posse'),
            
            celularTicOk: formData.get('item_celular_tic_ok'),
            celularTicMotivo: formData.get('item_celular_tic_motivo'),
            celularTicPosse: formData.get('item_celular_tic_posse'),
            
            // Novos valores: 'aberta', 'fechada' ou 'indefinido'
            salaMedica: formData.get('item_sala_medica'),
            salaReuniao: formData.get('item_sala_reuniao'),
            salaTeorico: formData.get('item_sala_teorico'),
            salaAdm: formData.get('item_sala_adm'),
            
            chavesPosse: formData.get('item_chaves_posse'),
            pendencia: formData.get('item_pendencia') // Agora obrigatório
        };
        return items;
    },

    /**
     * Processa o envio do formulário com validações rigorosas.
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        // UI: Ativa spinner e limpa erros globais
        UIService.toggleSpinner('btn-salvar', true);
        UIService.hideChecklistError(); 
        
        // UI: Limpa erros específicos (mensagens vermelhas abaixo dos campos)
        document.querySelectorAll('.field-error-msg').forEach(el => el.classList.add('hidden'));

        const form = document.getElementById('checklist-form');
        const items = this.getFormData(); 
        let hasError = false;

        // ======================================================
        // 1. VALIDAÇÃO DE CAMPOS CONDICIONAIS (Lógica antiga)
        // ======================================================
        // Verifica se selecionou "Não/Outra" mas não preencheu o motivo
        if (items.computadores === 'outra' && items.computadoresMotivo === 'na') hasError = true;
        if (items.contagemEquip === 'nao' && items.contagemMotivo === 'na') hasError = true;
        if (items.totemLigado === 'nao' && items.totemMotivo === 'na') hasError = true;
        if (items.tabletCorpOk === 'nao' && items.tabletCorpMotivo === 'na') hasError = true;
        if (items.celularCorpOk === 'nao' && items.celularCorpMotivo === 'na') hasError = true;
        if (items.celularTicOk === 'nao' && items.celularTicMotivo === 'na') hasError = true;

        if (hasError) {
            // Erro genérico para condicionais (UI Service exibe no topo)
            UIService.showChecklistError("Por favor, selecione o MOTIVO para os itens com problemas.");
            UIService.toggleSpinner('btn-salvar', false);
            return;
        }

        // ======================================================
        // 2. VALIDAÇÃO DAS SALAS (Nova lógica 3-estados)
        // ======================================================
        // Se o valor for 'indefinido', mostra o erro específico naquele campo
        
        const validateRoom = (value, containerId) => {
            if (value === 'indefinido' || !value) {
                const container = document.getElementById(containerId);
                // Remove a classe 'hidden' da mensagem de erro dentro deste container
                container.querySelector('.field-error-msg').classList.remove('hidden');
                return true; // Retorna true se houver erro
            }
            return false;
        };

        let roomError = false;
        if (validateRoom(items.salaMedica, 'container_sala_medica')) roomError = true;
        if (validateRoom(items.salaReuniao, 'container_sala_reuniao')) roomError = true;
        if (validateRoom(items.salaTeorico, 'container_sala_teorico')) roomError = true;
        if (validateRoom(items.salaAdm, 'container_sala_adm')) roomError = true;

        // ======================================================
        // 3. VALIDAÇÃO DE PENDÊNCIAS (Obrigatório)
        // ======================================================
        if (!items.pendencia || items.pendencia.trim() === "") {
            document.getElementById('error_pendencia').classList.remove('hidden');
            roomError = true;
        }

        // ======================================================
        // 4. VALIDAÇÃO HTML5 GERAL
        // ======================================================
        // checkValidity pega campos 'required' vazios (como os radio buttons normais)
        if (!form.checkValidity() || roomError) {
            UIService.showChecklistError("Obrigatório preencher todos os campos. Verifique as mensagens em vermelho.");
            UIService.toggleSpinner('btn-salvar', false);
            return; 
        }
        
        try {
            // ===== DATA REFERÊNCIA (Fuso Horário Local) =====
            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
            const dia = hoje.getDate().toString().padStart(2, '0');
            const dataReferenciaLocal = `${ano}-${mes}-${dia}`; // "YYYY-MM-DD"
            // ===================================================

            // ===== LÓGICA DE OCORRÊNCIA (Abertura vs Fechamento) =====
            // Abertura: Sala FECHADA é problema.
            // Fechamento: Sala ABERTA é problema.
            const isAbertura = AppCore.currentChecklistType === 'abertura';
            
            const checkSalaOcorrencia = (statusSala) => {
                if (isAbertura && statusSala === 'fechada') return true;
                if (!isAbertura && statusSala === 'aberta') return true; // Fechamento
                return false;
            };

            const possuiOcorrencia = (
                items.computadores === 'outra' || 
                items.contagemEquip === 'nao' ||
                items.totemLigado === 'nao' || 
                items.tabletCorpOk === 'nao' ||
                items.celularCorpOk === 'nao' || 
                items.celularTicOk === 'nao' ||
                // Checagem dinâmica das salas
                checkSalaOcorrencia(items.salaMedica) ||
                checkSalaOcorrencia(items.salaReuniao) ||
                checkSalaOcorrencia(items.salaTeorico) ||
                checkSalaOcorrencia(items.salaAdm) ||
                // Pendência que não seja "n/a" ou "na"
                (items.pendencia.toLowerCase() !== 'n/a' && items.pendencia.toLowerCase() !== 'na' && items.pendencia.trim().length > 3)
            );

            // Objeto final para o Firestore
            const checklistDocument = {
                tecnicoId: AppCore.currentUser.uid,
                tecnicoNome: AppCore.currentUser.nome,
                unidadeId: AppCore.currentUser.unidadeId, 
                unidadeNome: AppCore.currentUser.unidadeNome, 
                tipo: AppCore.currentChecklistType,
                timestamp: serverTimestamp(),
                dataReferencia: dataReferenciaLocal,
                possuiOcorrencia: possuiOcorrencia,
                itens: items
            };

            // Salva no banco
            await addDoc(collection(AppCore.db, "checklists"), checklistDocument);
            
            // Feedback de sucesso
            UIService.successMessage.style.display = 'flex';

        } catch (error) {
            console.error("Erro ao salvar o checklist: ", error);
            UIService.showChecklistError("Erro ao salvar no banco de dados. Tente novamente.");
        } finally {
            UIService.toggleSpinner('btn-salvar', false);
        }
    }
};