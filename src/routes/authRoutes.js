const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController') //Importar o controller quendo for criado

//Rota para registro do usuário
router.post('/register', userController.registrarUsuario);

//Rota para login de usuário
router.post('/login', userController.logarUsuario);

module.exports = router

