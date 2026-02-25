
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * @description Cria um pool de conexões com o banco de dados PostgreSQL.
 * As credenciais são obtidas das variáveis de ambiente.
 */
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

/**
 * @function initDb
 * @description Inicializa o banco de dados executando o script SQL (schema.sql).
 * Cria todas as tabelas necessárias e insere dados iniciais (idiomas).
 * Este script é idempotente e seguro para ser executado múltiplas vezes.
 */
async function initDb() {
    try {
        // Lê o arquivo schema.sql que contém a estrutura do banco de dados.
        const schemaPath = path.join(__dirname, 'config', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Executa o script SQL no banco de dados.
        await pool.query(schema);

        console.log('✓ Banco de dados inicializado com sucesso!');
        console.log('✓ Todas as tabelas foram criadas (ou já existiam).');
        console.log('✓ Dados iniciais foram inseridos (idiomas disponíveis).');
    } catch (err) {
        console.error('✗ Erro ao inicializar o banco de dados:', err.message);
        console.error('Detalhes:', err);
        process.exit(1); // Sai com código de erro.
    } finally {
        // Fecha a conexão com o banco de dados.
        await pool.end();
    }
}

// Executa a função de inicialização.
initDb();
