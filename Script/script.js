let order = [];
let clickedOrder = [];
let score = 0;
let playSound = true;
let isPlaying = false;
const gameSpeed = 600;

const roundText = document.querySelector('#round');
const pointsText = document.querySelector('#points');
const statusBox = document.querySelector('#game-status');
const rankingList = document.querySelector('#ranking-list');
const pads = document.querySelectorAll('.pad');
const gameOverScreen = document.querySelector('#game-over-screen');

const audio = {
    0: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
    1: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
    2: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
    3: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'),
    error: new Audio('https://www.myinstants.com/media/sounds/wrong-answer-buzzer.mp3')
};

const getRanking = () => JSON.parse(localStorage.getItem('geniusRanking')) || [];

const renderRanking = () => {
    const ranking = getRanking();
    rankingList.innerHTML = ranking.length > 0 
        ? ranking.map((item, i) => `<li class="ranking-item"><span>${i+1}. <b>${item.name}</b></span><span>${item.score} pts</span></li>`).join('')
        : `<li class="ranking-item">Aguardando heróis...</li>`;
};

const saveToRanking = (name, score) => {
    let ranking = getRanking();
    ranking.push({ name: name || "Anônimo", score });
    ranking.sort((a, b) => b.score - a.score);
    localStorage.setItem('geniusRanking', JSON.stringify(ranking.slice(0, 5)));
    renderRanking();
};

const lightUp = (color) => {
    const el = document.querySelector(`[data-color="${color}"]`);
    el.classList.add('active');
    if (playSound) { audio[color].currentTime = 0; audio[color].play(); }
    setTimeout(() => el.classList.remove('active'), gameSpeed);
};

const playSequence = () => {
    isPlaying = false;
    statusBox.innerText = "Observe...";
    statusBox.style.color = "#a855f7";
    let i = 0;
    const interval = setInterval(() => {
        lightUp(order[i]);
        i++;
        if (i >= order.length) {
            clearInterval(interval);
            setTimeout(() => { 
                statusBox.innerText = "Sua vez!"; 
                statusBox.style.color = "#4ade80";
                isPlaying = true; 
            }, 500);
        }
    }, gameSpeed + 200);
};

const nextRound = () => {
    score++;
    roundText.innerText = score.toString().padStart(2, '0');
    pointsText.innerText = ((score - 1) * 50).toString().padStart(3, '0');
    clickedOrder = [];
    order.push(Math.floor(Math.random() * 4));
    playSequence();
};

const gameOver = () => {
    if (playSound) audio.error.play();
    document.querySelector('#final-score').innerText = pointsText.innerText;
    gameOverScreen.style.display = 'flex';
    isPlaying = false;
};

const initGame = () => {
    order = [];
    score = 0;
    clickedOrder = [];
    gameOverScreen.style.display = 'none';
    document.querySelector('#save-score-btn').disabled = false;
    document.querySelector('#save-score-btn').innerText = "💾 Salvar Recorde";
    playSound = document.querySelector('#difficulty').value === 'normal';
    nextRound();
};

pads.forEach(pad => {
    pad.onclick = () => {
        if (!isPlaying) return;
        const color = parseInt(pad.dataset.color);
        lightUp(color);
        clickedOrder.push(color);
        
        const i = clickedOrder.length - 1;
        if (clickedOrder[i] !== order[i]) return gameOver();
        if (clickedOrder.length === order.length) setTimeout(nextRound, 1000);
    };
});

document.querySelector('#start-btn').onclick = initGame;
document.querySelector('#global-reset-btn').onclick = initGame;
document.querySelector('#restart-btn-modal').onclick = initGame;

document.querySelector('#save-score-btn').onclick = function() {
    const name = document.querySelector('#player-name').value;
    saveToRanking(name, parseInt(pointsText.innerText));
    this.disabled = true;
    this.innerText = "Salvo!";
};

document.querySelector('#exit-btn-modal').onclick = () => {
    gameOverScreen.style.display = 'none';
    statusBox.innerText = "Aguardando início...";
    statusBox.style.color = "#4ade80";
    roundText.innerText = "00";
    pointsText.innerText = "000";
};
renderRanking();