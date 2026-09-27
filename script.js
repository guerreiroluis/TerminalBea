// === CONFIGURAÇÃO DO FIREBASE REALTIME DATABASE ===
const firebaseConfig = {
    apiKey: "AIzaSyDhiGwnLZ-a1bZkAdZdeE7w-bTYMI8Cxdw",
    authDomain: "presente-da-bea.firebaseapp.com",
    databaseURL: "https://presente-da-bea-default-rtdb.firebaseio.com",
    projectId: "presente-da-bea",
    storageBucket: "presente-da-bea.firebasestorage.app",
    messagingSenderId: "1039295186420",
    appId: "1:1039295186420:web:3b5d4fb3cd3169b4dc25a1",
    measurementId: "G-YFLQYRVHF2"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const poemasRef = database.ref('poemas_bea');

// Referências aos elementos HTML
const input = document.getElementById('command-input');
const output = document.getElementById('output');

const TOTAL_FOTOS = 54;

let criandoPoemaState = {
    ativo: false,
    etapa: 0,
    tituloTemp: ''
};

// Lista de poemas mantida atualizada em tempo real via Firebase
let poemasNuvem = [];

poemasRef.on('value', (snapshot) => {
    const data = snapshot.val();
    poemasNuvem = [];
    if (data) {
        Object.keys(data).forEach(key => {
            poemasNuvem.push({
                id: key,
                titulo: data[key].titulo,
                texto: data[key].texto
            });
        });
    }
});

// Função para salvar no banco em tempo real
function salvarPoemaNaNuvem(titulo, texto) {
    const textoFormatado = texto.replace(/\n/g, '<br>');
    const novoPoemaRef = poemasRef.push();
    return novoPoemaRef.set({
        titulo: titulo,
        texto: textoFormatado,
        timestamp: Date.now()
    });
}

window.onload = function() {
    printInitialMessage();
    input.focus();
};

function printInitialMessage() {
    const welcome = `
    <p class="highlight">Inicializando Arquivo de Amizade_v2.0...</p>
    <p class="response-text">Status: Conectado. Olá, Beatriz Esteves.<br>
    Este é um terminal seguro que criei para você.<br>
    Tem algumas coisas legais que lembrei do tempo que a gente<br>
    sentava lado a lado na escola.<br><br>
    Para ver o que você pode fazer aqui,<br> 
    digite <span class="highlight">ajuda</span> e dê Enter.</p>
    <hr>
    `;
    printOutput('', welcome);
}

input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const commandRaw = input.value.trim();
        const commandText = commandRaw.toLowerCase();
        input.value = '';

        let response = '';

        // --- MODO DE CRIAÇÃO DE POEMA (PASSO A PASSO) ---
        if (criandoPoemaState.ativo) {
            if (criandoPoemaState.etapa === 1) {
                if (!commandRaw) {
                    printOutput('', `<p class="response-text highlight">O título não pode ser vazio. Digite o título do poema:</p>`);
                    return;
                }
                criandoPoemaState.tituloTemp = commandRaw;
                criandoPoemaState.etapa = 2;
                printOutput(commandRaw, `<p class="response-text highlight">[2/2] Digite o texto do poema:</p>`);
                return;
            } else if (criandoPoemaState.etapa === 2) {
                if (!commandRaw) {
                    printOutput('', `<p class="response-text highlight">O texto não pode ser vazio. Digite o conteúdo do poema:</p>`);
                    return;
                }
                
                salvarPoemaNaNuvem(criandoPoemaState.tituloTemp, commandRaw)
                    .then(() => {
                        response = `
                        <p class="highlight">// poema_sincronizado.log [Sucesso - Nuvem]</p>
                        <p class="response-text">Seu poema foi salvo na nuvem com sucesso!<br>
                        Ele já está sincronizado e visível em todos os seus dispositivos.<br>
                        Digite <span class="highlight">cantinho da bea</span> para ler.</p>`;
                        printOutput(commandRaw, response);
                    })
                    .catch((err) => {
                        response = `<p class="response-text highlight">Erro ao sincronizar com a nuvem. Verifique a conexão.</p>`;
                        printOutput(commandRaw, response);
                    });

                criandoPoemaState.ativo = false;
                criandoPoemaState.etapa = 0;
                criandoPoemaState.tituloTemp = '';
                return;
            }
        }

        // --- COMANDOS NORMAIS DO TERMINAL ---
        switch (commandText) {
            case 'ajuda':
            case 'help':
            case 'comandos':
                response = `
                <p class="highlight">Comandos Disponíveis:</p>
                <p class="response-text">
                <span class="highlight">sobre</span>            - Explica por que criei este terminal.<br>
                <span class="highlight">memorias</span>         - Carrega a galeria completa com as nossas 54 fotos.<br>
                <span class="highlight">cantinho da bea</span>  - Arquivo especial sincronizado com os poemas do acervo.<br>
                <span class="highlight">escrever poema</span>   - Permite escrever e salvar um poema que sincroniza em tempo real.<br>
                <span class="highlight">comfort</span>          - Exibe uma frase ou mensagem leve.<br>
                <span class="highlight">desabafo</span>         - Um lembrete permanente para quando você precisar.<br>
                <span class="highlight">limpar</span>           - Limpa a tela do terminal.
                </p>`;
                break;

            case 'sobre':
                response = `
                <p class="highlight">// sobre.exe</p>
                <p class="response-text">
                Fiz isso só pra te lembrar que algumas coisas não mudam,<br>
                mesmo que a gente não esteja mais 9 horas por dia juntos.<br>
                Nossa amizade é constante.
                </p>`;
                break;

          case 'memorias':
            case 'fotos':
                response = `<p class="highlight">// gerando_galeria_de_memorias.log [54 arquivos encontrados] (Clique na foto para ampliar)</p>`;
                response += `<div class="photo-grid">`;
                
                for (let i = 1; i <= TOTAL_FOTOS; i++) {
                    response += `
                    <div class="photo-card">
                        <img src="${i}.jpg" 
                             onerror="if (this.src.endsWith('.jpg')) { this.src='${i}.jpeg'; } else if (this.src.endsWith('.jpeg')) { this.src='${i}.png'; }" 
                             alt="Memória ${i}" 
                             class="image-placeholder"
                             loading="lazy" 
                             onclick="expandImage(this.src)">
                        <span style="font-size: 11px; color: var(--accent-color);">#memoria_${i}</span>
                    </div>`;
                }
                
                response += `</div>`;
                break;
                
            case 'cantinho da bea':
            case 'cantinhodabea':
            case 'poemas':
            case 'poemas da bea':
                if (poemasNuvem.length === 0) {
                    response = `<p class="highlight">// acervo_literario_bea.doc</p><p class="response-text">Nenhum poema encontrado na nuvem ainda. Digite <span class="highlight">escrever poema</span> para adicionar o primeiro!</p>`;
                } else {
                    response = `<p class="highlight">// acervo_literario_bea.doc [${poemasNuvem.length} Poema(s) Sincronizado(s)]</p>`;
                    response += `<div style="background: rgba(0, 0, 0, 0.25); padding: 15px; border-radius: 6px; max-height: 400px; overflow-y: auto; border-left: 3px solid var(--accent-color);">`;
                    
                    poemasNuvem.forEach((p, index) => {
                        const textoLimpo = p.texto.replace(/<br\s*\/?>/mg, "\n");
                        const textoParaCopiar = `${p.titulo}\n\n${textoLimpo}`;

                        response += `
                        <div style="margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <p style="color: var(--accent-color); font-weight: bold; margin: 0;">[Poema #${index + 1}] — ${p.titulo}</p>
                                <button onclick="copiarPoema(\`${encodeURIComponent(textoParaCopiar)}\`, this)" style="background: rgba(255,255,255,0.1); color: var(--text-color, #fff); border: 1px solid var(--accent-color); border-radius: 4px; padding: 3px 8px; cursor: pointer; font-size: 11px;">📋 Copiar</button>
                            </div>
                            <p class="response-text" style="font-style: italic; line-height: 1.6; padding-left: 10px;">${p.texto}</p>
                        </div>`;
                        if (index < poemasNuvem.length - 1) {
                            response += `<hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.15); margin: 15px 0;">`;
                        }
                    });

                    response += `</div>`;
                }
                break;

            case 'escrever poema':
            case 'criar poema':
            case 'novo poema':
                criandoPoemaState.ativo = true;
                criandoPoemaState.etapa = 1;
                response = `
                <p class="highlight">// novo_registro_poesia.exe [Sincronização em Nuvem Ativa]</p>
                <p class="response-text">[1/2] Digite o TÍTULO do poema e dê Enter:</p>`;
                break;

            case 'comfort':
    const comfortResponses = [
        'Respira fundo. Um dia de cada vez, sem pressa.',
        'Tudo bem não estar 100% bem o tempo todo. Seja gentil com você hoje.',
        'Você não precisa ter todas as respostas agora. Apenas siga em frente.',
        'Tire um tempo pra relaxar a mente e descansar o coração hoje.',
        'Lembrete do dia: Você é infinitamente mais forte e incrível do que imagina.',
        'Olhe para trás e veja o quanto você já superou. Você vai tirar de letra mais essa.',
        'Sua sensibilidade e seu talento com as palavras são preciosos demais.',
        'Você tem uma força silenciosa que sempre te coloca de pé de novo.',
        'Sempre que precisar rir, desabafar ou só distrair a cabeça, estou por aqui.',
        'Amizades verdadeiras não diminuem com a distância ou com o tempo. Conta comigo.',
        'A gente não senta mais lado a lado na escola, mas a torcida pelo seu bem continua a mesma!',
        'Lembrete importante: Não esqueça de comer algo gostoso hoje!',
        'Se tudo der errado, a gente programa um script pra consertar o mundo.',
        'Pausa tática ativada! Vai ouvir uma música que você gosta.',
        'Que o seu dia tenha pelo menos um motivo pra te fazer sorrir de verdade.',
        'Permita-se desacelerar. O mundo pode esperar um pouco.',
        'Você é capaz de transformar coisas difíceis em poesia.',
        'Dias cinzas também passam. O sol sempre volta a aparecer.',
        'Lembre-se de beber água, respirar fundo e dar uma pausa no caos.',
        'O terminal é virtual, mas a torcida por você é bem real.'
    ];
    
    // Sortea uma frase aleatória da lista a cada execução
    const fraseSorteada = comfortResponses[Math.floor(Math.random() * comfortResponses.length)];
    response = `<p class="response-text highlight">-> ${fraseSorteada}</p>`;
    break;

            case 'desabafo':
                response = `
                <p class="highlight">// suporte_permanente.exe</p>
                <p class="response-text">
                O terminal nunca fecha para você.<br>
                Digitar esse comando é só um lembrete visual de que,<br>
                se você quiser falar, o Luís que você conhece<br>
                está sempre a uma mensagem de distância.
                </p>`;
                break;

            case 'limpar':
            case 'clear':
                output.innerHTML = '';
                printInitialMessage();
                return;

            default:
                if (commandText !== '') {
                    response = `<p class="response-text highlight">Comando '${commandText}' não encontrado.<br> Digite 'ajuda' para a lista de comandos.</p>`;
                }
                break;
        }

        if (response !== '') {
            printOutput(commandRaw, response);
        }
    }
});

