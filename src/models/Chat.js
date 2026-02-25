const db = require('../../config/database');

class Chat {
    static async criarChat(usuarioId, idioma) {
        try {
            const res = await db.query(
                'INSERT INTO chats (usuario_id, idioma) VALUES ($1, $2) RETURNING *',
                [usuarioId, idioma]
            );
            return res.rows[0];
        } catch (error) {
            console.error('Erro ao criar chat:', error);
            throw error;
        }
    }

    static async obterChatsPorUsuario(usuarioId) {
        try {
            const res = await db.query(
                'SELECT * FROM chats WHERE usuario_id = $1 ORDER BY data_criacao DESC',
                [usuarioId]
            );
            return res.rows;
        } catch (error) {
            console.error('Erro ao obter chats por usuário:', error);
            throw error;
        }
    }

    static async obterChatPorId(chatId, usuarioId) {
        try {
            const res = await db.query(
                'SELECT * FROM chats WHERE id = $1 AND usuario_id = $2',
                [chatId, usuarioId]
            );
            return res.rows[0];
        } catch (error) {
            console.error('Erro ao obter chat por ID:', error);
            throw error;
        }
    }
}

module.exports = Chat;
