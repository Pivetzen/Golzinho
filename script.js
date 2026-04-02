const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXLk1qiMFzO80OuNB_mxuzuUo0mcAOcucB_xBSi4pBoWbCccxW0X9BZw-LHPECUsl_ZA/exec";

async function inicializarSite() {
    const containerVotacao = document.getElementById('lista-times');
    const containerRanking = document.getElementById('lista-ranking-geral');
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const dados = await response.json();
        containerVotacao.innerHTML = "";
        containerRanking.innerHTML = "";

        const rankingOrdenado = [...dados].sort((a, b) => b.pontosGeral - a.pontosGeral);
        rankingOrdenado.slice(0, 5).forEach((time, index) => {
            if(time.pontosGeral > 0) {
                const item = document.createElement('div');
                item.className = 'ranking-item';
                item.innerHTML = `<span>${index+1}º ${time.nome}</span> <span>${time.pontosGeral} pts</span>`;
                containerRanking.appendChild(item);
            }
        });

        const votacaoOrdenada = [...dados].sort((a, b) => b.votos - a.votos);
        votacaoOrdenada.forEach(time => {
            const card = document.createElement('div');
            card.className = 'card-time';
            card.style.borderTop = `6px solid ${time.cor}`;
            const textoShare = encodeURIComponent(`Acabei de votar no ${time.nome}! Ajude a gente: ${window.location.href}`);
            card.innerHTML = `
                <img src="${time.escudo}" class="escudo-lista">
                <h3>${time.nome}</h3>
                <p class="votos-count">🗳️ ${time.votos} votos</p>
                <button id="btn-${time.id}" class="btn-votar" onclick="mostrarAnuncio('${time.id}')">Votar Agora</button>
                <div class="acoes-card">
                    <a href="clube.html?id=${time.id}" class="btn-info">Ver Perfil</a>
                    <a href="https://api.whatsapp.com/send?text=${textoShare}" target="_blank" class="btn-share">📢 Compartilhar</a>
                </div>
            `;
            containerVotacao.appendChild(card);
        });
    } catch (e) { containerVotacao.innerHTML = "Erro ao carregar."; }
}

// ESTA FUNÇÃO CHAMA O ANÚNCIO REAL
function mostrarAnuncio(timeId) {
    const modal = document.getElementById('video-modal');
    modal.style.display = 'flex';
    document.getElementById('ad-status').innerText = "Iniciando vídeo...";

    // EXEMPLO DE LÓGICA DE REDE DE ANÚNCIO (Unity/AdSense)
    // Na vida real, você usaria algo como: adProvider.showVideo()
    
    console.log("Chamando anúncio para o time: " + timeId);

    // SIMULAÇÃO DE CALLBACK (Substitua pela função de sucesso do seu AdProvider)
    // O anúncio real avisará o código quando terminar.
    setTimeout(() => {
        modal.style.display = 'none';
        enviarVoto(timeId); // Só vota se o vídeo terminar
    }, 15000); // Aqui simulamos 15s, mas o anúncio real controla esse tempo.
}

async function enviarVoto(timeId) {
    const btn = document.getElementById(`btn-${timeId}`);
    if(btn) btn.disabled = true;
    try {
        await fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ timeId: timeId }) });
        alert("Voto confirmado! Obrigado por assistir.");
        inicializarSite();
    } catch (e) { alert("Erro ao salvar voto."); }
}

function atualizarCronometro() {
    const agora = new Date();
    const prox = new Date();
    prox.setDate(agora.getDate() + (1 + 7 - agora.getDay()) % 7);
    prox.setHours(0,0,0,0);
    const diff = prox - agora;
    const d = Math.floor(diff/86400000), h = Math.floor((diff/3600000)%24), m = Math.floor((diff/60000)%60), s = Math.floor((diff/1000)%60);
    document.getElementById('timer-semanal').innerText = `${d}d ${h}h ${m}m ${s}s`;
}

setInterval(atualizarCronometro, 1000);
document.addEventListener('DOMContentLoaded', inicializarSite);
