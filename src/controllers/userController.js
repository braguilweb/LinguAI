const usuarioService = require('../services/usuarioService');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

const registrarUsuario = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        const fotoPerfil = req.body.fotoPerfil || 'https://avatars.githubusercontent.com/u/80931364?v=4'

        //validações

        const resultado = await usuarioService.criarUsuario(nome, email, senha, fotoPerfil);
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

            //Definir o cookie HttpOnly e Secure
            res.cookie('token', token, {
                httpOnly: true, //Impede o acesso ao cookie via JavaScript
                secure: process.env.NODE_ENV === 'production', //Define como true apenas em produção (HTTPS)
                maxAge: 3600000 // Tempo de expiração do cookie em milissegundos (1hora)
            });


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

//Rota para adicionar preferencias a um usuario
const adicionarPreferencias = async (req, res) => {
    //console.log(req.usuario) 
    try {
      const usuarioId = req.usuario.id; // Obter o ID do usuário autenticado (próxima etapa: vamos implementar a autenticação JWT)
      const preferenciasIds = req.body.preferenciasIds; // Array de IDs de preferências
  
      if (!preferenciasIds || !Array.isArray(preferenciasIds) || preferenciasIds.length === 0) {
        return res.status(400).json({ erro: 'Forneça um array de IDs de preferências válido.' });
      }

      const resultado = await usuarioService.adicionarPreferenciasAoUsuario(usuarioId, preferenciasIds);

      //verifica se houve erro no service
      if (resultado.erro) {
        return res.status(400).json({
          erro: resultado.erro,
          preferenciasInvalidas: resultado.preferenciasInvalidas,
          preferenciasAdicionadas: resultado.preferenciasAdicionadas
        })
      }

  
      
      res.json({ mensagem: resultado.mensagem });
    } catch (error) {
      console.error('Erro ao adicionar preferências:', error);
      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  };

  // Rota para remover uma preferência de um usuário
const removerPreferencia = async (req, res) => {
    try {
      const usuarioId = req.usuario.id; // Obter o ID do usuário autenticado 
      const preferenciaId = req.params.preferenciaId; 
  
      if (!preferenciaId) {
        return res.status(400).json({ erro: 'Forneça o ID da preferência.' });
      }
  
      await usuarioService.removerPreferenciaDoUsuario(usuarioId, preferenciaId);
      res.json({ mensagem: 'Preferência removida com sucesso!' });
    } catch (error) {
      console.error('Erro ao remover preferência:', error);
      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  };


  // Rota para obter preferencias do usuário
  const obterPreferenciasDoUsuario = async (req, res) => {
    try {
      const usuarioId = req.usuario.id; // Obter o ID do usuário do token JWT
  
      const preferencias = await usuarioService.obterPreferenciasDoUsuario(usuarioId);
      res.json(preferencias); 
    } catch (error) {
      console.error('Erro ao obter preferências do usuário:', error);
      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  }

module.exports = {
    registrarUsuario,
    logarUsuario,
    adicionarPreferencias,
    removerPreferencia,
    obterPreferenciasDoUsuario
}