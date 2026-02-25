/**
 * Módulo de Chat - Gerencia a interface de chat com a IA
 * Inclui funcionalidades de envio de mensagens, histórico de chat e Web Speech API
 */

class ChatManager {
  constructor() {
    this.chatId = null;
    this.idiomaSelecionado = null;
    this.reconhecimentoVoz = null;
    this.estouFalando = false;
    this.inicializarReconhecimentoVoz();
  }

  /**
   * Inicializa o reconhecimento de voz usando Web Speech API
   */
  inicializarReconhecimentoVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Web Speech API não é suportada neste navegador");
      return;
    }

    this.reconhecimentoVoz = new SpeechRecognition();
    this.reconhecimentoVoz.continuous = false;
    this.reconhecimentoVoz.interimResults = false;

    this.reconhecimentoVoz.onstart = () => {
      this.estouFalando = true;
      const botaoMicrofone = document.getElementById("botaoMicrofone");
      if (botaoMicrofone) {
        botaoMicrofone.classList.add("ativo");
      }
    };

    this.reconhecimentoVoz.onend = () => {
      this.estouFalando = false;
      const botaoMicrofone = document.getElementById("botaoMicrofone");
      if (botaoMicrofone) {
        botaoMicrofone.classList.remove("ativo");
      }
    };

    this.reconhecimentoVoz.onresult = (evento) => {
      let textoFinal = "";
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const transcricao = evento.results[i][0].transcript;
        if (evento.results[i].isFinal) {
          textoFinal += transcricao + " ";
        }
      }

      if (textoFinal) {
        const campoDeMensagem = document.getElementById("campoDeMensagem");
        if (campoDeMensagem) {
          campoDeMensagem.value = textoFinal.trim();
        }
      }
    };

    this.reconhecimentoVoz.onerror = (evento) => {
      console.error("Erro no reconhecimento de voz:", evento.error);
      alert("Erro ao reconhecer voz: " + evento.error);
    };
  }

  /**
   * Inicia um novo chat com um idioma selecionado
   * @param {string} idioma - O idioma selecionado para praticar
   */
  async iniciarChat(idioma) {
    try {
      const response = await fetch("/chat/iniciar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ idioma }),
      });

      if (!response.ok) {
        throw new Error("Erro ao iniciar chat");
      }

      const dados = await response.json();
      this.chatId = dados.id;
      this.idiomaSelecionado = idioma;
      this.exibirTelaChat();
    } catch (erro) {
      console.error("Erro ao iniciar chat:", erro);
      alert("Erro ao iniciar chat. Por favor, tente novamente.");
    }
  }

  /**
   * Envia uma mensagem para o chat
   * @param {string} mensagem - O texto da mensagem a enviar
   */
  async enviarMensagem(mensagem) {
    if (!mensagem.trim() || !this.chatId) {
      return;
    }

    try {
      // Exibir a mensagem do usuário imediatamente
      this.adicionarMensagemAoChat("usuario", mensagem);
      
      // Limpar o campo de entrada
      const campoDeMensagem = document.getElementById("campoDeMensagem");
      if (campoDeMensagem) {
        campoDeMensagem.value = "";
      }

      // Enviar a mensagem para a API
      const response = await fetch(`/chat/${this.chatId}/mensagem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ mensagem }),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem");
      }

      const dados = await response.json();
      
      // Exibir a resposta da IA
      this.adicionarMensagemAoChat("ia", dados.ia);
      
      // Se houver correção, exibir em um elemento especial
      if (dados.correction) {
        this.exibirCorrecao(dados.correction);
      }
    } catch (erro) {
      console.error("Erro ao enviar mensagem:", erro);
      alert("Erro ao enviar mensagem. Por favor, tente novamente.");
    }
  }

  /**
   * Adiciona uma mensagem ao chat na interface
   * @param {string} remetente - 'usuario' ou 'ia'
   * @param {string} conteudo - O texto da mensagem
   */
  adicionarMensagemAoChat(remetente, conteudo) {
    const historicoMensagens = document.getElementById("historicoMensagens");
    if (!historicoMensagens) {
      return;
    }

    const divMensagem = document.createElement("div");
    divMensagem.classList.add("mensagem", `mensagem-${remetente}`);
    divMensagem.textContent = conteudo;
    historicoMensagens.appendChild(divMensagem);
    
    // Rolar para a última mensagem
    historicoMensagens.scrollTop = historicoMensagens.scrollHeight;
  }

  /**
   * Exibe uma correção fornecida pela IA
   * @param {string} correcao - O texto da correção
   */
  exibirCorrecao(correcao) {
    const historicoMensagens = document.getElementById("historicoMensagens");
    if (!historicoMensagens) {
      return;
    }

    const divCorrecao = document.createElement("div");
    divCorrecao.classList.add("correcao");
    divCorrecao.innerHTML = `<strong>Correção:</strong> ${correcao}`;
    historicoMensagens.appendChild(divCorrecao);
    
    // Rolar para a última mensagem
    historicoMensagens.scrollTop = historicoMensagens.scrollHeight;
  }

  /**
   * Inicia o reconhecimento de voz
   */
  iniciarReconhecimentoVoz() {
    if (this.reconhecimentoVoz && !this.estouFalando) {
      this.reconhecimentoVoz.start();
    }
  }

  /**
   * Para o reconhecimento de voz
   */
  pararReconhecimentoVoz() {
    if (this.reconhecimentoVoz && this.estouFalando) {
      this.reconhecimentoVoz.stop();
    }
  }

  /**
   * Exibe a tela de chat
   */
  exibirTelaChat() {
    const appContent = document.getElementById("appContent");
    appContent.innerHTML = `
      <div class="chat-screen">
        <div class="chat-header">
          <h2>Praticando ${this.idiomaSelecionado}</h2>
          <button id="botaoVoltar" class="botao-voltar">← Voltar</button>
        </div>
        <div id="historicoMensagens" class="historico-mensagens"></div>
        <div class="correcao-container" id="correcaoContainer"></div>
        <div class="chat-input-area">
          <input 
            type="text" 
            id="campoDeMensagem" 
            placeholder="Digite sua mensagem aqui..." 
            class="campo-mensagem"
          />
          <button id="botaoMicrofone" class="botao-microfone" title="Usar microfone">🎤</button>
          <button id="botaoEnviar" class="botao-enviar">Enviar</button>
        </div>
      </div>
    `;

    // Adicionar event listeners
    const botaoEnviar = document.getElementById("botaoEnviar");
    const campoDeMensagem = document.getElementById("campoDeMensagem");
    const botaoMicrofone = document.getElementById("botaoMicrofone");
    const botaoVoltar = document.getElementById("botaoVoltar");

    botaoEnviar.addEventListener("click", () => {
      const mensagem = campoDeMensagem.value;
      this.enviarMensagem(mensagem);
    });

    campoDeMensagem.addEventListener("keypress", (evento) => {
      if (evento.key === "Enter") {
        const mensagem = campoDeMensagem.value;
        this.enviarMensagem(mensagem);
      }
    });

    botaoMicrofone.addEventListener("click", () => {
      if (this.estouFalando) {
        this.pararReconhecimentoVoz();
      } else {
        this.iniciarReconhecimentoVoz();
      }
    });

    botaoVoltar.addEventListener("click", () => {
      this.voltarParaSelecaoIdioma();
    });

    // Carregar histórico de mensagens
    this.carregarHistoricoChat();
  }

  /**
   * Carrega o histórico de mensagens do chat
   */
  async carregarHistoricoChat() {
    try {
      const response = await fetch(`http://localhost:8000/chat/${this.chatId}/historico`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar histórico");
      }

      const mensagens = await response.json();
      const historicoMensagens = document.getElementById("historicoMensagens");
      
      if (historicoMensagens) {
        historicoMensagens.innerHTML = "";
        mensagens.forEach((msg) => {
          this.adicionarMensagemAoChat(msg.remetente, msg.conteudo);
          if (msg.correcao) {
            this.exibirCorrecao(msg.correcao);
          }
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar histórico:", erro);
    }
  }

  /**
   * Volta para a tela de seleção de idioma
   */
  voltarParaSelecaoIdioma() {
    this.chatId = null;
    this.idiomaSelecionado = null;
    this.exibirTelaSelecaoIdioma();
  }

  /**
   * Exibe a tela de seleção de idioma
   */
  exibirTelaSelecaoIdioma() {
    const appContent = document.getElementById("appContent");
    appContent.innerHTML = `
      <div class="idioma-selection-screen">
        <h2>Escolha um idioma para praticar</h2>
        <div class="idiomas-grid">
          <button class="idioma-btn" data-idioma="Inglês">🇬🇧 Inglês</button>
          <button class="idioma-btn" data-idioma="Espanhol">🇪🇸 Espanhol</button>
          <button class="idioma-btn" data-idioma="Francês">🇫🇷 Francês</button>
          <button class="idioma-btn" data-idioma="Alemão">🇩🇪 Alemão</button>
          <button class="idioma-btn" data-idioma="Italiano">🇮🇹 Italiano</button>
          <button class="idioma-btn" data-idioma="Japonês">🇯🇵 Japonês</button>
          <button class="idioma-btn" data-idioma="Mandarim">🇨🇳 Mandarim</button>
        </div>
        <button id="botaoSair" class="botao-sair">Sair</button>
      </div>
    `;

    // Adicionar event listeners aos botões de idioma
    const idiomaBtns = document.querySelectorAll(".idioma-btn");
    idiomaBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const idioma = btn.getAttribute("data-idioma");
        this.iniciarChat(idioma);
      });
    });

    // Adicionar event listener ao botão de sair
    const botaoSair = document.getElementById("botaoSair");
    if (botaoSair) {
      botaoSair.addEventListener("click", () => {
        // Limpar o token e voltar para login
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/";
      });
    }
  }
}

// Exportar a classe para uso em outros módulos
export { ChatManager };