function printOutput(command, responseHtml) {
    const inputLineHtml = command ? `<p class="command-text">$bea_guest> ${command}</p>` : '';
    const newOutput = `
    <div>
        ${inputLineHtml}
        ${responseHtml}
    </div>
    `;
    output.insertAdjacentHTML('afterbegin', newOutput);
}

// === FUNÇÃO PARA COPIAR O POEMA ===
function copiarPoema(textoCodificado, btn) {
    const texto = decodeURIComponent(textoCodificado);
    navigator.clipboard.writeText(texto).then(() => {
        const textoOriginal = btn.innerText;
        btn.innerText = '✅ Copiado!';
        btn.style.borderColor = '#00ff66';
        setTimeout(() => {
            btn.innerText = textoOriginal;
        }, 2000);
    }).catch(err => {
        alert('Não foi possível copiar automaticamente.');
    });
}

// === FUNÇÃO PARA AMPLIAR E ROTACIONAR A IMAGEM ===
function expandImage(src) {
    let currentRotation = 0;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const container = document.createElement('div');
    container.className = 'modal-content-container';

    const img = document.createElement('img');
    img.src = src;
    img.className = 'modal-content';

    container.appendChild(img);

    const controls = document.createElement('div');
    controls.className = 'modal-controls';

    const rotateBtn = document.createElement('button');
    rotateBtn.className = 'modal-btn';
    rotateBtn.innerText = '🔄 Rotacionar';
    
    rotateBtn.onclick = function(e) {
        e.stopPropagation();
        currentRotation = (currentRotation + 90) % 360;

        if (currentRotation === 90 || currentRotation === 270) {
            const containerHeight = container.clientHeight;
            const containerWidth = container.clientWidth;
            const imgWidth = img.offsetWidth;
            const imgHeight = img.offsetHeight;

            const scale = Math.min(containerHeight / imgWidth, containerWidth / imgHeight, 1);
            img.style.transform = `rotate(${currentRotation}deg) scale(${scale})`;
        } else {
            img.style.transform = `rotate(${currentRotation}deg) scale(1)`;
        }
    };

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-btn modal-btn-close';
    closeBtn.innerText = 'Fechar';
    closeBtn.onclick = function() {
        document.body.removeChild(modal);
    };

    controls.appendChild(rotateBtn);
    controls.appendChild(closeBtn);

    modal.appendChild(container);
    modal.appendChild(controls);

    modal.onclick = function(e) {
        if (e.target === modal || e.target === container) {
            document.body.removeChild(modal);
        }
    };

    document.body.appendChild(modal);
}
