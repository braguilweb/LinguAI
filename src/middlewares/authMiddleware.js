
const jwt = require("jsonwebtoken");
// Chave secreta para verificar tokens JWT, obtida das variáveis de ambiente.
const SECRET_KEY = process.env.JWT_SECRET;

/**
 * @function autenticarJWT
 * @description Middleware para autenticar requisições usando JSON Web Tokens (JWT).
 * Verifica a presença e validade de um token JWT no cookie da requisição.
 * Se o token for válido, adiciona o ID do usuário ao objeto `req` e passa para o próximo middleware/rota.
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 * @param {Function} next - Função para passar o controle para o próximo middleware.
 */
const autenticarJWT = (req, res, next) => {
    // Tenta obter o token JWT do cookie da requisição.
    const token = req.cookies.token;

    // Se não houver token, retorna um erro de não autorizado.
    if (!token) {
        return res.status(401).json({ erro: "Acesso negado. Token de autenticação não fornecido." });
    }

    try {
        // Verifica a validade do token usando a chave secreta.
        const decoded = jwt.verify(token, SECRET_KEY);

        // Adiciona o ID do usuário decodificado ao objeto de requisição para uso posterior nas rotas.
        req.usuario = { id: decoded.usuarioId };

        // Chama o próximo middleware ou a função de rota.
        next();
    } catch (error) {
        console.error("Erro ao autenticar token JWT:", error);
        // Retorna um erro de proibido se o token for inválido ou expirado.
        return res.status(403).json({ erro: "Token de autenticação inválido ou expirado. Por favor, faça login novamente." });
    }
};

module.exports = autenticarJWT;
