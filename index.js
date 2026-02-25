require('dotenv').config();
const cors = require('cors')
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require ('helmet');
const app = express();
const port = process.env.PORT || 8000;
const authRoutes = require('./src/routes/authRoutes.js'); 
const userRoutes = require('./src/routes/userRoutes.js');
const chatRoutes = require('./src/routes/chatRoutes.js');

//ROTAS AQUI

const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500', 'https://linguai-backend-wkpv.onrender.com']; // Adicione a URL do seu frontend no Render aqui

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requisições sem origem (como de aplicativos móveis ou curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'A política de CORS para este site não permite acesso da origem especificada.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

// Middleware cookie-parser (ainda necessário para lidar com cookies)
app.use(cookieParser());


// Configurar o middleware Helmet *após* as rotas que não exigem proteção (como login/cadastro)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://linguai-backend-wkpv.onrender.com"], // Adicionado para permitir imagens do próprio domínio e data URIs
            connectSrc: ["'self'", "https://linguai-backend-wkpv.onrender.com"], // Adicionado para permitir conexões com o backend no Render
        },
    },
}));
// OU, para ativar apenas o CSRF:
// app.use(helmet.csrf());

app.use('/usuarios',userRoutes); // Use o roteador para rotas que começam com '/usuarios'



app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)

})