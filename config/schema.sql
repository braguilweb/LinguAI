-- Tabela de Usuários (já existente, mas incluída para referência)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    foto_perfil VARCHAR(255),
    data_cadastro TIMESTAMP DEFAULT NOW()
);

-- Tabela de Preferências (já existente, mas incluída para referência)
CREATE TABLE IF NOT EXISTS preferencias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL
);

-- Tabela de associação entre Usuários e Preferências (já existente, mas incluída para referência)
CREATE TABLE IF NOT EXISTS usuarios_preferencias (
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    preferencia_id INTEGER REFERENCES preferencias(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, preferencia_id)
);

-- Tabela de Chats
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    idioma VARCHAR(50) NOT NULL, -- Ex: 'en', 'es', 'fr'
    data_criacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS mensagens (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    remetente VARCHAR(50) NOT NULL, -- 'usuario' ou 'ia'
    conteudo TEXT NOT NULL,
    data_envio TIMESTAMP DEFAULT NOW(),
    correcao TEXT -- Correção da IA, pode ser nula
);

-- Inserir algumas preferências de exemplo, se não existirem
INSERT INTO preferencias (nome) VALUES
('Inglês'),
('Espanhol'),
('Francês'),
('Alemão'),
('Italiano'),
('Japonês'),
('Mandarim')
ON CONFLICT (nome) DO NOTHING;
