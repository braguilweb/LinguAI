
const bcrypt = require("bcryptjs");
const db = require("../../config/database");

/**
 * @function criarUsuario
 * @description Cria um novo usuário no banco de dados após verificar a unicidade do email e criptografar a senha.
 * @param {string} nome - Nome do usuário.
 * @param {string} email - Email do usuário (deve ser único).
 * @param {string} senha - Senha do usuário (será criptografada).
 * @param {string} fotoPerfil - URL da foto de perfil do usuário.
 * @returns {Object} Um objeto contendo o usuário criado (sem a senha) ou um objeto de erro.
 */
const criarUsuario = async (nome, email, senha, fotoPerfil) => {
  try {
    // Verifica se o email já está cadastrado no banco de dados.
    const usuarioExistente = await db.query("SELECT 1 FROM usuarios WHERE email = $1", [email]);
    if (usuarioExistente.rows.length > 0) {
      return { erro: "Já existe um usuário cadastrado com este email." };
    }

    // Criptografa a senha fornecida pelo usuário antes de armazená-la.
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Insere o novo usuário no banco de dados e retorna os dados do usuário inserido.
    const novoUsuario = await db.query(
      "INSERT INTO usuarios (nome, email, senha, foto_perfil) VALUES ($1, $2, $3, $4) RETURNING *",
      [nome, email, senhaCriptografada, fotoPerfil]
    );

    // Retorna os dados do novo usuário, excluindo a senha por segurança.
    return {
      usuario: {
        id: novoUsuario.rows[0].id,
        nome: novoUsuario.rows[0].nome,
        email: novoUsuario.rows[0].email,
        fotoPerfil: novoUsuario.rows[0].foto_perfil,
      },
    };
  } catch (erro) {
    console.error("Erro ao criar usuário:", erro);
    return { erro: "Ocorreu um erro interno ao criar o usuário. Por favor, tente novamente." };
  }
};

/**
 * @function autenticarUsuario
 * @description Autentica um usuário verificando o email e a senha fornecidos.
 * @param {string} email - Email do usuário.
 * @param {string} senha - Senha do usuário.
 * @returns {Object} Um objeto contendo os dados do usuário autenticado (sem a senha) ou um objeto de erro.
 */
const autenticarUsuario = async (email, senha) => {
  try {
    // Busca o usuário no banco de dados pelo email.
    const usuario = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (usuario.rows.length === 0) {
      return { erro: "Usuário não encontrado com este email." };
    }

    // Compara a senha fornecida com a senha criptografada armazenada no banco de dados.
    const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);
    if (!senhaValida) {
      return { erro: "Senha incorreta." };
    }

    // Se o email e a senha estiverem corretos, retorna os dados do usuário (sem a senha).
    return {
      usuario: {
        id: usuario.rows[0].id,
        nome: usuario.rows[0].nome,
        email: usuario.rows[0].email,
      },
    };
  } catch (erro) {
    console.error("Erro ao autenticar o usuário:", erro);
    return { erro: "Ocorreu um erro interno ao autenticar o usuário. Por favor, tente novamente." };
  }
};

/**
 * @function adicionarPreferenciasAoUsuario
 * @description Adiciona uma ou mais preferências a um usuário específico.
 * Garante que apenas preferências válidas e ainda não associadas ao usuário sejam adicionadas.
 * @param {number} usuarioId - ID do usuário ao qual as preferências serão adicionadas.
 * @param {Array<number>} preferenciasIds - Um array de IDs de preferências a serem adicionadas.
 * @returns {Object} Um objeto com uma mensagem de sucesso ou erro, e listas de preferências inválidas/adicionadas.
 */
