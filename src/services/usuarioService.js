const bcrypt = require('bcryptjs');
const db = require('../config/database');

//Método para criar um novo usuário

const criarUsuario = async (nome, email, senha) => {
    try {
        //verificar se email já está cadastrado
        const usuarioExistente = await db.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
        if (usuarioExistente.rows.length > 0) {
            return {erro: 'Já existe um usuário cadastrado com este email.'};
        }

        //criptografar a senha
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // inserir o novo usuario no banco de dados

        const novoUsuario = await db.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
            [nome, email, senhaCriptografada]
        );

        //retornar os dados do novo usuario (SEM SENHA)
        return {
            usuario: {
                id: novoUsuario.rows[0].id,
                nome: novoUsuario.rows[0].nome,
                email: novoUsuario.rows[0].email
            }
        }

    } catch (erro) {
        console.error('Erro ao criar usuário:', erro);
        return { erro: 'Ocorreu um erro ao criar o usuário. Por favor, tente novamente.'}
    }
}

// Método para autenticar um usuário (verificar email e senha)
const autenticarUsuario = async(email, senha) => {
    try {
        //busca o usuario no banco de dados pelo email
        const usuario = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if(usuario.rows.length === 0) {
            return{ erro: 'Usuario não encontrado.'}
        }

        //compara a senha fornecida com a criptografada
        const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);
        if(!senhaValida) {
            return {erro:'Senha incorreta.'};
        }

        // se email e senha estiverem corretos, retorna os dados do usuário
        return { 
            usuario:
            {
                id: usuario.rows[0].id,
                nome: usuario.rows[0].nome,
                email: usuario.rows[0].email
            }
        }
    } catch (erro) {
        console.error('Erro ao autenticar o usuário:', erro);
        return { erro: 'Ocorreu um erro ao autenticar o usuário.'}
    }
}

// ... (Implementaremos na próxima etapa)

module.exports = {
    criarUsuario,
    autenticarUsuario
}