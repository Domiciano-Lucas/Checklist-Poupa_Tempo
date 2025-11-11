const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Inicializa o app Firebase (no lado do servidor)
admin.initializeApp();

// Pega a referência do banco de dados
const db = admin.firestore();

/**
 * @name getChecklists
 * Esta é a nossa Cloud Function "tradutora" (versão v1).
 * Ela lê todos os documentos da coleção 'checklists' e os retorna como JSON.
 */
exports.getChecklists = functions.https.onRequest((request, response) => {
  // Envolve a função com o 'cors' para lidar com permissões de acesso
  cors(request, response, async () => {
    try {
      // 1. Faz a consulta (query) para buscar todos os checklists
      const checklistsRef = db.collection("checklists");
      const snapshot = await checklistsRef.get();

      // 2. Verifica se a coleção está vazia
      if (snapshot.empty) {
        console.log("Nenhum checklist encontrado.");
        response.status(200).json([]); // Retorna um array vazio
        return;
      }

      // 3. Formata os dados para o Power BI
      const checklists = [];
      snapshot.forEach((doc) => {
        const data = doc.data();

        // "Achata" os dados para o Power BI entender melhor
        checklists.push({
          documentId: doc.id,
          tecnicoId: data.tecnicoId,
          tecnicoNome: data.tecnicoNome,
          unidadeId: data.unidadeId,
          unidadeNome: data.unidadeNome,
          tipo: data.tipo,
          possuiOcorrencia: data.possuiOcorrencia,
          // Converte o Timestamp do Firestore para uma data legível
          dataHora: data.timestamp.toDate().toISOString(),
          dataReferencia: data.dataReferencia,

          // Itens do Checklist "achatados"
          item_computadores: data.itens.computadores,
          item_computadores_motivo: data.itens.computadoresMotivo,
          item_contagem: data.itens.contagemEquip,
          item_contagem_motivo: data.itens.contagemMotivo,
          item_totem: data.itens.totemLigado,
          item_totem_motivo: data.itens.totemMotivo,
          item_tablet_ok: data.itens.tabletCorpOk,
          item_tablet_motivo: data.itens.tabletCorpMotivo,
          item_tablet_posse: data.itens.tabletCorpPosse,
          item_celular_corp_ok: data.itens.celularCorpOk,
          item_celular_corp_motivo: data.itens.celularCorpMotivo,
          item_celular_corp_posse: data.itens.celularCorpPosse,
          item_celular_tic_ok: data.itens.celularTicOk,
          item_celular_tic_motivo: data.itens.celularTicMotivo,
          item_celular_tic_posse: data.itens.celularTicPosse,
          item_sala_medica: data.itens.salaMedica,
          item_sala_reuniao: data.itens.salaReuniao,
          item_sala_teorico: data.itens.salaTeorico,
          item_sala_adm: data.itens.salaAdm,
          item_chaves_posse: data.itens.chavesPosse,
          item_pendencia: data.itens.pendencia,
        });
      });

      // 4. Envia os dados formatados como JSON
      console.log(`Enviando ${checklists.length} checklists.`);
      response.status(200).json(checklists);
    } catch (error) {
      console.error("Erro ao buscar checklists: ", error);
      response.status(500).send("Erro interno do servidor.");
    }
  });
});