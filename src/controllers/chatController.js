
const chatService = require("../services/chatService");

/**
 * @class ChatController
 * @description Controlador responsável por gerenciar as operações relacionadas ao chat.
 */
class ChatController {
  /**
   * @static
   * @function iniciarChat
   * @description Inicia um novo chat para o usuário autenticado com um idioma específico.
   * @param {Object} req - Objeto de requisição do Express (espera req.usuario.id do middleware de autenticação).
   * @param {Object} res - Objeto de resposta do Express.
   */
  static async iniciarChat(req, res) {
    try {
      const { idioma } = req.body;
      const usuarioId = req.usuario.id; // ID do usuário obtido do token JWT decodificado.

      if (!idioma) {
        return res.status(400).json({ erro: "O idioma é obrigatório para iniciar um chat." });
      }

      const novoChat = await chatService.iniciarNovoChat(usuarioId, idioma);
      res.status(201).json(novoChat);
    } catch (error) {
      console.error("Erro ao iniciar chat:", error);
      res.status(500).json({ erro: "Erro interno do servidor ao iniciar o chat. Por favor, tente novamente mais tarde." });
    }
  }

  /**
   * @static
   * @function enviarMensagem
   * @description Envia uma mensagem para um chat existente e obtém a resposta da IA.
   * @param {Object} req - Objeto de requisição do Express (espera req.usuario.id do middleware de autenticação).
   * @param {Object} res - Objeto de resposta do Express.
   */
  static async enviarMensagem(req, res) {
    try {
      const { chatId } = req.params;
      const { mensagem } = req.body;
      const usuarioId = req.usuario.id; // ID do usuário obtido do token JWT decodificado.

      if (!mensagem) {
        return res.status(400).json({ erro: "A mensagem não pode ser vazia." });
      }

      const resultado = await chatService.enviarMensagem(parseInt(chatId), usuarioId, mensagem);
      res.json(resultado);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      res.status(500).json({ erro: "Erro interno do servidor ao enviar a mensagem. Por favor, tente novamente mais tarde." });
    }
  }

  /**
   * @static
   * @function obterHistoricoChat
   * @description Obtém o histórico de mensagens de um chat específico.
   * @param {Object} req - Objeto de requisição do Express (espera req.usuario.id do middleware de autenticação).
   * @param {Object} res - Objeto de resposta do Express.
   */
  static async obterHistoricoChat(req, res) {
    try {
      const { chatId } = req.params;
      const usuarioId = req.usuario.id; // ID do usuário obtido do token JWT decodificado.

      const historico = await chatService.obterHistoricoChat(parseInt(chatId), usuarioId);
      res.json(historico);
    } catch (error) {
      console.error("Erro ao obter histórico do chat:", error);
      res.status(500).json({ erro: "Erro interno do servidor ao obter o histórico do chat. Por favor, tente novamente mais tarde." });
    }
  }

  /**
   * @static
   * @function obterTodosChatsDoUsuario
   * @description Obtém todos os chats associados a um usuário específico.
   * @param {Object} req - Objeto de requisição do Express (espera req.usuario.id do middleware de autenticação).
   * @param {Object} res - Objeto de resposta do Express.
   */
  static async obterTodosChatsDoUsuario(req, res) {
    try {
      const usuarioId = req.usuario.id; // ID do usuário obtido do token JWT decodificado.
      const chats = await chatService.obterTodosChatsDoUsuario(usuarioId);
      res.json(chats);
    } catch (error) {
      console.error("Erro ao obter todos os chats do usuário:", error);
      res.status(500).json({ erro: "Erro interno do servidor ao obter os chats do usuário. Por favor, tente novamente mais tarde." });
    }
  }
}

module.exports = ChatController;
