import { exibirTelaCadastro } from "./cadastro.js";

export function exibirTelaLogin() {
    // ... (HTML da tela de Login)
    const appContent = document.getElementById('appContent');
    appContent.innerHTML = `
    <div class="login-screen">
        <img src="img/logo.png" alt="Logo LinguAI" class="logo"> 
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
        <p class="signup-link">Não tem uma conta? <a href="#" >Cadastre-se</a></p>
    </div>  `;

    // Adicione um ouvinte de evento para o formulário de login
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        //1. Obter os valores dos campos
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;


        // 2. Validar os campos 
        if (!email || !senha) {
            alert('Por favor, preencha todos os campos!');
            return; 
        }
    
        if (!validarEmail(email)) {
            alert('Por favor, insira um email válido!');
            return; 
        }

        // 3. Se todos os campos forem válidos, enviar os dados para a API
    try {
        const loginData = {
            email,
            senha
        } 
        
  
        const response = await fetch('http://localhost:8000/auth/login', { // Ajuste a URL da sua API
          method: 'POST',
          headers: {
            'Content-Type':'application/json'
          },
          body: JSON.stringify(loginData),          
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Login bem-sucedido!
          // 1. Armazenar o token JWT em um cookie
          document.cookie = `token=${data.token}; path=/;`; 
  
          alert(data.mensagem); // Exibir a mensagem de sucesso da API
  
          // 2. Redirecionar para a tela principal da aplicação (vamos implementá-la em breve)
          // window.location.href = '/home'; // Exemplo de redirecionamento
        } else {
          // Erro no login
          alert(data.erro); // Exibir a mensagem de erro da API
        }
  
      } catch (error) {
        console.error('Erro ao enviar os dados do login:', error);
        alert('Ocorreu um erro ao fazer login. Por favor, tente novamente mais tarde.');
      }
    


       
    });

    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }


    //Adiciona a lógica de transição para a tela de cadastro
    const signupLink = document.querySelector('.signup-link');
    signupLink.addEventListener('click', () => {
        appContent.innerHTML = '';
        exibirTelaCadastro()
    });


    

}
