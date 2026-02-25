const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const autenticarJWT = require("../middlewares/authMiddleware");

// Rota para iniciar um novo chat
router.post("/iniciar", autenticarJWT, chatController.iniciarChat);

// Rota para enviar uma mensagem em um chat existente
router.post("/:chatId/mensagem", autenticarJWT, chatController.enviarMensagem);

// Rota para obter o histórico de mensagens de um chat
router.get("/:chatId/historico", autenticarJWT, chatController.obterHistoricoChat);

// Rota para obter todos os chats de um usuário
router.get("/", autenticarJWT, chatController.obterTodosChatsDoUsuario);

module.exports = router;
