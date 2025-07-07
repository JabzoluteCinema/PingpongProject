const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const counterDiv = document.getElementById('counter');
const diffBtns = document.querySelectorAll('.diff-btn');
const diffContainer = document.getElementById('difficulty-container');
const overlay = document.getElementById('overlay');
const resultTitle = document.getElementById('result-title');
const playAgainBtn = document.getElementById('play-again');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PLAYER_X = 20;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
const PLAYER_COLOR = "#2196F3"; // Blue for user
const AI_COLOR = "#E53935";     // Red for AI
const BALL_COLOR = "#fff";
const NET_COLOR = "#fff";
const WIN_SCORE = 3;  // Number of points needed to win

// Difficulty settings
const DIFFICULTIES = {
  easy:    { ballSpeed: 4, aiSpeed: 2, aiError: 120, winScore: WIN_SCORE, mode: 'easy' },
  medium:  { ballSpeed: 6, aiSpeed: 5, aiError: 28, winScore: WIN_SCORE, mode: 'medium' },
  hard:    { ballSpeed: 12, aiSpeed: 8, aiError: 2, winScore: WIN_SCORE, mode: 'hard' }
};

let currentDifficulty = null;
let aiSpeed = 0;
let ballBaseSpeed = 0;
let aiErrorMargin = 0;
let mode = 'medium';

let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  speed: 0,
  radius: BALL_RADIUS
};

let hitCounter = 0;
let playerScore = 0;
let aiScore = 0;
let gameRunning = false;
let showingOverlay = false;

// Draw functions
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  for (let i = 0; i < canvas.height; i += 30) {
    drawRect(canvas.width / 2 - 1, i, 2, 18, NET_COLOR);
  }
}

function drawCounter() {
  counterDiv.textContent = `Hits: ${hitCounter} | You: ${playerScore}  AI: ${aiScore}`;
}

function draw() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw net
  drawNet();

  // Draw paddles
  drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, PLAYER_COLOR);
  drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, AI_COLOR);

  // Draw ball
  drawCircle(ball.x, ball.y, ball.radius, BALL_COLOR);
}

// Game logic
function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = ballBaseSpeed;
  // For hard mode, make speed even faster (already doubled in config)
  let angle = Math.random() * Math.PI / 2 - Math.PI / 4; // -45 to +45 deg
  let dir = direction !== undefined ? direction : (Math.random() > 0.5 ? 1 : -1);
  ball.vx = dir * ball.speed * Math.cos(angle);
  ball.vy = ball.speed * Math.sin(angle);
}

function update() {
  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collision (top/bottom)
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.vy = -ball.vy;
  }

  // Player paddle collision
  if (
    ball.x - ball.radius < PLAYER_X + PADDLE_WIDTH &&
    ball.y > playerY &&
    ball.y < playerY + PADDLE_HEIGHT
  ) {
    ball.x = PLAYER_X + PADDLE_WIDTH + ball.radius;
    let collidePoint = (ball.y - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    let angle = collidePoint * Math.PI / 4;
    let direction = 1;
    ball.vx = direction * ball.speed * Math.cos(angle);
    ball.vy = ball.speed * Math.sin(angle);
    hitCounter++;
    drawCounter();
  }

  // AI paddle collision
  if (
    ball.x + ball.radius > AI_X &&
    ball.y > aiY &&
    ball.y < aiY + PADDLE_HEIGHT
  ) {
    ball.x = AI_X - ball.radius;
    let collidePoint = (ball.y - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    let angle = collidePoint * Math.PI / 4;
    let direction = -1;
    ball.vx = direction * ball.speed * Math.cos(angle);
    ball.vy = ball.speed * Math.sin(angle);
    hitCounter++;
    drawCounter();
  }

  // Check for scoring (ball out of bounds)
  if (ball.x - ball.radius < 0) {
    // AI scores
    aiScore++;
    drawCounter();
    if (aiScore >= currentDifficulty.winScore) {
      showOverlay("Defeat! AI Wins.");
    } else {
      resetBall(1);
      hitCounter = 0;
    }
  } else if (ball.x + ball.radius > canvas.width) {
    // Player scores
    playerScore++;
    drawCounter();
    if (playerScore >= currentDifficulty.winScore) {
      showOverlay("Victory! You Win!");
    } else {
      resetBall(-1);
      hitCounter = 0;
    }
  }

  // AI paddle movement (with difficulty-based error margin)
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  let target = ball.y;

  // Easy: AI reacts slowly and adds big error margin
  // Medium: balanced
  // Hard: tracks closely
  if (mode === "easy") {
    // Only move if ball is coming toward AI, follow with big delay + error
    if (ball.vx > 0) {
      target += (Math.random() - 0.5) * aiErrorMargin;
      if (aiCenter < target - 20) aiY += aiSpeed;
      else if (aiCenter > target + 20) aiY -= aiSpeed;
    }
    // If ball is far, AI doesn't move
  } else if (mode === "medium") {
    // Medium: follows the ball with moderate error
    target += (Math.random() - 0.5) * aiErrorMargin;
    if (aiCenter < target - 12) aiY += aiSpeed;
    else if (aiCenter > target + 12) aiY -= aiSpeed;
  } else {
    // Hard: tracks ball tightly
    if (aiCenter < target - aiErrorMargin) aiY += aiSpeed;
    else if (aiCenter > target + aiErrorMargin) aiY -= aiSpeed;
  }

  // Clamp AI paddle position
  aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(evt) {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  let mouseY = evt.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp
  playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

diffBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    diffBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    setDifficulty(btn.dataset.diff);
  });
});

function setDifficulty(diff) {
  currentDifficulty = DIFFICULTIES[diff];
  aiSpeed = currentDifficulty.aiSpeed;
  ballBaseSpeed = currentDifficulty.ballSpeed;
  aiErrorMargin = currentDifficulty.aiError;
  mode = currentDifficulty.mode;
  startGame();
}

function startGame() {
  diffContainer.style.display = 'none';
  overlay.classList.add('hide');
  hitCounter = 0;
  playerScore = 0;
  aiScore = 0;
  drawCounter();
  playerY = (canvas.height - PADDLE_HEIGHT) / 2;
  aiY = (canvas.height - PADDLE_HEIGHT) / 2;
  resetBall();
  showingOverlay = false;
  if (!gameRunning) {
    gameRunning = true;
    requestAnimationFrame(gameLoop);
  }
}

function showOverlay(message) {
  resultTitle.textContent = message;
  overlay.classList.remove('hide');
  showingOverlay = true;
  gameRunning = false;
}

playAgainBtn.addEventListener('click', () => {
  overlay.classList.add('hide');
  diffContainer.style.display = '';
  showingOverlay = false;
  gameRunning = false;
  draw(); // Show waiting screen
});

// Main game loop
function gameLoop() {
  if (gameRunning) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

// Initial UI state
draw();
drawCounter();
canvas.style.display = 'block';
diffContainer.style.display = 'block';
overlay.classList.add('hide');
gameRunning = false;
showingOverlay = false;