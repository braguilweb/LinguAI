require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//ROTAS AQUI


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
    console.log(process.env.TESTE)
})