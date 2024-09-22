const bcrypt = require('bcryptjs');
const db = require('../config/database');

//Método para criar um novo usuário

const criarUsuario = async (nome, email, senha, fotoPerfil) => {
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
            'INSERT INTO usuarios (nome, email, senha, foto_perfil) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, email, senhaCriptografada, fotoPerfil]
        );

        //retornar os dados do novo usuario (SEM SENHA)
        return {
            usuario: {
                id: novoUsuario.rows[0].id,
                nome: novoUsuario.rows[0].nome,
                email: novoUsuario.rows[0].email,
                fotoPerfil: novoUsuario.rows[0].foto_perfil
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


// Método para adicionar preferencias a um usuário

const adicionarPreferenciasAoUsuario = async (usuarioId, preferenciasIds) => {
    try {

        //1. Remover ids duplicados do array
        const preferenciasIdsUnicas = [...new Set(preferenciasIds)];

        //2. Veriificar se preferencias existem 

        const preferenciasExistentes = await db.query(
            'SELECT id FROM preferencias WHERE id = ANY($1)',
            [preferenciasIdsUnicas]
        );
        

        const preferenciasExistentesIds = preferenciasExistentes.rows.map((item) => item.id); //Arrai de IDs existentes

        //Separar ids validos e invalidos
        const preferenciasValidas = []
        const preferenciasInvalidas = []

        preferenciasIdsUnicas.forEach(preferenciaId => {
            if (preferenciasExistentesIds.includes(preferenciaId)) {
                preferenciasValidas.push(preferenciaId)
            } else {
                preferenciasInvalidas.push(preferenciaId)
            }
        })

       
        //4. Se houver preferencias inválidas retornar um erro mas inserir as válidas
        if (preferenciasInvalidas.length > 0) {
            //inserir as preferencias válidas
            await db.query('BEGIN');
            const queries = preferenciasValidas.map(preferenciaId =>
                db.query(
                    'INSERT INTO usuarios_preferencias (usuario_id, preferencia_id) VALUES ($1, $2)',
                    [usuarioId, preferenciaId]
                )
            )
            await Promise.all(queries);
            await db.query('COMMIT');

            return {
                erro: 'Uma ou mais preferências não foram encontradas.',
                preferenciasInvalidas: preferenciasInvalidas,
                preferenciasValidas: preferenciasValidas
            };
        }

        // 5. Obter as preferências que JÁ estão cadastradas para o usuário
        const preferenciasJaCadastradas = await db.query(
            'SELECT preferencia_id FROM usuarios_preferencias WHERE usuario_id = $1',
            [usuarioId]
        );
        const preferenciasJaCadastradasIds = preferenciasJaCadastradas.rows.map(row => row.preferencia_id);
  
        // 6. Filtrar as preferências válidas, removendo as que já estão cadastradas
        const preferenciasParaInserir = preferenciasValidas.filter(
            preferenciaId => !preferenciasJaCadastradasIds.includes(preferenciaId)
        );
  
        // 7. Se houver preferências para inserir, executar a query INSERT (com ON CONFLICT)
        if (preferenciasParaInserir.length > 0) { 
            await db.query('BEGIN');
            const queries = preferenciasParaInserir.map(preferenciaId => 
            db.query(
                `INSERT INTO usuarios_preferencias (usuario_id, preferencia_id) 
                VALUES ($1, $2)
                ON CONFLICT (usuario_id, preferencia_id) DO NOTHING
                RETURNING preferencia_id;`,
                [usuarioId, preferenciaId]
            )
        );
        const resultadosInsercao = await Promise.all(queries);
        await db.query('COMMIT');
  
        // 8. Obter os IDs das preferências inseridas
        const preferenciasInseridas = resultadosInsercao
          .filter(resultado => resultado.rows.length > 0)
          .map(resultado => resultado.rows[0].preferencia_id);
  
        // 9. Ajustar a mensagem de sucesso, indicando quantas foram inseridas
        return { 
          mensagem: `Foram adicionadas ${preferenciasInseridas.length} preferências.` 
        };
      }
  
      // 10. Se não houver preferências para inserir, retornar uma mensagem informando
      return { 
        mensagem: 'Nenhuma nova preferência foi adicionada, pois todas já estavam cadastradas.' 
      };
    } catch (error) {
        await db.query('ROLLBACK'); // Reverter a transação em caso de erro
        console.error('Erro ao adicionar preferências ao usuário:', error);
        throw error;
    }
}

//Métododo para obter as preferencias de um usuário
const obterPreferenciasDoUsuario = async (usuarioId) => {
    try {
        const result = await db.query(
            `SELECT p.nome AS preferencia
            FROM preferencias p
            JOIN usuarios_preferencias up ON p.id = up.preferencia_id
            WHERE up.usuario_id = $1`,
            [usuarioId]
        );
        return result.rows.map(row => row.preferencia);
    } catch (error) {
        console.erro('Erro ao obter preferências do usuário:', error);
        throw error;
    }
}


//Método para remover uma preferencia do usuário

const removerPreferenciaDoUsuario = async (usuarioId, preferenciaId) => {
    try {

        const preferenciaIdInt = parseInt(preferenciaId, 10);

        await db.query(
            'DELETE FROM usuarios_preferencias WHERE usuario_id = $1 AND preferencia_id = $2',
            [usuarioId, preferenciaIdInt]
        );
        return {mensagem: 'Preferência removida com sucesso!'};
    } catch (error) {
        console.error('Erro ao remover preferência do usuário', error);
        throw error;
    }
}

// ... (Implementaremos na próxima etapa)

module.exports = {
    criarUsuario,
    autenticarUsuario,
    adicionarPreferenciasAoUsuario,
    obterPreferenciasDoUsuario,
    removerPreferenciaDoUsuario
}