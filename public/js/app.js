import { exibirTelaLogin } from "./auth/login.js";
import { ChatManager } from "./chat.js";

let gerenciadorChat = null;

/**
 * @description Inicializa a aplicação ao carregar a página.
 * Verifica se o usuário está autenticado (token no localStorage).
 * Se sim, exibe a tela de seleção de idioma. Se não, exibe a tela de login.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o usuário está autenticado via localStorage.
    const token = localStorage.getItem('token');

    if (token) {
        // Se houver token, exibir a tela de seleção de idioma.
        gerenciadorChat = new ChatManager();
        gerenciadorChat.exibirTelaSelecaoIdioma();
    } else {
        // Se não houver token, exibir a tela de login.
        exibirTelaLogin();
    }
});
