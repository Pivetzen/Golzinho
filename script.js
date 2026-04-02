const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXLk1qiMFzO80OuNB_mxuzuUo0mcAOcucB_xBSi4pBoWbCccxW0X9BZw-LHPECUsl_ZA/exec";

// Função que roda assim que a página abre
async function inicializarSite() {
    const container = document.getElementById('lista-times');
    
    try {
        // Busca os dados da aba "Times" via GET
        const response = await fetch(APPS_SCRIPT_URL);
        const times = await response.json();
        
        container.innerHTML = ""; // Limpa o texto "Carregando"

        times.forEach(time => {
            const card = document.createElement('div');
            card.className = 'card-time';
            
            // Monta o HTML do card. O link leva para clube.html com o ID correto
            card.innerHTML = `
                <img src="${time.escudo}" class="escudo-lista" alt="Escudo">
                <h3>${time.nome}</h3>
                <button class="btn-votar" onclick="iniciarProcessoVoto('${time.id}')">Votar (+ Vídeo)</button>
                <a href="clube.html?id=${time.id}" class="btn-info">Ver informações do clube</a>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar times:", error);
        container.innerHTML = "<p>Erro ao carregar dados da planilha. Verifique a URL do Script.</p>";
    }
}

// Função para abrir o modal e simular o vídeo de recompensa
function iniciarProcessoVoto(timeId) {
    const modal = document.getElementById('video-modal');
    const timerSpan = document.getElementById('video-timer');
    let tempoRestante = 15; // Tempo do vídeo em segundos

    modal.style.display = 'flex'; // Exibe o modal
    timerSpan.innerText = tempoRestante;

    const intervalo = setInterval(() => {
        tempoRestante--;
        timerSpan.innerText = tempoRestante;

        if (tempoRestante <= 0) {
            clearInterval(intervalo);
            modal.style.display = 'none';
            enviarVoto(timeId); // Dispara o envio para a planilha
        }
    }, 1000);
}

// Função que envia o voto real para o Google Sheets via POST
async function enviarVoto(timeId) {
    try {
        // O mode 'no-cors' é necessário para evitar erros de segurança do Google
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeId: timeId })
        });
        
        alert("Sucesso! Seu voto para " + timeId + " foi contabilizado.");
        // Opcional: recarregar a página para atualizar contadores se desejar
        // location.reload(); 
    } catch (error) {
        console.error("Erro ao enviar voto:", error);
        alert("Erro técnico ao computar voto.");
    }
}

// Inicializa a vitrine de times
document.addEventListener('DOMContentLoaded', inicializarSite);
