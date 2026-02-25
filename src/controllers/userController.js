
const usuarioService = require('../services/usuarioService');
const jwt = require('jsonwebtoken');

// Chave secreta para assinar e verificar tokens JWT, obtida das variáveis de ambiente.
const SECRET_KEY = process.env.JWT_SECRET;

/**
 * @function registrarUsuario
 * @description Controla o registro de novos usuários.
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 */
const registrarUsuario = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        // Define uma foto de perfil padrão se nenhuma for fornecida.
        const fotoPerfil = req.body.fotoPerfil || 'https://avatars.githubusercontent.com/u/80931364?v=4';

        // TODO: Adicionar validações mais robustas para nome, email e senha.

        const resultado = await usuarioService.criarUsuario(nome, email, senha, fotoPerfil);
        if (resultado.erro) {
            // Retorna erro 400 se o serviço indicar um problema (ex: email já cadastrado).
            return res.status(400).json({ erro: resultado.erro });
        }
        // Retorna sucesso 201 com a mensagem e os dados do usuário criado.
        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', usuario: resultado.usuario });

    } catch (erro) {
        console.error('Erro ao registrar usuário:', erro);
        // Retorna erro 500 para problemas internos do servidor.
        res.status(500).json({ erro: 'Erro interno do servidor ao cadastrar usuário. Por favor, tente novamente mais tarde.' });
    }
};

/**
 * @function logarUsuario
 * @description Controla o processo de login de usuários e geração de token JWT.
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 */
const logarUsuario = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // TODO: Adicionar validações para email e senha.

        const resultado = await usuarioService.autenticarUsuario(email, senha);

        if (resultado.usuario) {
            // Gera um token JWT com o ID do usuário e expiração de 1 hora.
            const token = jwt.sign({ usuarioId: resultado.usuario.id }, SECRET_KEY, { expiresIn: '1h' });

            // Define o cookie HttpOnly e Secure para o token JWT.
            res.cookie('token', token, {
                httpOnly: true, // Impede o acesso ao cookie via JavaScript, aumentando a segurança.
                secure: process.env.NODE_ENV === 'production', // Apenas envia o cookie em HTTPS em produção.
                maxAge: 3600000 // Tempo de expiração do cookie em milissegundos (1 hora).
            });

            // Retorna mensagem de sucesso, dados do usuário e o token (para uso no frontend, se necessário).
            res.json({
                mensagem: 'Login realizado com sucesso!',
                usuario: resultado.usuario,
                token: token // O token é enviado no corpo da resposta para facilitar o uso no frontend, mas o cookie é a forma principal de autenticação.
            });

        } else {
            // Retorna erro 401 se a autenticação falhar (credenciais inválidas).
            return res.status(401).json({ erro: resultado.erro });
        }

    } catch (erro) {
        console.error('Erro ao logar usuário:', erro);
        // Retorna erro 500 para problemas internos do servidor.
        res.status(500).json({ erro: 'Erro interno do servidor ao realizar o login. Por favor, tente novamente mais tarde.' });
    }
};

/**
 * @function adicionarPreferencias
 * @description Adiciona preferências a um usuário autenticado.
 * @param {Object} req - Objeto de requisição do Express (espera req.usuario.id do middleware de autenticação).
 * @param {Object} res - Objeto de resposta do Express.
 */
const adicionarPreferencias = async (req, res) => {
    try {
        // O ID do usuário é obtido do token JWT decodificado pelo middleware de autenticação.
        const usuarioId = req.usuario.id;
        const { preferenciasIds } = req.body; // Array de IDs de preferências a serem adicionadas.

        if (!preferenciasIds || !Array.isArray(preferenciasIds) || preferenciasIds.length === 0) {
            return res.status(400).json({ erro: 'É necessário fornecer um array de IDs de preferências válido.' });
        }

        const resultado = await usuarioService.adicionarPreferenciasAoUsuario(usuarioId, preferenciasIds);

        if (resultado.erro) {
            // Retorna erro 400 se o serviço indicar um problema (ex: preferência inválida).
            return res.status(400).json({
                erro: resultado.erro,
                preferenciasInvalidas: resultado.preferenciasInvalidas,
                preferenciasAdicionadas: resultado.preferenciasAdicionadas
            });
        }

        // Retorna sucesso com a mensagem.
        res.json({ mensagem: resultado.mensagem });
    } catch (error) {
        console.error('Erro ao adicionar preferências:', error);
        res.status(500).json({ erro: 'Erro interno do servidor ao adicionar preferências. Por favor, tente novamente mais tarde.' });
    }
};

/**
 * @function removerPreferencia
 * @description Remove uma preferência de um usuário autenticado.
 * @param {Object} req - Objeto de requisição do Express (espera req.usuario.id do middleware de autenticação).
 * @param {Object} res - Objeto de resposta do Express.
 */
const removerPreferencia = async (req, res) => {
    try {
        // O ID do usuário é obtido do token JWT decodificado pelo middleware de autenticação.
        const usuarioId = req.usuario.id;
        const { preferenciaId } = req.params; // ID da preferência a ser removida, vindo dos parâmetros da URL.

        if (!preferenciaId) {
            return res.status(400).json({ erro: 'É necessário fornecer o ID da preferência a ser removida.' });
        }

        await usuarioService.removerPreferenciaDoUsuario(usuarioId, preferenciaId);
        // Retorna sucesso com a mensagem.
        res.json({ mensagem: 'Preferência removida com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover preferência:', error);
        res.status(500).json({ erro: 'Erro interno do servidor ao remover preferência. Por favor, tente novamente mais tarde.' });
    }
};

/**
 * @function obterPreferenciasDoUsuario
 * @description Obtém todas as preferências de um usuário autenticado.
 * @param {Object} req - Objeto de requisição do Express (espera req.usuario.id do middleware de autenticação).
 * @param {Object} res - Objeto de resposta do Express.
 */
const obterPreferenciasDoUsuario = async (req, res) => {
    try {
        // O ID do usuário é obtido do token JWT decodificado pelo middleware de autenticação.
        const usuarioId = req.usuario.id;

        const preferencias = await usuarioService.obterPreferenciasDoUsuario(usuarioId);
        // Retorna as preferências encontradas.
        res.json(preferencias);
    } catch (error) {
        console.error('Erro ao obter preferências do usuário:', error);
        res.status(500).json({ erro: 'Erro interno do servidor ao obter preferências. Por favor, tente novamente mais tarde.' });
    }
};

module.exports = {
    registrarUsuario,
    logarUsuario,
    adicionarPreferencias,
    removerPreferencia,
    obterPreferenciasDoUsuario
};
