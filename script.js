const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXLk1qiMFzO80OuNB_mxuzuUo0mcAOcucB_xBSi4pBoWbCccxW0X9BZw-LHPECUsl_ZA/exec";

async function inicializarSite() {
    const containerVotacao = document.getElementById('lista-times');
    const containerRanking = document.getElementById('lista-ranking-geral');
    
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const dados = await response.json();
        
        containerVotacao.innerHTML = "";
        containerRanking.innerHTML = "";

        // Renderizar Ranking Geral (Histórico)
        const rankingOrdenado = [...dados].sort((a, b) => b.pontosGeral - a.pontosGeral);
        rankingOrdenado.slice(0, 5).forEach((time, index) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            item.innerHTML = `<span>${index+1}º ${time.nome}</span> <span>${time.pontosGeral} pts</span>`;
            containerRanking.appendChild(item);
        });

        // Renderizar Cards de Votação (Semana)
        const votacaoOrdenada = [...dados].sort((a, b) => b.votos - a.votos);
        votacaoOrdenada.forEach(time => {
            const card = document.createElement('div');
            card.className = 'card-time';
            card.style.borderTop = `6px solid ${time.cor}`;
            
            card.innerHTML = `
                <img src="${time.escudo}" class="escudo-lista" alt="Escudo">
                <h3>${time.nome}</h3>
                <p class="votos-count">🗳️ ${time.votos} votos</p>
                <button class="btn-votar" onclick="iniciarProcessoVoto('${time.id}')">Votar Agora</button>
                <a href="clube.html?id=${time.id}" class="btn-info">Ver Perfil</a>
            `;
            containerVotacao.appendChild(card);
        });

    } catch (error) {
        containerVotacao.innerHTML = "<p>Erro ao carregar dados.</p>";
    }
}

// Cronômetro para o Reset (Toda Segunda 00h)
function atualizarCronometro() {
    const agora = new Date();
    const proximaSegunda = new Date();
    proximaSegunda.setDate(agora.getDate() + (1 + 7 - agora.getDay()) % 7);
    proximaSegunda.setHours(0, 0, 0, 0);

    const diff = proximaSegunda - agora;
    
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / 1000 / 60) % 60);
    const segundos = Math.floor((diff / 1000) % 60);

    document.getElementById('timer-semanal').innerText = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
}

function iniciarProcessoVoto(timeId) {
    const modal = document.getElementById('video-modal');
    const timerSpan = document.getElementById('video-timer');
    const progressFill = document.getElementById('progress-fill');
    let tempo = 15;

    modal.style.display = 'flex';
    
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

async function enviarVoto(timeId) {
    try {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ timeId: timeId })
        });
        alert("Voto Confirmado!");
        inicializarSite();
    } catch (e) {
        alert("Erro na conexão.");
    }
}

setInterval(atualizarCronometro, 1000);
document.addEventListener('DOMContentLoaded', inicializarSite);
