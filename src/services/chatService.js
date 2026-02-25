
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const geminiService = require("./geminiService");

/**
 * @class ChatService
 * @description Serviço responsável pela lógica de negócios relacionada aos chats, incluindo criação, envio de mensagens e recuperação de histórico.
 */
class ChatService {
  /**
   * @static
   * @function iniciarNovoChat
   * @description Inicia um novo chat para um usuário com um idioma especificado e adiciona uma mensagem inicial da IA.
   * @param {number} usuarioId - O ID do usuário que está iniciando o chat.
   * @param {string} idioma - O idioma selecionado para o chat.
   * @returns {Object} O objeto do novo chat criado.
   * @throws {Error} Se ocorrer um erro ao criar o chat ou a mensagem inicial.
   */
  static async iniciarNovoChat(usuarioId, idioma) {
    try {
      const novoChat = await Chat.criarChat(usuarioId, idioma);
      // Adiciona uma mensagem inicial da IA para guiar o usuário.
      const mensagemInicialIA = `Olá! Sou seu assistente de idiomas em ${idioma}. Como posso ajudar você a praticar hoje?`;
      await Message.createMessage(novoChat.id, "ia", mensagemInicialIA);
      return novoChat;
    } catch (error) {
      console.error("Erro ao iniciar novo chat no serviço:", error);
      throw new Error("Não foi possível iniciar um novo chat. Por favor, tente novamente.");
    }
  }

  /**
   * @static
   * @function enviarMensagem
   * @description Envia uma mensagem do usuário para um chat, obtém a resposta da IA e salva ambas as mensagens.
   * @param {number} chatId - O ID do chat ao qual a mensagem pertence.
   * @param {number} usuarioId - O ID do usuário que enviou a mensagem.
   * @param {string} conteudoMensagem - O conteúdo da mensagem enviada pelo usuário.
   * @returns {Object} Um objeto contendo a mensagem do usuário, a resposta da IA e a correção (se houver).
   * @throws {Error} Se o chat não for encontrado, não pertencer ao usuário ou se houver um erro na comunicação com a IA.
   */
  static async enviarMensagem(chatId, usuarioId, conteudoMensagem) {
    try {
      const chat = await Chat.obterChatPorId(chatId, usuarioId);
      if (!chat) {
        throw new Error("Chat não encontrado ou não pertence ao usuário.");
      }

      // Salva a mensagem enviada pelo usuário no banco de dados.
      await Message.createMessage(chatId, "usuario", conteudoMensagem);

      // Obtém o histórico completo de mensagens para enviar à API do Gemini, mantendo o contexto da conversa.
      const historicoMensagens = await Message.getMessagesByChatId(chatId);
      const historicoParaGemini = historicoMensagens.map(msg => ({
        role: msg.remetente === "usuario" ? "user" : "model",
        parts: [{ text: msg.conteudo }]
      }));

      // Chama o serviço Gemini para gerar uma resposta baseada no histórico e idioma do chat.
      const respostaIA = await geminiService.gerarResposta(historicoParaGemini, chat.idioma);

      // Salva a resposta da IA no banco de dados, incluindo a correção se fornecida.
      await Message.createMessage(chatId, "ia", respostaIA.text, respostaIA.correction);

      // Retorna a mensagem do usuário, a resposta da IA e a correção para o controlador.
      return { usuario: conteudoMensagem, ia: respostaIA.text, correction: respostaIA.correction };
    } catch (error) {
      console.error("Erro ao enviar mensagem no serviço:", error);
      throw new Error("Não foi possível enviar a mensagem ou obter resposta da IA. Por favor, tente novamente.");
    }
  }

  /**
   * @static
   * @function obterHistoricoChat
   * @description Obtém o histórico de mensagens de um chat específico para um determinado usuário.
   * @param {number} chatId - O ID do chat cujo histórico será recuperado.
   * @param {number} usuarioId - O ID do usuário proprietário do chat.
   * @returns {Array<Object>} Um array de objetos de mensagem, representando o histórico do chat.
   * @throws {Error} Se o chat não for encontrado ou não pertencer ao usuário.
   */
  static async obterHistoricoChat(chatId, usuarioId) {
    try {
      const chat = await Chat.obterChatPorId(chatId, usuarioId);
      if (!chat) {
        throw new Error("Chat não encontrado ou não pertence ao usuário.");
      }
      // Retorna todas as mensagens associadas ao chatId.
      return Message.getMessagesByChatId(chatId);
    } catch (error) {
      console.error("Erro ao obter histórico do chat no serviço:", error);
      throw new Error("Não foi possível obter o histórico do chat. Por favor, tente novamente.");
    }
  }

  /**
   * @static
   * @function obterTodosChatsDoUsuario
   * @description Obtém uma lista de todos os chats associados a um usuário.
   * @param {number} usuarioId - O ID do usuário.
   * @returns {Array<Object>} Um array de objetos de chat.
   * @throws {Error} Se ocorrer um erro ao buscar os chats do usuário.
   */
  static async obterTodosChatsDoUsuario(usuarioId) {
    try {
      return Chat.obterChatsPorUsuario(usuarioId);
    } catch (error) {
      console.error("Erro ao obter todos os chats do usuário no serviço:", error);
      throw new Error("Não foi possível obter os chats do usuário. Por favor, tente novamente.");
    }
  }
}

module.exports = ChatService;
