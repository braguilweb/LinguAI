require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function initDb() {
    try {
        const schemaPath = path.join(__dirname, 'config', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('Banco de dados inicializado com sucesso!');
    } catch (err) {
        console.error('Erro ao inicializar o banco de dados:', err);
    } finally {
        await pool.end();
    }
}

initDb();
