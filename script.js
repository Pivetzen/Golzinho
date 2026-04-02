const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXLk1qiMFzO80OuNB_mxuzuUo0mcAOcucB_xBSi4pBoWbCccxW0X9BZw-LHPECUsl_ZA/exec";

async function inicializarSite() {
    const containerVotacao = document.getElementById('lista-times');
    const containerRanking = document.getElementById('lista-ranking-geral');
    
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const dados = await response.json();
        
        if(dados.error) throw new Error(dados.error);

        containerVotacao.innerHTML = "";
        containerRanking.innerHTML = "";

        // Ranking Geral
        const rankingOrdenado = [...dados].sort((a, b) => b.pontosGeral - a.pontosGeral);
        rankingOrdenado.slice(0, 5).forEach((time, index) => {
            if(time.pontosGeral > 0) {
                const item = document.createElement('div');
                item.className = 'ranking-item';
                item.innerHTML = `<span>${index+1}º ${time.nome}</span> <span>${time.pontosGeral} pts</span>`;
                containerRanking.appendChild(item);
            }
        });
        if(containerRanking.innerHTML === "") containerRanking.innerHTML = "<p>Nenhum ponto ainda.</p>";

        // Cards de Votação
        const votacaoOrdenada = [...dados].sort((a, b) => b.votos - a.votos);
        votacaoOrdenada.forEach(time => {
            const card = document.createElement('div');
            card.className = 'card-time';
            card.style.borderTop = `6px solid ${time.cor}`;
            
            // Link de compartilhamento para WhatsApp
            const textoShare = encodeURIComponent(`Acabei de votar no ${time.nome}! Ajude a gente a subir no Ranking Geral aqui: ${window.location.href}`);
            const whatsappUrl = `https://api.whatsapp.com/send?text=${textoShare}`;

            card.innerHTML = `
                <img src="${time.escudo}" class="escudo-lista" alt="Escudo">
                <h3>${time.nome}</h3>
                <p class="votos-count">🗳️ ${time.votos} votos</p>
                <button id="btn-${time.id}" class="btn-votar" onclick="iniciarProcessoVoto('${time.id}')">Votar Agora</button>
                <div class="acoes-card">
                    <a href="clube.html?id=${time.id}" class="btn-info">Ver Perfil</a>
                    <a href="${whatsappUrl}" target="_blank" class="btn-share">📢 Convocar Torcida</a>
                </div>
            `;
            containerVotacao.appendChild(card);
        });

    } catch (error) {
        containerVotacao.innerHTML = "<p>Erro ao carregar dados.</p>";
    }
}

function atualizarCronometro() {
    const agora = new Date();
    const proximaSegunda = new Date();
    proximaSegunda.setDate(agora.getDate() + (1 + 7 - agora.getDay()) % 7);
    if (agora.getDay() === 1 && agora.getHours() >= 0) proximaSegunda.setDate(proximaSegunda.getDate() + 7);
    proximaSegunda.setHours(0, 0, 0, 0);

    const diff = proximaSegunda - agora;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    document.getElementById('timer-semanal').innerText = `${d}d ${h}h ${m}s`;
}

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

async function enviarVoto(timeId) {
    const btn = document.getElementById(`btn-${timeId}`);
    if(btn) { btn.innerText = "Processando..."; btn.disabled = true; }
    try {
        await fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ timeId: timeId }) });
        alert("Voto computado!");
        inicializarSite();
    } catch (e) {
        alert("Erro ao votar.");
    } finally {
        if(btn) { btn.innerText = "Votar Agora"; btn.disabled = false; }
    }
}

setInterval(atualizarCronometro, 1000);
document.addEventListener('DOMContentLoaded', inicializarSite);
