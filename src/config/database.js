const {Pool} = require('pg');

// configurações da conexão com o banco de dados

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT, // Porta padrão do PostgreSQL
})

// Testa a conexão com o banco de dados
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
    } else {
      console.log('Conexão com o banco de dados estabelecida com sucesso!');
    }
  });
  
  module.exports = pool;