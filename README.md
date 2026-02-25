# LinguAI

![LinguAI Logo](https://via.placeholder.com/150x50?text=LinguAI)

## 🚀 Visão Geral do Projeto

O **LinguAI** é uma plataforma web inovadora projetada para revolucionar a forma como os usuários praticam e aprimoram suas habilidades em novos idiomas. Utilizando o poder da Inteligência Artificial (Google Gemini), o LinguAI oferece um ambiente de conversação interativo e personalizado, onde os usuários podem praticar em tempo real, receber feedback instantâneo sobre gramática e vocabulário, e construir confiança em sua fluência.

Este projeto foi desenvolvido com foco em escalabilidade, segurança e uma experiência de usuário intuitiva, sendo uma excelente demonstração de aplicações web modernas com integração de IA.

## ✨ Funcionalidades

-   **Autenticação Segura:** Cadastro e login de usuários com criptografia de senha (`bcryptjs`) e gerenciamento de sessão (`JWT`).
-   **Chat Interativo com IA:** Conversação em tempo real com um chatbot inteligente alimentado pelo Google Gemini.
-   **Correção e Feedback:** Receba correções gramaticais e sugestões de vocabulário instantâneas da IA.
-   **Prática de Áudio:** Utilize a Web Speech API para entrada de voz, permitindo a prática de pronúncia e escuta.
-   **Seleção de Idiomas:** Escolha entre diversos idiomas para praticar, como Inglês, Espanhol, Francês, Alemão, Italiano, Japonês e Mandarim.
-   **Histórico de Chats:** Mantenha um registro de todas as suas conversas para revisão e acompanhamento do progresso.
-   **Interface Intuitiva:** Design limpo e responsivo, inspirado em aplicativos de mensagens, para uma experiência de usuário agradável.

## 🛠️ Tecnologias Utilizadas

| Camada       | Tecnologias                                                              |
| :----------- | :----------------------------------------------------------------------- |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla)                                        |
| **Backend**  | Node.js, Express                                                         |
| **Banco de Dados** | PostgreSQL                                                               |
| **IA**       | Google Gemini API                                                        |
| **Segurança** | `bcryptjs`, `jsonwebtoken` (JWT), `helmet`, `cookie-parser`              |
| **Áudio**    | Web Speech API (frontend)                                                |
| **Outros**   | `dotenv` (variáveis de ambiente), `cors` (controle de acesso), `pg` (driver PostgreSQL) |

## ⚙️ Instalação e Configuração

Siga os passos abaixo para configurar e executar o projeto LinguAI em seu ambiente local.

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

-   Node.js (versão 18 ou superior)
-   npm (gerenciador de pacotes do Node.js)
-   PostgreSQL (servidor de banco de dados)
-   Git

### 1. Clonar o Repositório

```bash
git clone https://github.com/braguilweb/LinguAI.git
cd LinguAI
```

### 2. Instalar Dependências

Instale as dependências do projeto usando npm:

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto, baseado no arquivo `.env.example` fornecido. Este arquivo conterá as credenciais do seu banco de dados e a chave da API do Google Gemini.

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha as variáveis:

```ini
# Variáveis de Ambiente para o Projeto LinguAI

# Configurações do Banco de Dados PostgreSQL
DB_USER=seu_usuario_postgres
DB_HOST=localhost
DB_NAME=linguai_db
DB_PASSWORD=sua_senha_postgres
DB_PORT=5432

# Chave Secreta para JWT (JSON Web Token)
# Gerar uma string aleatória e complexa, por exemplo, usando: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"
JWT_SECRET=sua_chave_secreta_jwt_muito_segura

# Chave da API do Google Gemini
# Obtenha sua chave em https://aistudio.google.com/app/apikey
GEMINI_API_KEY=sua_chave_api_gemini_aqui

# Porta do Servidor Express
PORT=8000

# Ambiente de Desenvolvimento (pode ser \'development\' ou \'production\')
NODE_ENV=development
```

**Importante:** A `JWT_SECRET` deve ser uma string longa e aleatória para garantir a segurança dos tokens JWT. A `GEMINI_API_KEY` é essencial para a funcionalidade de IA do chat.

### 4. Configurar e Inicializar o Banco de Dados

Certifique-se de que seu servidor PostgreSQL esteja em execução. Crie um banco de dados com o nome especificado em `DB_NAME` (ex: `linguai_db`).

Em seguida, execute o script de inicialização para criar as tabelas necessárias:

```bash
node init_db.js
```

Este comando criará as tabelas `usuarios`, `preferencias`, `usuarios_preferencias`, `chats` e `mensagens`, além de popular a tabela `preferencias` com alguns idiomas de exemplo.

### 5. Executar a Aplicação

Inicie o servidor backend:

```bash
node index.js
```

O servidor estará rodando em `http://localhost:8000` (ou na porta definida em seu `.env`).

Para acessar o frontend, abra o arquivo `public/index.html` em seu navegador. Se você estiver usando uma extensão de servidor local (como o Live Server do VS Code), certifique-se de que o frontend esteja sendo servido de `http://127.0.0.1:5500` para evitar problemas de CORS, conforme configurado no `index.js` do backend.

## 📂 Estrutura do Projeto

```
LinguAI/
├── config/
│   ├── database.js         # Configuração de conexão com o PostgreSQL
│   └── schema.sql          # Esquema do banco de dados
├── public/
│   ├── css/
│   │   └── style.css       # Estilos CSS da aplicação
│   ├── js/
│   │   ├── app.js          # Lógica principal do frontend
│   │   ├── chat.js         # Lógica do chat e Web Speech API
│   │   └── auth/
│   │       ├── cadastro.js # Lógica de cadastro de usuário
│   │       └── login.js    # Lógica de login de usuário
│   └── index.html          # Página HTML principal
├── src/
│   ├── controllers/
│   │   ├── authController.js # (A ser criado) Controla rotas de autenticação
│   │   ├── chatController.js # Controla rotas de chat
│   │   └── userController.js # Controla rotas de usuário
│   ├── middlewares/
│   │   └── authMiddleware.js # Middleware de autenticação JWT
│   ├── models/
│   │   ├── Chat.js         # Modelo de dados para Chats
│   │   └── Message.js      # Modelo de dados para Mensagens
│   ├── routes/
│   │   ├── authRoutes.js   # Rotas de autenticação
│   │   ├── chatRoutes.js   # Rotas de chat
│   │   └── userRoutes.js   # Rotas de usuário
│   └── services/
│       ├── chatService.js    # Lógica de negócio para o chat
│       ├── geminiService.js  # Integração com Google Gemini API
│       └── usuarioService.js # Lógica de negócio para usuários
├── .env.example            # Exemplo de variáveis de ambiente
├── index.js                # Ponto de entrada do servidor Express
├── init_db.js              # Script para inicializar o banco de dados
├── package.json            # Metadados e dependências do projeto
├── package-lock.json       # Bloqueio de dependências
└── README.md               # Este arquivo
```

## 🤝 Contribuição

Contribuições são bem-vindas! Se você tiver sugestões, melhorias ou encontrar algum bug, sinta-se à vontade para abrir uma issue ou enviar um pull request.

## 📄 Licença

Este projeto está licenciado sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

Para dúvidas ou sugestões, entre em contato com [Seu Nome/Email/GitHub].
