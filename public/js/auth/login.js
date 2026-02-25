
import { exibirTelaCadastro } from "./cadastro.js";
import { ChatManager } from "../chat.js";

/**
 * @function exibirTelaLogin
 * @description Exibe a tela de login e gerencia a autenticação do usuário.
 */
export function exibirTelaLogin() {
    const appContent = document.getElementById('appContent');
    appContent.innerHTML = `
    <div class="login-screen">
        <h2>Bem-vindo ao LinguAI</h2>
        <form id="loginForm">
            <div class="input-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="input-group">
                <label for="senha">Senha:</label>
                <input type="password" id="senha" name="senha" required>
            </div>
            <button type="submit">Entrar</button>
        </form>
        <p class="signup-link">Não tem uma conta? <a href="#">Cadastre-se</a></p>
    </div>`;

    // Adiciona um ouvinte de evento para o formulário de login.
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário.

        // 1. Obtém os valores dos campos de entrada.
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        // 2. Valida os campos antes de enviar.
        if (!email || !senha) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        if (!validarEmail(email)) {
            alert('Por favor, insira um email válido!');
            return;
        }

        // 3. Se todos os campos forem válidos, envia os dados para a API.
        try {
            const loginData = {
                email,
                senha
            };

            // Usa um caminho relativo para a API, permitindo que funcione tanto localmente quanto no Render.
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData),
                credentials: 'include' // Inclui cookies na requisição.
            });

            const data = await response.json();

            if (response.ok) {
                // Login bem-sucedido!
                // 1. Armazena o token JWT em um cookie (o servidor também o envia no cookie HttpOnly).
                document.cookie = `token=${data.token}; path=/;`;

                alert(data.mensagem); // Exibe a mensagem de sucesso da API.

                // 2. Redireciona para a tela de seleção de idioma.
                location.reload();
            } else {
                // Erro no login.
                alert(data.erro || 'Erro ao fazer login. Por favor, tente novamente.'); // Exibe a mensagem de erro da API.
            }

        } catch (error) {
            console.error('Erro ao enviar os dados do login:', error);
            alert('Ocorreu um erro ao fazer login. Por favor, tente novamente mais tarde.');
        }
    });

    /**
     * @function validarEmail
     * @description Valida o formato de um email usando expressão regular.
     * @param {string} email - O email a ser validado.
     * @returns {boolean} True se o email é válido, false caso contrário.
     */
    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Adiciona a lógica de transição para a tela de cadastro.
    const signupLink = document.querySelector('.signup-link a');
    signupLink.addEventListener('click', (event) => {
        event.preventDefault();
        appContent.innerHTML = '';
        exibirTelaCadastro();
    });
}
