const colors = ["green", "red", "yellow", "blue"];
let sequence = [];
let playerSequence = [];
let round = 0;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

const startBtn = document.getElementById("start");
const restartBtn = document.getElementById("restart");
const message = document.getElementById("message");
const roundDisplay = document.getElementById("round");
const scoreDisplay = document.getElementById("score");

const gameOverScreen = document.getElementById("game-over");
const finalScore = document.getElementById("final-score");
const highScoreDisplay = document.getElementById("high-score");
const playAgainBtn = document.getElementById("play-again");
const playerNameInput = document.getElementById("player-name");
const exitBtn = document.getElementById("exit-game");
const rankingList = document.getElementById("ranking-list");

// 🎵 Sons gerados via Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const soundFrequencies = {
  green: 329.63,
  red: 261.63,
  yellow: 220.00,
  blue: 392.00
};

// Retoma o áudio apenas uma vez
document.body.addEventListener("click", () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}, { once: true });

function playSound(color) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = soundFrequencies[color];
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3);
}

function playErrorSound() {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = "sawtooth";
  oscillator.frequency.value = 120;
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.5);
}

// Eventos
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  startGame();
});
exitBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  message.textContent = "Você saiu do jogo.";
  restartBtn.style.display = "none";
});

// Funções principais
function startGame() {
  sequence = [];
  playerSequence = [];
  round = 0;
  score = 0;
  message.textContent = "Observe a sequência!";
  scoreDisplay.textContent = score;
  roundDisplay.textContent = round;
  restartBtn.style.display = "inline-block";
  gameOverScreen.style.display = "none";
  nextRound();
}

function nextRound() {
  round++;
  roundDisplay.textContent = round;
  playerSequence = [];
  sequence.push(colors[Math.floor(Math.random() * 4)]);
  showSequence();
}

function showSequence() {
  let i = 0;
  const interval = setInterval(() => {
    highlight(sequence[i]);
    i++;
    if (i >= sequence.length) {
      clearInterval(interval);
      message.textContent = "Sua vez!";
    }
  }, 1000);
}

function highlight(color) {
  const el = document.querySelector(`.${color}`);
  el.style.opacity = "0.5";
  playSound(color);
  setTimeout(() => el.style.opacity = "1", 500);
}

document.querySelectorAll(".color").forEach(btn => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    playerSequence.push(color);
    highlight(color);
    checkMove(playerSequence.length - 1);
  });
});

// Checagem
function checkMove(index) {
  if (playerSequence[index] !== sequence[index]) {
    playErrorSound();
    message.textContent = "Você errou!";
    finalScore.textContent = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    highScoreDisplay.textContent = highScore;

    saveRanking(score);
    gameOverScreen.style.display = "flex";
    return;
  }
  if (playerSequence.length === sequence.length) {
    score += 10;
    scoreDisplay.textContent = score;
    message.textContent = "Ótimo! Próxima rodada...";
    setTimeout(nextRound, 1000);
  }
}

// Ranking
function updateRanking() {
  rankingList.innerHTML = "";
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  ranking.sort((a, b) => b.score - a.score);

  ranking.slice(0, 5).forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}º - ${item.name}: ${item.score} pontos`;
    rankingList.appendChild(li);
  });
}

function saveRanking(score) {
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  const playerName = playerNameInput.value.trim() || "Jogador";
  ranking.push({ name: playerName, score: score });
  localStorage.setItem("ranking", JSON.stringify(ranking));
  updateRanking();
}

// Atualiza ranking ao carregar
updateRanking();
