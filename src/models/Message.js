const db = require("../../config/database");

class Message {
  static async createMessage(chatId, sender, content, correction = null) {
    try {
      const res = await db.query(
        "INSERT INTO mensagens (chat_id, remetente, conteudo, correcao) VALUES ($1, $2, $3, $4) RETURNING *",
        [chatId, sender, content, correction]
      );
      return res.rows[0];
    } catch (error) {
      console.error("Erro ao criar mensagem:", error);
      throw error;
    }
  }

  static async getMessagesByChatId(chatId) {
    try {
      const res = await db.query(
        "SELECT * FROM mensagens WHERE chat_id = $1 ORDER BY data_envio ASC",
        [chatId]
      );
      return res.rows;
    } catch (error) {
      console.error("Erro ao obter mensagens por chat ID:", error);
      throw error;
    }
  }
}

module.exports = Message;
