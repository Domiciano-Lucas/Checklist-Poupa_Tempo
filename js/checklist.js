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
 * ChecklistService: Cuida da lógica de preenchimento e salvamento.
 */
export const ChecklistService = {
    start(type) {
        AppCore.currentChecklistType = type;
        document.getElementById('checklist-title').textContent = `Checklist de ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        document.getElementById('checklist-form').reset();
        UIService.resetConditionalFields();
        
        const salas = ['medica', 'reuniao', 'teorico', 'adm'];
        const [opt1Text, opt2Text] = (type === 'abertura') ? ['ABERTA', 'FECHADA'] : ['FECHADA', 'ABERTA'];
        
        salas.forEach(sala => {
            document.getElementById(`label_sala_${sala}_1`).textContent = opt1Text;
            document.getElementById(`label_sala_${sala}_2`).textContent = opt2Text;
        });
        
        UIService.showTecnicoView('checklist');
    },

    getFormData() {
        const formData = new FormData(document.getElementById('checklist-form'));
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
            salaMedica: formData.get('item_sala_medica'),
            salaReuniao: formData.get('item_sala_reuniao'),
            salaTeorico: formData.get('item_sala_teorico'),
            salaAdm: formData.get('item_sala_adm'),
            chavesPosse: formData.get('item_chaves_posse'),
            pendencia: formData.get('item_pendencia')
        };
        return items;
    },

    async handleSubmit(event) {
        event.preventDefault();
        UIService.toggleSpinner('btn-salvar', true);
        UIService.hideChecklistError(); 

        const form = document.getElementById('checklist-form');
        const items = this.getFormData(); 
        let validationError = null;

        // 1. Validação de campos 'required' visíveis
        if (!form.checkValidity()) {
            validationError = "Erro: Por favor, preencha todos os campos obrigatórios.";
        }
        
        // 2. Validação CONDICIONAL
        if (!validationError) {
            if (items.computadores === 'outra' && items.computadoresMotivo === 'na') {
                validationError = "Por favor, selecione o motivo para 'Computadores'.";
            } else if (items.contagemEquip === 'nao' && items.contagemMotivo === 'na') {
                validationError = "Por favor, selecione o motivo para 'Contagem de Equipamentos'.";
            } else if (items.totemLigado === 'nao' && items.totemMotivo === 'na') {
                validationError = "Por favor, selecione o motivo da falha do 'Totem'.";
            } else if (items.tabletCorpOk === 'nao' && items.tabletCorpMotivo === 'na') {
                validationError = "Por favor, selecione o motivo para 'Tablet Corporativo'.";
            } else if (items.celularCorpOk === 'nao' && items.celularCorpMotivo === 'na') {
                validationError = "Por favor, selecione o motivo para 'Celular Corporativo'.";
            } else if (items.celularTicOk === 'nao' && items.celularTicMotivo === 'na') {
                validationError = "Por favor, selecione o motivo para 'Celular TIC'.";
            }
        }

        if (validationError) {
            UIService.showChecklistError(validationError);
            UIService.toggleSpinner('btn-salvar', false);
            return; 
        }
        
        try {
            // ===== CORREÇÃO DO FUSO HORÁRIO APLICADA AQUI =====
            const hoje = new Date(); // Pega a data/hora local (ex: 13/11 00:30 GMT-0300)
            const ano = hoje.getFullYear();
            const mes = (hoje.getMonth() + 1).toString().padStart(2, '0'); // +1 pois getMonth() é 0-11
            const dia = hoje.getDate().toString().padStart(2, '0');
            const dataReferenciaLocal = `${ano}-${mes}-${dia}`; // Formato "YYYY-MM-DD" (ex: "2025-11-13")
            // ===================================================

            const pendenciaTexto = items.pendencia || "";
            const possuiOcorrencia = (
                items.computadores === 'outra' || items.contagemEquip === 'nao' ||
                items.totemLigado === 'nao' || items.tabletCorpOk === 'nao' ||
                items.celularCorpOk === 'nao' || items.celularTicOk === 'nao' ||
                items.salaMedica === 'opt2' || items.salaReuniao === 'opt2' ||
                items.salaTeorico === 'opt2' || items.salaAdm === 'opt2' ||
                (pendenciaTexto.trim().length > 3)
            );

            const checklistDocument = {
                tecnicoId: AppCore.currentUser.uid,
                tecnicoNome: AppCore.currentUser.nome,
                unidadeId: AppCore.currentUser.unidadeId, 
                unidadeNome: AppCore.currentUser.unidadeNome, 
                tipo: AppCore.currentChecklistType,
                timestamp: serverTimestamp(), // O timestamp do Firebase ainda será UTC (o que é bom)
                dataReferencia: dataReferenciaLocal, // <-- MAS a nossa data de filtro será a local
                possuiOcorrencia: possuiOcorrencia,
                itens: items
            };

            await addDoc(collection(AppCore.db, "checklists"), checklistDocument);
            
            UIService.successMessage.style.display = 'flex';

        } catch (error) {
            console.error("Erro ao salvar o checklist: ", error);
            UIService.showChecklistError("Erro ao salvar no banco de dados.");
        } finally {
            UIService.toggleSpinner('btn-salvar', false);
        }
    }
};