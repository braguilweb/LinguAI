
/**
 * @class ChatManager
 * @description Módulo de Chat - Gerencia a interface de chat com a IA.
 * Inclui funcionalidades de envio de mensagens, histórico de chat e integração com Web Speech API.
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
   * @function inicializarReconhecimentoVoz
   * @description Inicializa o reconhecimento de voz usando Web Speech API.
   * Configura os handlers para início, fim, resultado e erro do reconhecimento.
   */
  inicializarReconhecimentoVoz() {
    // Obtém a API de reconhecimento de voz (com suporte a navegadores Webkit).
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API não é suportada neste navegador. O reconhecimento de voz não funcionará.");
      return;
    }

    this.reconhecimentoVoz = new SpeechRecognition();
    this.reconhecimentoVoz.continuous = false; // Parar após uma pausa de silêncio.
    this.reconhecimentoVoz.interimResults = false; // Não retornar resultados intermediários.
    this.reconhecimentoVoz.lang = 'pt-BR'; // Idioma padrão para reconhecimento.

    // Evento disparado quando o reconhecimento de voz inicia.
    this.reconhecimentoVoz.onstart = () => {
      this.estouFalando = true;
      const botaoMicrofone = document.getElementById("botaoMicrofone");
      if (botaoMicrofone) {
        botaoMicrofone.classList.add("ativo");
      }
    };

    // Evento disparado quando o reconhecimento de voz termina.
    this.reconhecimentoVoz.onend = () => {
      this.estouFalando = false;
      const botaoMicrofone = document.getElementById("botaoMicrofone");
      if (botaoMicrofone) {
        botaoMicrofone.classList.remove("ativo");
      }
    };

    // Evento disparado quando o reconhecimento retorna resultados.
    this.reconhecimentoVoz.onresult = (evento) => {
      let textoFinal = "";
      // Processa todos os resultados desde o índice anterior até o final.
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const transcricao = evento.results[i][0].transcript;
        // Apenas adiciona resultados finais (não intermediários).
        if (evento.results[i].isFinal) {
          textoFinal += transcricao + " ";
        }
      }

      // Se houver texto reconhecido, preenche o campo de mensagem.
      if (textoFinal) {
        const campoDeMensagem = document.getElementById("campoDeMensagem");
        if (campoDeMensagem) {
          campoDeMensagem.value = textoFinal.trim();
        }
      }
    };

    // Evento disparado quando ocorre um erro no reconhecimento de voz.
    this.reconhecimentoVoz.onerror = (evento) => {
      console.error("Erro no reconhecimento de voz:", evento.error);
      alert("Erro ao reconhecer voz: " + evento.error);
    };
  }

  /**
   * @function iniciarChat
   * @description Inicia um novo chat com um idioma selecionado.
   * Faz uma requisição à API para criar um novo chat e exibe a tela de chat.
   * @param {string} idioma - O idioma selecionado para praticar.
   */
  async iniciarChat(idioma) {
    try {
      // Usa um caminho relativo para a API, permitindo que funcione tanto localmente quanto no Render.
      const response = await fetch("/chat/iniciar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Inclui cookies na requisição.
        body: JSON.stringify({ idioma }),
      });

      if (!response.ok) {
        throw new Error("Erro ao iniciar chat. Por favor, tente novamente.");
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
   * @function enviarMensagem
   * @description Envia uma mensagem para o chat e recebe a resposta da IA.
   * Exibe a mensagem do usuário, envia para a API e exibe a resposta da IA.
   * @param {string} mensagem - O texto da mensagem a enviar.
   */
  async enviarMensagem(mensagem) {
    if (!mensagem.trim() || !this.chatId) {
      return;
    }

    try {
      // Exibir a mensagem do usuário imediatamente na interface.
      this.adicionarMensagemAoChat("usuario", mensagem);

      // Limpar o campo de entrada.
      const campoDeMensagem = document.getElementById("campoDeMensagem");
      if (campoDeMensagem) {
        campoDeMensagem.value = "";
      }

      // Envia a mensagem para a API usando um caminho relativo.
      const response = await fetch(`/chat/${this.chatId}/mensagem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Inclui cookies na requisição.
        body: JSON.stringify({ mensagem }),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem. Por favor, tente novamente.");
      }

      const dados = await response.json();

      // Exibir a resposta da IA.
      this.adicionarMensagemAoChat("ia", dados.ia);

      // Se houver correção gramatical/vocabulário, exibir em um elemento especial.
      if (dados.correction) {
        this.exibirCorrecao(dados.correction);
      }
    } catch (erro) {
      console.error("Erro ao enviar mensagem:", erro);
      alert("Erro ao enviar mensagem. Por favor, tente novamente.");
    }
  }

  /**
   * @function adicionarMensagemAoChat
   * @description Adiciona uma mensagem ao histórico de chat na interface.
   * @param {string} remetente - 'usuario' ou 'ia', indicando quem enviou a mensagem.
   * @param {string} conteudo - O texto da mensagem.
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

    // Rola automaticamente para a última mensagem.
    historicoMensagens.scrollTop = historicoMensagens.scrollHeight;
  }

  /**
   * @function exibirCorrecao
   * @description Exibe uma correção gramatical ou de vocabulário fornecida pela IA.
   * @param {string} correcao - O texto da correção.
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

    // Rola automaticamente para a última mensagem.
    historicoMensagens.scrollTop = historicoMensagens.scrollHeight;
  }

  /**
   * @function iniciarReconhecimentoVoz
   * @description Inicia o reconhecimento de voz se a Web Speech API estiver disponível.
   */
  iniciarReconhecimentoVoz() {
    if (this.reconhecimentoVoz && !this.estouFalando) {
      this.reconhecimentoVoz.start();
    }
  }

  /**
   * @function pararReconhecimentoVoz
   * @description Para o reconhecimento de voz.
   */
  pararReconhecimentoVoz() {
    if (this.reconhecimentoVoz && this.estouFalando) {
      this.reconhecimentoVoz.stop();
    }
  }

  /**
   * @function exibirTelaChat
   * @description Exibe a tela de chat com o histórico de mensagens e campo de entrada.
   * Configura os event listeners para envio de mensagens, reconhecimento de voz e voltar.
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
          <button id="botaoMicrofone" class="botao-microfone" title="Usar microfone para falar">🎤</button>
          <button id="botaoEnviar" class="botao-enviar">Enviar</button>
        </div>
      </div>
    `;

    // Adicionar event listeners aos elementos da tela de chat.
    const botaoEnviar = document.getElementById("botaoEnviar");
    const campoDeMensagem = document.getElementById("campoDeMensagem");
    const botaoMicrofone = document.getElementById("botaoMicrofone");
    const botaoVoltar = document.getElementById("botaoVoltar");

    // Evento para enviar mensagem ao clicar no botão "Enviar".
    botaoEnviar.addEventListener("click", () => {
      const mensagem = campoDeMensagem.value;
      this.enviarMensagem(mensagem);
    });

    // Evento para enviar mensagem ao pressionar a tecla "Enter".
    campoDeMensagem.addEventListener("keypress", (evento) => {
      if (evento.key === "Enter") {
        const mensagem = campoDeMensagem.value;
        this.enviarMensagem(mensagem);
      }
    });

    // Evento para iniciar/parar o reconhecimento de voz.
    botaoMicrofone.addEventListener("click", () => {
      if (this.estouFalando) {
        this.pararReconhecimentoVoz();
      } else {
        this.iniciarReconhecimentoVoz();
      }
    });

    // Evento para voltar à tela de seleção de idioma.
    botaoVoltar.addEventListener("click", () => {
      this.voltarParaSelecaoIdioma();
    });

    // Carrega o histórico de mensagens do chat.
    this.carregarHistoricoChat();
  }

  /**
   * @function carregarHistoricoChat
   * @description Carrega o histórico de mensagens do chat a partir da API.
   * Exibe todas as mensagens anteriores e correções.
   */
  async carregarHistoricoChat() {
    try {
      // Usa um caminho relativo para a API.
      const response = await fetch(`/chat/${this.chatId}/historico`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Inclui cookies na requisição.
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar histórico. Por favor, tente novamente.");
      }

      const mensagens = await response.json();
      const historicoMensagens = document.getElementById("historicoMensagens");

      if (historicoMensagens) {
        historicoMensagens.innerHTML = "";
        // Adiciona cada mensagem do histórico à interface.
        mensagens.forEach((msg) => {
          this.adicionarMensagemAoChat(msg.remetente, msg.conteudo);
          // Se houver correção associada à mensagem, exibe-a.
          if (msg.correcao) {
            this.exibirCorrecao(msg.correcao);
          }
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar histórico:", erro);
      // Não exibe alerta aqui para não interromper a experiência do usuário.
    }
  }

  /**
   * @function voltarParaSelecaoIdioma
   * @description Volta para a tela de seleção de idioma e reseta o chat atual.
   */
  voltarParaSelecaoIdioma() {
    this.chatId = null;
    this.idiomaSelecionado = null;
    this.exibirTelaSelecaoIdioma();
  }

  /**
   * @function exibirTelaSelecaoIdioma
   * @description Exibe a tela de seleção de idioma com uma grade de botões de idiomas.
   * Permite ao usuário escolher um idioma para praticar ou fazer logout.
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

    // Adicionar event listeners aos botões de idioma.
    const idiomaBtns = document.querySelectorAll(".idioma-btn");
    idiomaBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const idioma = btn.getAttribute("data-idioma");
        this.iniciarChat(idioma);
      });
    });

    // Adicionar event listener ao botão de sair (logout).
    const botaoSair = document.getElementById("botaoSair");
    if (botaoSair) {
      botaoSair.addEventListener("click", () => {
        // Limpar o token do cookie e voltar para a tela de login.
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/";
      });
    }
  }
}

// Exportar a classe para uso em outros módulos.
export { ChatManager };