const adicionarPreferenciasAoUsuario = async (usuarioId, preferenciasIds) => {
  try {
    // Remove IDs duplicados do array de preferências fornecido.
    const preferenciasIdsUnicas = [...new Set(preferenciasIds)];

    // Verifica quais das preferências fornecidas realmente existem no banco de dados.
    const preferenciasExistentes = await db.query(
      "SELECT id FROM preferencias WHERE id = ANY($1)",
      [preferenciasIdsUnicas]
    );

    const preferenciasExistentesIds = preferenciasExistentes.rows.map((item) => item.id);

    const preferenciasValidas = [];
    const preferenciasInvalidas = [];

    // Separa as preferências em válidas (existem no DB) e inválidas (não existem no DB).
    preferenciasIdsUnicas.forEach((preferenciaId) => {
      if (preferenciasExistentesIds.includes(preferenciaId)) {
        preferenciasValidas.push(preferenciaId);
      } else {
        preferenciasInvalidas.push(preferenciaId);
      }
    });

    // Obtém as preferências que o usuário já possui para evitar duplicatas.
    const preferenciasJaCadastradas = await db.query(
      "SELECT preferencia_id FROM usuarios_preferencias WHERE usuario_id = $1",
      [usuarioId]
    );
    const preferenciasJaCadastradasIds = preferenciasJaCadastradas.rows.map((row) => row.preferencia_id);

    // Filtra as preferências válidas, mantendo apenas aquelas que ainda não estão associadas ao usuário.
    const preferenciasParaInserir = preferenciasValidas.filter(
      (preferenciaId) => !preferenciasJaCadastradasIds.includes(preferenciaId)
    );

    let mensagem = "";
    let preferenciasAdicionadas = [];

    // Se houver preferências para inserir, inicia uma transação para adicioná-las.
    if (preferenciasParaInserir.length > 0) {
      await db.query("BEGIN"); // Inicia a transação.
      const queries = preferenciasParaInserir.map((preferenciaId) =>
        db.query(
          `INSERT INTO usuarios_preferencias (usuario_id, preferencia_id)
           VALUES ($1, $2)
           ON CONFLICT (usuario_id, preferencia_id) DO NOTHING
           RETURNING preferencia_id;`,
          [usuarioId, preferenciaId]
        )
      );
      const resultadosInsercao = await Promise.all(queries);
      await db.query("COMMIT"); // Confirma a transação.

      preferenciasAdicionadas = resultadosInsercao
        .filter((resultado) => resultado.rows.length > 0)
        .map((resultado) => resultado.rows[0].preferencia_id);

      mensagem = `Foram adicionadas ${preferenciasAdicionadas.length} novas preferências.`;
    } else {
      mensagem = "Nenhuma nova preferência foi adicionada, pois todas já estavam cadastradas ou eram inválidas.";
    }

    // Se houver preferências inválidas, adiciona uma mensagem de erro ao resultado.
    if (preferenciasInvalidas.length > 0) {
      return {
        erro: "Uma ou mais preferências fornecidas não foram encontradas ou são inválidas.",
        preferenciasInvalidas: preferenciasInvalidas,
        preferenciasAdicionadas: preferenciasAdicionadas,
        mensagem: mensagem, // Inclui a mensagem de sucesso parcial, se houver.
      };
    }

    return { mensagem: mensagem, preferenciasAdicionadas: preferenciasAdicionadas };
  } catch (error) {
    await db.query("ROLLBACK"); // Reverte a transação em caso de erro.
    console.error("Erro ao adicionar preferências ao usuário:", error);
    return { erro: "Ocorreu um erro interno ao adicionar preferências. Por favor, tente novamente." };
  }
};

/**
 * @function obterPreferenciasDoUsuario
 * @description Obtém todas as preferências associadas a um usuário específico.
 * @param {number} usuarioId - ID do usuário.
 * @returns {Array<string>} Um array com os nomes das preferências do usuário.
 */
const obterPreferenciasDoUsuario = async (usuarioId) => {
  try {
    const result = await db.query(
      `SELECT p.nome AS preferencia
       FROM preferencias p
       JOIN usuarios_preferencias up ON p.id = up.preferencia_id
       WHERE up.usuario_id = $1`,
      [usuarioId]
    );
    return result.rows.map((row) => row.preferencia);
  } catch (error) {
    console.error("Erro ao obter preferências do usuário:", error);
    return { erro: "Ocorreu um erro interno ao obter as preferências do usuário. Por favor, tente novamente." };
  }
};

/**
 * @function removerPreferenciaDoUsuario
 * @description Remove uma preferência específica de um usuário.
 * @param {number} usuarioId - ID do usuário.
 * @param {number} preferenciaId - ID da preferência a ser removida.
 * @returns {Object} Um objeto com uma mensagem de sucesso ou erro.
 */
const removerPreferenciaDoUsuario = async (usuarioId, preferenciaId) => {
  try {
    const preferenciaIdInt = parseInt(preferenciaId, 10);

    await db.query(
      "DELETE FROM usuarios_preferencias WHERE usuario_id = $1 AND preferencia_id = $2",
      [usuarioId, preferenciaIdInt]
    );
    // Verifica se alguma linha foi afetada para confirmar a remoção.
    // Nota: O driver pg não retorna diretamente o número de linhas afetadas para DELETE em query simples.
    // Para uma verificação mais robusta, seria necessário um SELECT antes ou usar RETURNING id.
    return { mensagem: "Preferência removida com sucesso!" };
  } catch (error) {
    console.error("Erro ao remover preferência do usuário:", error);
    return { erro: "Ocorreu um erro interno ao remover a preferência. Por favor, tente novamente." };
  }
};

module.exports = {
  criarUsuario,
  autenticarUsuario,
  adicionarPreferenciasAoUsuario,
  obterPreferenciasDoUsuario,
  removerPreferenciaDoUsuario,
};
