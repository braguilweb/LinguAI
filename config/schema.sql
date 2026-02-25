
-- ============================================================================
-- Schema do Banco de Dados - LinguAI
-- ============================================================================
-- Este arquivo contém a estrutura de todas as tabelas necessárias para o
-- funcionamento da aplicação LinguAI. Todas as operações de criação de tabela
-- usam "IF NOT EXISTS" para garantir idempotência (seguro executar múltiplas vezes).
-- ============================================================================

-- ============================================================================
-- Tabela: usuarios
-- Descrição: Armazena informações dos usuários cadastrados na plataforma.
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    foto_perfil VARCHAR(255),
    data_cadastro TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Tabela: preferencias
-- Descrição: Armazena os idiomas disponíveis para prática na plataforma.
-- ============================================================================
CREATE TABLE IF NOT EXISTS preferencias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL
);

-- ============================================================================
-- Tabela: usuarios_preferencias
-- Descrição: Tabela de associação entre usuários e seus idiomas de preferência.
-- Permite que um usuário tenha múltiplas preferências de idiomas.
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios_preferencias (
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    preferencia_id INTEGER REFERENCES preferencias(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, preferencia_id)
);

-- ============================================================================
-- Tabela: chats
-- Descrição: Armazena informações sobre cada sessão de chat iniciada por um usuário.
-- Cada chat é associado a um idioma específico para prática.
-- ============================================================================
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    idioma VARCHAR(50) NOT NULL, -- Ex: 'Inglês', 'Espanhol', 'Francês', etc.
    data_criacao TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Tabela: mensagens
-- Descrição: Armazena todas as mensagens trocadas em cada chat.
-- Inclui mensagens do usuário e respostas da IA, além de correções.
-- ============================================================================
CREATE TABLE IF NOT EXISTS mensagens (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    remetente VARCHAR(50) NOT NULL, -- 'usuario' ou 'ia'
    conteudo TEXT NOT NULL,
    data_envio TIMESTAMP DEFAULT NOW(),
    correcao TEXT -- Correção gramatical/vocabulário fornecida pela IA (pode ser nula)
);

-- ============================================================================
-- Inserir Dados Iniciais: Preferências (Idiomas)
-- ============================================================================
-- Insere os idiomas disponíveis na plataforma.
-- Usa "ON CONFLICT DO NOTHING" para evitar erros se os dados já existirem.
-- ============================================================================
INSERT INTO preferencias (nome) VALUES
('Inglês'),
('Espanhol'),
('Francês'),
('Alemão'),
('Italiano'),
('Japonês'),
('Mandarim')
ON CONFLICT (nome) DO NOTHING;
