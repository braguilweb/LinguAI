
# LinguAI - Seu Tutor de Idiomas com Inteligência Artificial

## Visão Geral

O LinguAI é uma aplicação web interativa projetada para ajudar usuários a praticar e aprimorar suas habilidades em diversos idiomas. Utilizando o poder da Inteligência Artificial (Google Gemini), o LinguAI atua como um tutor de idiomas pessoal, oferecendo conversas dinâmicas, feedback instantâneo e correções gramaticais/vocabulário para auxiliar no aprendizado.

Este projeto foi desenvolvido com foco em uma experiência de usuário fluida e intuitiva, combinando um backend robusto em Node.js com um frontend leve e responsivo. É uma excelente ferramenta para quem busca praticar um novo idioma de forma autônoma e eficaz.

## Funcionalidades

-   **Autenticação Segura:** Cadastro e login de usuários com JWT (JSON Web Tokens) e senhas criptografadas (bcryptjs).
-   **Seleção de Idiomas:** Escolha entre uma variedade de idiomas para iniciar sua prática.
-   **Chat com IA:** Interaja em tempo real com um tutor de IA (Google Gemini) que responde no idioma escolhido.
-   **Correções Inteligentes:** Receba feedback e correções gramaticais/vocabulário da IA para aprender com seus erros.
-   **Histórico de Conversas:** Acesse o histórico completo de seus chats para revisar e acompanhar seu progresso.
-   **Web Speech API:** Funcionalidade de reconhecimento de voz para uma experiência de conversação mais natural.
-   **Configuração Robusta:** Implementação de CORS para segurança e Helmet para proteção contra vulnerabilidades web comuns.

## Tecnologias Utilizadas

**Backend (Node.js/Express):**

-   **Node.js:** Ambiente de execução JavaScript.
-   **Express.js:** Framework web para Node.js, para construção de APIs RESTful.
-   **PostgreSQL:** Banco de dados relacional para armazenamento de usuários, chats e mensagens.
-   **`pg`:** Cliente PostgreSQL para Node.js.
-   **`bcryptjs`:** Para criptografia e comparação de senhas.
-   **`jsonwebtoken`:** Para autenticação baseada em JWT.
-   **`cookie-parser`:** Middleware para lidar com cookies.
-   **`cors`:** Middleware para habilitar o Cross-Origin Resource Sharing.
-   **`helmet`:** Coleção de middlewares para segurança de aplicações Express.
-   **`dotenv`:** Para carregar variáveis de ambiente de um arquivo `.env`.
-   **`@google/generative-ai`:** SDK oficial para interação com a API Google Gemini.

**Frontend (HTML/CSS/JavaScript Puro):**

-   **HTML5:** Estrutura da aplicação.
-   **CSS3:** Estilização e responsividade.
-   **JavaScript (ES6+):** Lógica interativa do lado do cliente.
-   **Web Speech API:** Para reconhecimento de voz no navegador.

## Estrutura do Projeto

```
LinguAI/
├── config/
│   ├── database.js         # Configuração de conexão com o PostgreSQL
│   └── schema.sql          # Esquema do banco de dados e dados iniciais
├── public/
│   ├── css/
│   │   └── style.css       # Estilos CSS da aplicação
│   ├── js/
│   │   ├── app.js          # Lógica principal do frontend
│   │   └── auth/
│   │       ├── cadastro.js   # Lógica da tela de cadastro
│   │       └── login.js      # Lógica da tela de login
│   │   └── chat.js           # Lógica da tela de chat e interação com IA
│   └── index.html          # Página HTML principal
├── src/
│   ├── controllers/
│   │   ├── chatController.js   # Controladores para lógica de chat
│   │   └── userController.js   # Controladores para lógica de usuário
│   ├── middlewares/
│   │   └── authMiddleware.js   # Middleware de autenticação JWT
│   ├── models/
│   │   ├── Chat.js             # Modelo para operações de chat no DB
│   │   └── Message.js          # Modelo para operações de mensagem no DB
│   │   └── User.js             # Modelo para operações de usuário no DB
│   ├── routes/
│   │   ├── authRoutes.js       # Rotas de autenticação
│   │   ├── chatRoutes.js       # Rotas de chat
│   │   └── userRoutes.js       # Rotas de usuário
│   └── services/
│       ├── chatService.js      # Lógica de negócio para chat
│       ├── geminiService.js    # Integração com a API Google Gemini
│       └── usuarioService.js   # Lógica de negócio para usuário
├── .env.example            # Exemplo de variáveis de ambiente
├── .gitignore              # Arquivos e pastas a serem ignorados pelo Git
├── index.js                # Ponto de entrada do servidor Express
├── init_db.js              # Script para inicializar o banco de dados
├── package.json            # Metadados e dependências do projeto
└── README.md               # Este arquivo
```

## Como Rodar Localmente

Siga os passos abaixo para configurar e rodar o projeto LinguAI em sua máquina local.

### Pré-requisitos

-   Node.js (versão 14 ou superior)
-   npm (gerenciador de pacotes do Node.js)
-   PostgreSQL (servidor de banco de dados)

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git # Substitua pela URL do seu repositório
cd LinguAI
```

### 2. Configuração do Banco de Dados

Certifique-se de ter um servidor PostgreSQL rodando. Crie um novo banco de dados para o projeto (ex: `linguai_db`).

### 3. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto, copiando o conteúdo de `.env.example` e preenchendo com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```ini
# Configurações do Banco de Dados PostgreSQL
DB_USER=seu_usuario_postgres
DB_HOST=localhost
DB_NAME=linguai_db
DB_PASSWORD=sua_senha_postgres
DB_PORT=5432

# Chave Secreta para JWT (JSON Web Token)
JWT_SECRET=sua_chave_secreta_jwt_muito_complexa_e_aleatoria

# Chave da API do Google Gemini
GEMINI_API_KEY=sua_chave_api_gemini_aqui

# Porta do Servidor Express
PORT=8000

# Ambiente de Desenvolvimento
NODE_ENV=development
```

**Importante:** Para `JWT_SECRET`, gere uma string aleatória e complexa. Para `GEMINI_API_KEY`, obtenha sua chave no [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Instale as Dependências

```bash
npm install
```

### 5. Inicialize o Banco de Dados

Execute o script para criar as tabelas e inserir os idiomas iniciais:

```bash
node init_db.js
```

Você deverá ver a mensagem `✓ Banco de dados inicializado com sucesso!`.

### 6. Inicie o Servidor

```bash
npm start
# Ou para desenvolvimento:
npm run dev
```

O servidor estará rodando em `http://localhost:8000`.

### 7. Acesse a Aplicação

Abra seu navegador e acesse `http://localhost:8000` (ou a porta configurada no `.env`).

## Deploy no Render.com

O projeto LinguAI está configurado para ser facilmente deployado na plataforma [Render.com](https://render.com/). Consulte o arquivo `GUIA_DEPLOY_RENDER.md` para instruções detalhadas sobre como configurar o backend (Web Service) e o frontend (Static Site) no Render, incluindo a configuração de variáveis de ambiente e CORS.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues para bugs ou sugestões, e enviar pull requests com melhorias.

## Licença

Este projeto está licenciado sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## Contato

Para dúvidas ou sugestões, entre em contato com a equipe LinguAI.
