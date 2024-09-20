require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const authRoutes = require('./src/routes/authRoutes.js'); 

//ROTAS AQUI

app.use(express.json());

app.use('/auth', authRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
    console.log(process.env.TESTE)
})