import { exibirTelaLogin } from "./login.js";

export function exibirTelaCadastro() {
    // ... (HTML da tela de Cadastro)
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
            <p class="login-link">Já tem uma conta? <a href="#" >Entrar</a></p>
        </div>  `;

    // Adicione um ouvinte de evento para o formulário de cadastro
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        //1. Obter os valores dos campos nome, email e senha
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        //2. Validar os campos
        if (!nome || !email || !senha) {
            alert('Por favor, preencha todos os campos!');
            return
        }

        if (!validarEmail(email)) {
            alert('Por favor, insira um email válido!');
            return; 
        }
      
        /* ACRESCENTAR DEPOIS
        if (!validarSenha(senha)) {
            alert('Por favor, insira uma senha mais forte!');
            return; 
        }
        */
       //Se todos os campos forem válidos enviar dados para registro
       try {
        const loginData = {
            nome,
            email,
            senha
        } 

        const response = await fetch('http://localhost:8000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (response.ok) {
            //cadastro bem sucedido
            alert(data.mensagem);
            exibirTelaLogin()
        } else {
            //Erro no cadastro
            alert(data.erro);

        }
       } catch (error) {
        console.error('Erro ao enviar os dados do cadastro:', error);
        alert('Ocorreu um erro ao cadastrar. Por favor tente novamente mais tarde.')
       }

    });

    // Funções de validação (exemplos - ajuste as regras conforme necessário)
    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function validarSenha(senha) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(senha);
    }


    //Adiciona a lógica de transição para a tela de login
    const loginLink = document.querySelector('.login-link')
    loginLink.addEventListener('click', () =>{
        appContent.innerHTML = '';
        exibirTelaLogin()
    })


}