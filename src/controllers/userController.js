const usuarioService = require('../services/usuarioService');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

const registrarUsuario = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        //validações

        const resultado = await usuarioService.criarUsuario(nome, email, senha);
        if (resultado.erro) {
            return res.status(400).json({erro: resultado.erro});
        }
        res.status(201).json({mensagem: 'Usuário cadastrado com sucesso!', usuario: resultado.usuario });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({erro: 'Erro no servidor ao cadastrar usuário'});
    }
    // Lógica para registrar um novo usuário
    // 1. Obter os dados do usuário da requisição (req.body)
    // 2. Validar os dados (email válido, senha forte, etc.)
    // 3. Chamar o service para salvar o usuário no banco de dados
    // 4. Retornar uma resposta (sucesso ou erro)
}

const logarUsuario = async (req, res) => {
    try {
        const { email, senha} = req.body;

        // validações

        const resultado = await usuarioService.autenticarUsuario(email, senha);
        

        if (resultado.usuario) {
            //Gerar tokem JWT
            const token = jwt.sign({usuarioId: resultado.usuario.id}, SECRET_KEY, {expiresIn: '1h'})
            res.json({
                mensagem: 'Login realizado com sucesso!',
                usuario: resultado.usuario,
                token: token
            });

        }else{
            return res.status(401).json({erro: resultado.erro})
        }

        

        
    } catch (erro) {
        console.error(erro);
        res.status(500).json({erro:'Erro no sevidor ao realizar o login.'});
    }

    // Lógica para autenticar um usuário
    // 1. Obter email e senha da requisição
    // 2. Validar os dados
    // 3. Chamar o service para verificar se o usuário existe e a senha está correta
    // 4. Se válido, gerar um token JWT
    // 5. Retornar o token ou erro de autenticação 
};

module.exports = {
    registrarUsuario,
    logarUsuario
}