const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController') //Importar o controller quendo for criado

//Rota para registro do usuário
router.post('/register', userController.registrarUsuario);

//Rota para login de usuário
router.post('/login', userController.logarUsuario);

//Rota para adicionar preferencia
router.post('/usuarios/:usuarioId/preferencias', userController.adicionarPreferencias);

//Rota para deletar preferencia
router.delete('/usuarios/:usuarioId/preferencias/:preferenciaId', userController.removerPreferencia);

module.exports = router

