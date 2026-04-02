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
// AQUI VOCÊ COLA O CÓDIGO SCRIPT QUE O ADSTERRA TE DER (O POPUNDER)
<script src="https://pl29045390.profitablecpmratenetwork.com/c4/2b/39/c42b3986b735d838fe3f3260b7a87349.js"></script>
// Geralmente é um script que cria uma função global ou dispara ao carregar.

function iniciarProcessoVoto(timeId) {
    // 1. DISPARA O POPUNDER (O Adsterra faz isso automaticamente quando o script é carregado
    // ou através de um link. Se for um link, use: window.open('LINK_DO_ADSTERRA', '_blank');)
    
    const modal = document.getElementById('video-modal');
    const status = document.getElementById('ad-status');
    const progressFill = document.getElementById('progress-fill');
    
    modal.style.display = 'flex';
    progressFill.style.width = "0%";

    let tempoRestante = 15; // 15 segundos para validar
    status.innerText = `Validando seu voto em ${tempoRestante}s...`;
    status.style.color = "#fff";

    const contador = setInterval(() => {
        tempoRestante--;
        status.innerText = `Validando seu voto em ${tempoRestante}s...`;
        
        // Atualiza a barra
        let progresso = ((15 - tempoRestante) / 15) * 100;
        progressFill.style.width = progresso + "%";

        if (tempoRestante <= 0) {
            clearInterval(contador);
            status.innerText = "✅ Voto Validado!";
            status.style.color = "#2ecc71";
            
            // Grava o voto no Google Sheets após o delay
            setTimeout(() => {
                modal.style.display = 'none';
                enviarVoto(timeId); 
            }, 1000);
        }
    }, 1000);
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
