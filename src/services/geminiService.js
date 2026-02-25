
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Define o nome do modelo Gemini a ser utilizado.
const MODEL_NAME = "gemini-pro";
// Obtém a chave da API do Gemini das variáveis de ambiente.
const API_KEY = process.env.GEMINI_API_KEY;

// Verifica se a chave da API foi configurada. Em produção, é crucial que esta chave exista.
if (!API_KEY) {
  console.error("Erro: GEMINI_API_KEY não está configurada no ambiente. O serviço Gemini não funcionará corretamente.");
  // Em um ambiente de produção, considere lançar um erro fatal ou desabilitar a funcionalidade de chat.
}

// Inicializa o cliente da Google Generative AI com a chave da API.
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * @class GeminiService
 * @description Serviço responsável pela interação com a API do Google Gemini para gerar respostas e correções de idioma.
 */
class GeminiService {
  /**
   * @static
   * @function gerarResposta
   * @description Gera uma resposta da IA baseada no histórico de mensagens e no idioma de prática.
   * Inclui lógica para identificar e extrair correções gramaticais/vocabulário da resposta da IA.
   * @param {Array<Object>} historicoMensagens - Histórico de mensagens formatado para a API do Gemini.
   * @param {string} idioma - O idioma que o usuário está praticando.
   * @returns {Object} Um objeto contendo o texto da resposta da IA e qualquer correção identificada.
   * @throws {Error} Se ocorrer um erro durante a comunicação com a API do Gemini.
   */
  static async gerarResposta(historicoMensagens, idioma) {
    try {
      // Obtém o modelo generativo específico.
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      // Inicia um novo chat com o histórico de mensagens fornecido e configurações de geração.
      const chat = model.startChat({
        history: historicoMensagens,
        generationConfig: {
          temperature: 0.9, // Controla a aleatoriedade da resposta. Valores mais altos = mais criatividade.
          topK: 1,          // Amostra de tokens com maior probabilidade.
          topP: 1,          // Amostra de tokens com base na soma de suas probabilidades.
          maxOutputTokens: 2048, // Limite máximo de tokens na resposta da IA.
        },
      });

      // Define o prompt do sistema para guiar o comportamento da IA como tutor de idiomas.
      const prompt = `Você é um tutor de idiomas prestativo e amigável. O usuário está praticando o idioma ${idioma}. Responda à última mensagem do usuário de forma natural e encorajadora. Se houver erros gramaticais, de ortografia ou vocabulário na mensagem do usuário, corrija-os sutilmente e explique brevemente a correção de forma construtiva. Mantenha a conversa fluida e educada. Sua resposta DEVE ser inteiramente em ${idioma}. Se você fizer uma correção, inclua-a no final da sua resposta, formatada como: "Correção: [sua correção aqui]". Se não houver correção, não inclua esta seção.`;

      // Envia o prompt e o histórico de mensagens para a IA e aguarda a resposta.
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      let correction = null;
      // Expressão regular para encontrar a seção de correção na resposta da IA.
      const correctionRegex = /Correção: (.*)/i;
      const match = text.match(correctionRegex);

      // Se uma correção for encontrada, extrai e armazena.
      if (match && match[1]) {
        correction = match[1].trim();
        // Opcional: remover a correção do texto principal se desejar apresentá-la separadamente.
        // text = text.replace(correctionRegex, '').trim();
      }

      return { text, correction };
    } catch (error) {
      console.error("Erro ao gerar resposta do Gemini no serviço:", error);
      throw new Error("Não foi possível obter uma resposta da IA. Por favor, verifique sua chave de API ou tente novamente mais tarde.");
    }
  }
}

module.exports = GeminiService;
