const Chat = require("../models/Chat");
const Message = require("../models/Message");
const geminiService = require("./geminiService");

class ChatService {
  static async iniciarNovoChat(usuarioId, idioma) {
    try {
      const novoChat = await Chat.criarChat(usuarioId, idioma);
      // Adicionar mensagem inicial da IA
      const mensagemInicialIA = `Olá! Sou seu assistente de idiomas em ${idioma}. Como posso ajudar você a praticar hoje?`;
      await Message.createMessage(novoChat.id, "ia", mensagemInicialIA);
      return novoChat;
    } catch (error) {
      console.error("Erro ao iniciar novo chat:", error);
      throw error;
    }
  }

  static async enviarMensagem(chatId, usuarioId, conteudoMensagem) {
    try {
      const chat = await Chat.obterChatPorId(chatId, usuarioId);
      if (!chat) {
        throw new Error("Chat não encontrado ou não pertence ao usuário.");
      }

      // Salvar mensagem do usuário
      await Message.createMessage(chatId, "usuario", conteudoMensagem);

      // Obter histórico de mensagens para enviar à IA
      const historicoMensagens = await Message.getMessagesByChatId(chatId);
      const historicoParaGemini = historicoMensagens.map(msg => ({
        role: msg.remetente === "usuario" ? "user" : "model",
        parts: [{ text: msg.conteudo }]
      }));

      // Chamar a API do Gemini
      const respostaIA = await geminiService.gerarResposta(historicoParaGemini, chat.idioma);

      // Salvar resposta da IA
      await Message.createMessage(chatId, "ia", respostaIA.text, respostaIA.correction);

      return { usuario: conteudoMensagem, ia: respostaIA.text, correction: respostaIA.correction };
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      throw error;
    }
  }

  static async obterHistoricoChat(chatId, usuarioId) {
    try {
      const chat = await Chat.obterChatPorId(chatId, usuarioId);
      if (!chat) {
        throw new Error("Chat não encontrado ou não pertence ao usuário.");
      }
      return Message.getMessagesByChatId(chatId);
    } catch (error) {
      console.error("Erro ao obter histórico do chat:", error);
      throw error;
    }
  }

  static async obterTodosChatsDoUsuario(usuarioId) {
    try {
      return Chat.obterChatsPorUsuario(usuarioId);
    } catch (error) {
      console.error("Erro ao obter todos os chats do usuário:", error);
      throw error;
    }
  }
}

module.exports = ChatService;
