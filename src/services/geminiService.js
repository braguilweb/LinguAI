const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY não está configurada no ambiente.");
  // Em um ambiente de produção, você pode querer lançar um erro ou sair do processo.
}

const genAI = new GoogleGenerativeAI(API_KEY);

class GeminiService {
  static async gerarResposta(historicoMensagens, idioma) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const chat = model.startChat({
        history: historicoMensagens,
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      });

      const prompt = `Você é um tutor de idiomas. O usuário está praticando ${idioma}. Responda à última mensagem do usuário. Se houver erros gramaticais ou de vocabulário, corrija-os e explique brevemente a correção. Mantenha a conversa fluida e educada. Sua resposta deve ser em ${idioma}.`;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      // Lógica para extrair correção (se houver) - pode ser mais sofisticada
      let correction = null;
      const correctionRegex = /Correção: (.*)/i;
      const match = text.match(correctionRegex);
      if (match && match[1]) {
        correction = match[1].trim();
      }

      return { text, correction };
    } catch (error) {
      console.error("Erro ao gerar resposta do Gemini:", error);
      throw error;
    }
  }
}

module.exports = GeminiService;
