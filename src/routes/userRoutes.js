const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const autenticarJWT = require('../middlewares/authMiddleware');

// Rotas de Autenticação ( Públicas )
router.post('/register', userController.registrarUsuario);
router.post('/login', userController.logarUsuario); 

// Rotas Protegidas (Exigem Autenticação)
router.post('/:usuarioId/preferencias', autenticarJWT, userController.adicionarPreferencias);
router.delete('/:usuarioId/preferencias/:preferenciaId', autenticarJWT, userController.removerPreferencia);

// Rota para obter as preferências do usuário (protegida)
router.get('/:usuarioId/preferencias', autenticarJWT, userController.obterPreferenciasDoUsuario);

module.exports = router;