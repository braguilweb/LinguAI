const chatService = require("../services/chatService");

class ChatController {
  static async iniciarChat(req, res) {
    try {
      const { idioma } = req.body;
      const usuarioId = req.usuario.id; // Obtido do JWT

      if (!idioma) {
        return res.status(400).json({ erro: "O idioma é obrigatório para iniciar um chat." });
      }

      const novoChat = await chatService.iniciarNovoChat(usuarioId, idioma);
      res.status(201).json(novoChat);
    } catch (error) {
      console.error("Erro ao iniciar chat:", error);
      res.status(500).json({ erro: "Erro interno do servidor ao iniciar chat." });
    }
  }

  static async enviarMensagem(req, res) {
    try {
      const { chatId } = req.params;
      const { mensagem } = req.body;
      const usuarioId = req.usuario.id; // Obtido do JWT

      if (!mensagem) {
        return res.status(400).json({ erro: "A mensagem não pode ser vazia." });
      }

      const resultado = await chatService.enviarMensagem(parseInt(chatId), usuarioId, mensagem);
      res.json(resultado);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      res.status(500).json({ erro: "Erro interno do servidor ao enviar mensagem." });
    }
  }

  static async obterHistoricoChat(req, res) {
    try {
      const { chatId } = req.params;
      const usuarioId = req.usuario.id; // Obtido do JWT

      const historico = await chatService.obterHistoricoChat(parseInt(chatId), usuarioId);
      res.json(historico);
    } catch (error) {
      console.error("Erro ao obter histórico do chat:", error);
      res.status(500).json({ erro: "Erro interno do servidor ao obter histórico do chat." });
    }
  }

  static async obterTodosChatsDoUsuario(req, res) {
    try {
      const usuarioId = req.usuario.id; // Obtido do JWT
      const chats = await chatService.obterTodosChatsDoUsuario(usuarioId);
      res.json(chats);
    } catch (error) {
      console.error("Erro ao obter todos os chats do usuário:", error);
      res.status(500).json({ erro: "Erro interno do servidor ao obter chats." });
    }
  }
}

module.exports = ChatController;
