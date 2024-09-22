const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;


const autenticarJWT = (req, res, next) => {
    // Obter o token do cabeçalo da requisição

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({erro: 'Token não fornecido'});
    }

    try {
        // Verificar se o token é valido
        const decoded = jwt.verify(token, SECRET_KEY);

        //Adicionar o ID do usuário ao objeto de requisição para uso posterior
        req.usuario = {id: decoded.usuarioId};

        // Próximo middleware/rota
        next()
    } catch (error) {
        console.error('Erro ao autenticar token:', error);
        return res.status(403).json({erro: 'Token inválido.'});
    }
}

module.exports = autenticarJWT