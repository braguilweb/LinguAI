import { exibirTelaLogin } from "./auth/login.js";
import { ChatManager } from "./chat.js";

let gerenciadorChat = null;

document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o usuário está autenticado
    const token = obterTokenDoCookie();
    
    if (token) {
        // Se houver token, exibir a tela de seleção de idioma
        gerenciadorChat = new ChatManager();
        gerenciadorChat.exibirTelaSelecaoIdioma();
    } else {
        // Se não houver token, exibir a tela de login
        exibirTelaLogin();
    }
});

/**
 * Obtém o token JWT do cookie
 * @returns {string|null} O token JWT ou null se não encontrado
 */
function obterTokenDoCookie() {
    const nome = "token=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(nome) === 0) {
            return cookie.substring(nome.length, cookie.length);
        }
    }
    return null;
}
