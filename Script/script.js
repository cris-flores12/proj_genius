let order = [];
let clickedOrder = [];
let score = 0;
let round = 0;
let isAcceptingInput = false;

// Elementos
const board = document.getElementById('genius-board');
const colors = [document.querySelector('.green'), document.querySelector('.red'), document.querySelector('.yellow'), document.querySelector('.blue')];
const startBtn = document.getElementById('start-btn');
const roundDisplay = document.getElementById('round-display');
const scoreDisplay = document.getElementById('score-display');
const modal = document.getElementById('modal-game-over');
const rankingList = document.getElementById('ranking-list');

// Som (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const frequencies = [330, 260, 280, 420];

function playSound(idx) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = idx === 'err' ? 100 : frequencies[idx];
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
    osc.stop(audioCtx.currentTime + 0.5);
}

// Lógica do Jogo
const startGame = () => {
    order = []; score = 0; round = 0;
    modal.classList.add('hidden');
    startBtn.disabled = true;
    board.classList.add('active');
    nextLevel();
};

const nextLevel = () => {
    round++;
    roundDisplay.innerText = round < 10 ? `0${round}` : round;
    scoreDisplay.innerText = score;
    order.push(Math.floor(Math.random() * 4));
    clickedOrder = [];
    isAcceptingInput = false;
    playSequence();
};

const playSequence = () => {
    order.forEach((colorIdx, i) => {
        setTimeout(() => {
            lightUp(colorIdx);
            if (i === order.length - 1) isAcceptingInput = true;
        }, i * 800);
    });
};

const lightUp = (idx) => {
    colors[idx].classList.add('light');
    playSound(idx);
    setTimeout(() => colors[idx].classList.remove('light'), 400);
};

const handleBtnClick = (idx) => {
    if (!isAcceptingInput) return;
    clickedOrder.push(idx);
    lightUp(idx);
    
    const currentIdx = clickedOrder.length - 1;
    if (clickedOrder[currentIdx] !== order[currentIdx]) {
        gameOver();
        return;
    }
    
    if (clickedOrder.length === order.length) {
        score += 10;
        isAcceptingInput = false;
        setTimeout(nextLevel, 1000);
    }
};

const gameOver = () => {
    playSound('err');
    board.classList.remove('active');
    document.getElementById('final-score').innerText = score;
    modal.classList.remove('hidden');
    startBtn.disabled = false;
};

// Ranking (LocalStorage)
const saveRanking = () => {
    const name = document.getElementById('player-name').value || "Anônimo";
    let ranking = JSON.parse(localStorage.getItem('geniusRanking')) || [];
    ranking.push({ name, score });
    ranking.sort((a, b) => b.score - a.score);
    localStorage.setItem('geniusRanking', JSON.stringify(ranking.slice(0, 5)));
    displayRanking();
    modal.classList.add('hidden');
};

const displayRanking = () => {
    const ranking = JSON.parse(localStorage.getItem('geniusRanking')) || [];
    rankingList.innerHTML = ranking.map(p => `<li class="ranking-item"><span>${p.name}</span><strong>${p.score}</strong></li>`).join('');
};

// Eventos
colors.forEach((btn, i) => btn.onclick = () => handleBtnClick(i));
startBtn.onclick = startGame;
document.getElementById('save-ranking-btn').onclick = saveRanking;
document.getElementById('close-modal-btn').onclick = () => modal.classList.add('hidden');

window.onload = displayRanking;