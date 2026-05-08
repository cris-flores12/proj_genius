// Variáveis de Estado do Jogo
let order = [];
let clickedOrder = [];
let score = 0;
let round = 0;
let isAcceptingInput = false;

// Elementos do DOM
const board = document.getElementById('genius-board');
const blue = document.querySelector('.blue');
const red = document.querySelector('.red');
const green = document.querySelector('.green');
const yellow = document.querySelector('.yellow');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const roundDisplay = document.getElementById('round-display');
const scoreDisplay = document.getElementById('score-display');
const highscoreDisplay = document.getElementById('highscore-display');
const messageBox = document.getElementById('message-box');

// Mapeamento de cores para os botões
const colors = [green, red, yellow, blue];

// Desafio 1: Sistema de Sons usando Web Audio API (Não requer arquivos MP3)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const frequencies = [329.63, 261.63, 277.18, 415.30]; // E4, C4, C#4, G#4 (Frequências clássicas)

function playSound(colorIndex) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    // Se for erro (índice 4), toca som grave, senão toca a frequência da cor
    oscillator.frequency.value = colorIndex === 4 ? 100 : frequencies[colorIndex];
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
    oscillator.stop(audioCtx.currentTime + 0.5);
}

// Lógica de Início de Jogo
const playGame = () => {
    order = [];
    clickedOrder = [];
    score = 0;
    round = 0;
    updateScoreboard();
    restartBtn.classList.add('hidden');
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    board.classList.add('active'); // Ativa cliques
    nextLevel();
}

// Avança para o próximo nível
const nextLevel = () => {
    round++;
    // Desafio 2: Pontuação (Ex: 50 pontos por rodada completada)
    if(round > 1) score += 50; 
    
    updateScoreboard();
    showMessage(`Rodada ${round}! Atenção à sequência...`, 'neutral');
    
    let randomColor = Math.floor(Math.random() * 4);
    order.push(randomColor);
    clickedOrder = [];
    
    isAcceptingInput = false; // Bloqueia clique do usuário enquanto mostra a sequência
    playSequence();
}

// Toca a sequência de cores
const playSequence = () => {
    let delay = 0;
    for (let i = 0; i < order.length; i++) {
        setTimeout(() => {
            lightColor(order[i]);
            // Libera o input após a última cor acender
            if(i === order.length - 1) {
                setTimeout(() => {
                    isAcceptingInput = true;
                    showMessage('Sua vez!', 'success');
                }, 500);
            }
        }, delay);
        delay += 800; // Tempo entre uma cor e outra
    }
}

// Acende a cor e emite som
const lightColor = (colorIndex) => {
    const element = colors[colorIndex];
    element.classList.add('light');
    playSound(colorIndex);
    
    setTimeout(() => {
        element.classList.remove('light');
    }, 400); // Tempo que a cor fica acesa
}

// Clique do usuário
const clickColor = (colorIndex) => {
    if (!isAcceptingInput) return;
    
    clickedOrder.push(colorIndex);
    lightColor(colorIndex);
    checkOrder();
}

// Verifica se o usuário acertou
const checkOrder = () => {
    const currentClickIndex = clickedOrder.length - 1;
    
    if (clickedOrder[currentClickIndex] !== order[currentClickIndex]) {
        gameOver();
        return;
    }
    
    if (clickedOrder.length === order.length) {
        isAcceptingInput = false;
        showMessage('Ótimo! Você acertou!', 'success');
        setTimeout(nextLevel, 1500);
    }
}

// Desafio 3 e 4: Tela de derrota e Botão Reiniciar
const gameOver = () => {
    isAcceptingInput = false;
    board.classList.remove('active'); // Desativa cliques
    playSound(4); // Som de erro
    
    showMessage(`Fim de Jogo! Você chegou à rodada ${round}.`, 'error');
    restartBtn.classList.remove('hidden'); // Mostra botão de reiniciar
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    
    saveHighScore(); // Salva pontuação
}

// Atualiza placar na tela
const updateScoreboard = () => {
    roundDisplay.innerText = round < 10 ? `0${round}` : round;
    scoreDisplay.innerText = score;
}

// Função utilitária para mudar a caixa de mensagem
const showMessage = (text, type) => {
    messageBox.innerText = text;
    messageBox.className = `message-box ${type}`;
}

// Desafio 5: Salvar maior pontuação (LocalStorage)
const saveHighScore = () => {
    let highScore = localStorage.getItem('geniusHighScore') || 0;
    if (score > highScore) {
        localStorage.setItem('geniusHighScore', score);
        highscoreDisplay.innerText = score;
    }
}

// Carrega o recorde ao abrir a página
const loadHighScore = () => {
    let highScore = localStorage.getItem('geniusHighScore') || 0;
    highscoreDisplay.innerText = highScore;
}

// Event Listeners
colors.forEach((btn, index) => {
    btn.addEventListener('click', () => clickColor(index));
});

startBtn.addEventListener('click', playGame);
restartBtn.addEventListener('click', playGame);

// Inicializa
loadHighScore();