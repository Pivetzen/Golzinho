const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXLk1qiMFzO80OuNB_mxuzuUo0mcAOcucB_xBSi4pBoWbCccxW0X9BZw-LHPECUsl_ZA/exec";

// Função para simular o vídeo de recompensa
function iniciarProcessoVoto(timeId) {
    const modal = document.getElementById('video-modal');
    const timerSpan = document.getElementById('video-timer');
    let tempoRestante = 15;

    modal.style.display = 'block';

    const intervalo = setInterval(() => {
        tempoRestante--;
        timerSpan.innerText = tempoRestante;

        if (tempoRestante <= 0) {
            clearInterval(intervalo);
            modal.style.display = 'none';
            enviarVoto(timeId); // Só envia o voto após o vídeo
        }
    }, 1000);
}

// Envia o dado para a planilha
async function enviarVoto(timeId) {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Necessário para Google Apps Script
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeId: timeId })
        });
        alert("Voto contabilizado com sucesso!");
        location.reload(); // Atualiza para ver o novo contador
    } catch (error) {
        console.error("Erro ao votar:", error);
    }
}
