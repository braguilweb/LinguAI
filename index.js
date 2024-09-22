require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require ('helmet');
const app = express();
const port = process.env.PORT || 3000;
const authRoutes = require('./src/routes/authRoutes.js'); 
const userRoutes = require('./src/routes/userRoutes.js');

//ROTAS AQUI

app.use(express.json());

// Middleware cookie-parser (ainda necessário para lidar com cookies)
app.use(cookieParser());


// Configurar o middleware Helmet *após* as rotas que não exigem proteção (como login/cadastro)
app.use(helmet()); // Ativa todos os middlewares do Helmet (incluindo CSRF)
// OU, para ativar apenas o CSRF:
// app.use(helmet.csrf());

app.use('/usuarios',userRoutes); // Use o roteador para rotas que começam com '/usuarios'



app.use('/auth', authRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
    console.log(process.env.TESTE)
})