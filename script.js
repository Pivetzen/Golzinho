const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXLk1qiMFzO80OuNB_mxuzuUo0mcAOcucB_xBSi4pBoWbCccxW0X9BZw-LHPECUsl_ZA/exec";

async function inicializarSite() {
    const containerVotacao = document.getElementById('lista-times');
    const containerRanking = document.getElementById('lista-ranking-geral');
    const containerHistorico = document.getElementById('lista-historico');
    
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const dados = await response.json();
        
        // Se o Apps Script retornar um erro
        if(dados.error) throw new Error(dados.error);

        // 1. LIMPAR CONTAINERS
        containerVotacao.innerHTML = "";
        containerRanking.innerHTML = "";
        containerHistorico.innerHTML = "";

        // 2. RENDERIZAR RANKING GERAL (Líderes Históricos)
        // Filtramos apenas quem tem pontos e ordenamos
        const rankingOrdenado = [...dados].sort((a, b) => b.pontosGeral - a.pontosGeral);
        rankingOrdenado.slice(0, 5).forEach((time, index) => {
            if(time.pontosGeral > 0) {
                const item = document.createElement('div');
                item.className = 'ranking-item';
                item.innerHTML = `<span>${index+1}º ${time.nome}</span> <span>${time.pontosGeral} pts</span>`;
                containerRanking.appendChild(item);
            }
        });
        if(containerRanking.innerHTML === "") containerRanking.innerHTML = "<p>Nenhum ponto atribuído ainda.</p>";

        // 3. RENDERIZAR CARDS DE VOTAÇÃO (Semana Atual)
        const votacaoOrdenada = [...dados].sort((a, b) => b.votos - a.votos);
        votacaoOrdenada.forEach(time => {
            const card = document.createElement('div');
            card.className = 'card-time';
            card.style.borderTop = `6px solid ${time.cor}`;
            
            card.innerHTML = `
                <img src="${time.escudo}" class="escudo-lista" alt="Escudo">
                <h3>${time.nome}</h3>
                <p class="votos-count">🗳️ ${time.votos} votos</p>
                <button id="btn-${time.id}" class="btn-votar" onclick="iniciarProcessoVoto('${time.id}')">Votar Agora</button>
                <a href="clube.html?id=${time.id}" class="btn-info">Ver Perfil</a>
            `;
            containerVotacao.appendChild(card);
        });

        // 4. TODO: INTEGRAR EXIBIÇÃO DO HISTÓRICO SEPARADAMENTE
        // Por enquanto, vamos deixar uma mensagem padrão ou carregar de uma função específica
        containerHistorico.innerHTML = "<p>O histórico é atualizado toda segunda-feira.</p>";

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        containerVotacao.innerHTML = "<p>Erro ao carregar dados da planilha. Verifique a URL do Script.</p>";
    }
}

// Cronômetro para o Reset (Toda Segunda 00h)
function atualizarCronometro() {
    const agora = new Date();
    const proximaSegunda = new Date();
    // Ajuste para encontrar a próxima segunda-feira às 00:00
    proximaSegunda.setDate(agora.getDate() + (1 + 7 - agora.getDay()) % 7);
    if (agora.getDay() === 1 && agora.getHours() >= 0) {
        proximaSegunda.setDate(proximaSegunda.getDate() + 7);
    }
    proximaSegunda.setHours(0, 0, 0, 0);

    const diff = proximaSegunda - agora;
    
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / 1000 / 60) % 60);
    const segundos = Math.floor((diff / 1000) % 60);

    const timerElement = document.getElementById('timer-semanal');
    if(timerElement) {
        timerElement.innerText = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }
}

// Lógica do Vídeo Recompensa
function iniciarProcessoVoto(timeId) {
    const modal = document.getElementById('video-modal');
    const timerSpan = document.getElementById('video-timer');
    const progressFill = document.getElementById('progress-fill');
    let tempo = 15;

    modal.style.display = 'flex';
    progressFill.style.width = "0%";
    
    const intervalo = setInterval(() => {
        tempo--;
        timerSpan.innerText = tempo;
        progressFill.style.width = ((15 - tempo) / 15 * 100) + "%";

        if (tempo <= 0) {
            clearInterval(intervalo);
            modal.style.display = 'none';
            enviarVoto(timeId);
        }
    }, 1000);
}

// Envio do Voto para o Google Sheets
async function enviarVoto(timeId) {
    const btn = document.getElementById(`btn-${timeId}`);
    if(btn) {
        btn.innerText = "Processando...";
        btn.disabled = true;
    }

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Necessário para o Apps Script
            cache: 'no-cache',
            body: JSON.stringify({ timeId: timeId })
        });
        
        alert("Voto computado com sucesso!");
        inicializarSite(); // Recarrega os dados na tela
    } catch (e) {
        console.error("Erro ao votar:", e);
        alert("Erro ao computar voto. Tente novamente.");
    } finally {
        if(btn) {
            btn.innerText = "Votar Agora";
            btn.disabled = false;
        }
    }
}

// Inicialização
setInterval(atualizarCronometro, 1000);
document.addEventListener('DOMContentLoaded', inicializarSite);
