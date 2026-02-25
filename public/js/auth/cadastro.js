
import { exibirTelaLogin } from "./login.js";

/**
 * @function exibirTelaCadastro
 * @description Exibe a tela de cadastro e gerencia o registro de novos usuários.
 */
export function exibirTelaCadastro() {
    const appContent = document.getElementById('appContent');
    appContent.innerHTML = `
        <div class="signup-screen">
            <h2>Cadastre-se no LinguAI</h2>
            <form id="signupForm">
                <div class="input-group">
                    <label for="nome">Nome:</label>
                    <input type="text" id="nome" name="nome" required>
                </div>
                <div class="input-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="input-group">
                    <label for="senha">Senha:</label>
                    <input type="password" id="senha" name="senha" required>
                </div>
                <button type="submit">Cadastrar</button>
            </form>
            <p class="login-link">Já tem uma conta? <a href="#">Entrar</a></p>
        </div>`;

    // Adiciona um ouvinte de evento para o formulário de cadastro.
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário.

        // 1. Obtém os valores dos campos de entrada.
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        // 2. Valida os campos antes de enviar.
        if (!nome || !email || !senha) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        if (!validarEmail(email)) {
            alert('Por favor, insira um email válido!');
            return;
        }

        // Opcional: validar força da senha (descomente se desejar ativar)
        // if (!validarSenha(senha)) {
        //     alert('A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.');
        //     return;
        // }

        // 3. Se todos os campos forem válidos, envia os dados para a API.
        try {
            const cadastroData = {
                nome,
                email,
                senha
            };

            // Usa um caminho relativo para a API, permitindo que funcione tanto localmente quanto no Render.
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cadastroData),
                credentials: 'include' // Inclui cookies na requisição.
            });

            const data = await response.json();

            if (response.ok) {
                // Cadastro bem-sucedido!
                alert(data.mensagem || 'Cadastro realizado com sucesso! Por favor, faça login.');
                exibirTelaLogin();
            } else {
                // Erro no cadastro.
                alert(data.erro || 'Erro ao cadastrar. Por favor, tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao enviar os dados do cadastro:', error);
            alert('Ocorreu um erro ao cadastrar. Por favor, tente novamente mais tarde.');
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

    /**
     * @function validarSenha
     * @description Valida a força da senha (mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais).
     * @param {string} senha - A senha a ser validada.
     * @returns {boolean} True se a senha é forte, false caso contrário.
     */
    function validarSenha(senha) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(senha);
    }

    // Adiciona a lógica de transição para a tela de login.
    const loginLink = document.querySelector('.login-link a');
    loginLink.addEventListener('click', (event) => {
        event.preventDefault();
        appContent.innerHTML = '';
        exibirTelaLogin();
    });
}
