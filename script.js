const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// DOM refs
const menuEl      = document.getElementById('menu');
const gameEl      = document.getElementById('game');
const btnVsAI     = document.getElementById('btn-vs-ai');
const btnVsPlayer = document.getElementById('btn-vs-player');
const backBtn     = document.getElementById('back-btn');
const resultEl    = document.getElementById('result-display');
const timerEl     = document.getElementById('timer');
const p1HealthEl  = document.getElementById('p1-health');
const p2HealthEl  = document.getElementById('p2-health');
const p2Controls  = document.getElementById('p2-controls');

let gameMode = 'ai';  // 'ai' | 'pvp'
let animId   = null;
let timerId  = null;
let timeLeft = 60;
let gameOver = false;

let player, enemy;

const keys = {
  w: false, a: false, s: false, d: false, space: false,
  ArrowLeft: false, ArrowRight: false, ArrowUp: false, Alt: false,
};

// ======= MENU =======
btnVsAI.addEventListener('click', () => startGame('ai'));
btnVsPlayer.addEventListener('click', () => startGame('pvp'));
backBtn.addEventListener('click', goToMenu);

function startGame(mode) {
  gameMode = mode;
  menuEl.style.display = 'none';
  gameEl.style.display = 'block';

  p2Controls.style.display = mode === 'pvp' ? 'block' : 'none';

  resultEl.style.display = 'none';
  gameOver = false;
  timeLeft = 60;
  timerEl.textContent = '60';

  resizeCanvas();
  createFighters();
  startTimer();
  if (animId) cancelAnimationFrame(animId);
  gameLoop();
}

function goToMenu() {
  cancelAnimationFrame(animId);
  clearInterval(timerId);
  gameEl.style.display = 'none';
  menuEl.style.display = 'flex';
}

// ======= FIGHTERS =======
function createFighters() {
  const W = canvas.width;
  const H = canvas.height;

  player = new Fighter({
    name: '🐗 Кабан',
    position: { x: W * 0.15, y: H * 0.3 },
    velocity: { x: 0, y: 0 },
    color: { body: '#3a5fc8', head: '#5577e8', glow: '#5577e8' },
    offset: { x: 0, y: 50 },
  });

  enemy = new Fighter({
    name: '❓ Ноунейм',
    position: { x: W * 0.75, y: H * 0.3 },
    velocity: { x: 0, y: 0 },
    color: { body: '#c83a3a', head: '#e85555', glow: '#e85555' },
    offset: { x: 0, y: 50 },
  });

  enemy.facingRight = false;
}

// ======= TIMER =======
function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (gameOver) return;
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 10) timerEl.style.color = '#ff4444';
    else timerEl.style.color = '#fff';

    if (timeLeft <= 0) {
      gameOver = true;
      determineWinner({ player, enemy, timerId, resultEl });
    }
  }, 1000);
}

// ======= AI =======
let aiActionTimer = 0;
let aiAction = 'approach';

function updateAI() {
  if (!enemy || enemy.isDead) return;

  aiActionTimer++;

  const dist = player.position.x - enemy.position.x;
  const absDist = Math.abs(dist);

  // Simple AI: approach, then attack
  if (aiActionTimer > 60) {
    aiActionTimer = 0;
    const roll = Math.random();
    if (absDist < 180) {
      aiAction = roll < 0.5 ? 'attack' : (roll < 0.75 ? 'retreat' : 'approach');
    } else {
      aiAction = roll < 0.7 ? 'approach' : 'jump';
    }
  }

  // Face player
  enemy.facingRight = player.position.x < enemy.position.x;

  switch (aiAction) {
    case 'approach':
      enemy.velocity.x = dist > 0 ? -3 : 3;
      break;
    case 'retreat':
      enemy.velocity.x = dist > 0 ? 3 : -3;
      break;
    case 'attack':
      enemy.velocity.x = 0;
      if (absDist < 160 && Math.random() < 0.08) enemy.attack();
      break;
    case 'jump':
      if (enemy.jumpCount < 1) {
        enemy.velocity.y = -14;
        enemy.jumpCount++;
      }
      enemy.velocity.x = dist > 0 ? -2 : 2;
      break;
  }

  // Always face player for attack box
  if (dist < 0) {
    enemy.facingRight = true;
  } else {
    enemy.facingRight = false;
  }
}

// ======= INPUT =======
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { keys.space = true; e.preventDefault(); }
  if (e.key === 'w' || e.key === 'W') keys.w = true;
  if (e.key === 'a' || e.key === 'A') keys.a = true;
  if (e.key === 'd' || e.key === 'D') keys.d = true;
  if (e.key === 'ArrowLeft')  keys.ArrowLeft  = true;
  if (e.key === 'ArrowRight') keys.ArrowRight = true;
  if (e.key === 'ArrowUp')    keys.ArrowUp    = true;
  if (e.key === 'Alt') { keys.Alt = true; e.preventDefault(); }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'Space')     keys.space      = false;
  if (e.key === 'w' || e.key === 'W') keys.w  = false;
  if (e.key === 'a' || e.key === 'A') keys.a  = false;
  if (e.key === 'd' || e.key === 'D') keys.d  = false;
  if (e.key === 'ArrowLeft')  keys.ArrowLeft  = false;
  if (e.key === 'ArrowRight') keys.ArrowRight = false;
  if (e.key === 'ArrowUp')    keys.ArrowUp    = false;
  if (e.key === 'Alt')        keys.Alt        = false;
});

// ======= PLAYER MOVEMENT =======
function handlePlayerInput() {
  if (!player || player.isDead) { player.velocity.x = 0; return; }

  player.velocity.x = 0;

  if (keys.d) { player.velocity.x = 5; player.facingRight = true; }
  if (keys.a) { player.velocity.x = -5; player.facingRight = false; }

  if (keys.w && player.jumpCount < 1) {
    player.velocity.y = -14;
    player.jumpCount++;
  }

  if (keys.space) player.attack();
}

function handleEnemyInput() {
  if (!enemy || enemy.isDead || gameMode === 'ai') { 
    if (enemy) enemy.velocity.x = 0; 
    return; 
  }

  enemy.velocity.x = 0;

  if (keys.ArrowRight) { enemy.velocity.x = 5; enemy.facingRight = false; }
  if (keys.ArrowLeft)  { enemy.velocity.x = -5; enemy.facingRight = true; }

  if (keys.ArrowUp && enemy.jumpCount < 1) {
    enemy.velocity.y = -14;
    enemy.jumpCount++;
  }

  if (keys.Alt) enemy.attack();
}

// ======= BACKGROUND =======
function drawBackground() {
  const W = canvas.width;
  const H = canvas.height;

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0a0614');
  sky.addColorStop(0.6, '#1a0a2e');
  sky.addColorStop(1, '#0a0a0f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (let i = 0; i < 60; i++) {
    const sx = (i * 137.5 * 7) % W;
    const sy = (i * 97.3 * 3) % (H * 0.6);
    const sr = (i % 3 === 0) ? 1.5 : 0.8;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground
  const ground = H - 60;
  const grd = ctx.createLinearGradient(0, ground, 0, H);
  grd.addColorStop(0, '#2a1a4a');
  grd.addColorStop(1, '#1a0a2e');
  ctx.fillStyle = grd;
  ctx.fillRect(0, ground, W, 60);

  // Ground line glow
  ctx.strokeStyle = '#6633cc';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#9955ff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, ground);
  ctx.lineTo(W, ground);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Arena title (faint)
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.font = 'bold 80px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('KABAN ARENA', W / 2, H * 0.5);
  ctx.textAlign = 'left';
}

// ======= HUD UPDATE =======
function updateHUD() {
  const p1Pct = Math.max(0, player.health);
  const p2Pct = Math.max(0, enemy.health);

  p1HealthEl.style.width = p1Pct + '%';
  p2HealthEl.style.width = p2Pct + '%';

  p1HealthEl.classList.toggle('low', p1Pct < 30);
  p2HealthEl.classList.toggle('low', p2Pct < 30);
}

// ======= COLLISION =======
function checkCollisions() {
  // Player hits enemy
  if (
    player.isAttacking &&
    player.attackFrame === 1 &&
    rectangularCollision({ rect1: player, rect2: enemy })
  ) {
    enemy.takeHit();
  }

  // Enemy hits player
  if (
    enemy.isAttacking &&
    enemy.attackFrame === 1 &&
    rectangularCollision({ rect1: enemy, rect2: player })
  ) {
    player.takeHit();
  }
}

// ======= BOUNDARY =======
function clampToBounds(fighter) {
  const W = canvas.width;
  if (fighter.position.x < 0) fighter.position.x = 0;
  if (fighter.position.x + fighter.width > W) fighter.position.x = W - fighter.width;
}

// ======= GAME LOOP =======
function gameLoop() {
  animId = requestAnimationFrame(gameLoop);

  drawBackground();

  handlePlayerInput();
  handleEnemyInput();
  if (gameMode === 'ai' && !gameOver) updateAI();

  player.update(ctx, canvas);
  enemy.update(ctx, canvas);

  clampToBounds(player);
  clampToBounds(enemy);

  if (!gameOver) {
    checkCollisions();
    updateHUD();

    // Check death
    if (player.isDead || enemy.isDead) {
      gameOver = true;
      determineWinner({ player, enemy, timerId, resultEl });
    }
  }
}

// ======= TOUCH CONTROLS (mobile) =======
function addTouchControls() {
  const touchArea = document.getElementById('game');

  let touchStartX = 0;

  touchArea.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;

    // Right half = attack
    if (t.clientX > window.innerWidth / 2) {
      player.attack();
    }
  }, { passive: true });

  touchArea.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const dx = t.clientX - touchStartX;

    if (Math.abs(dx) > 20) {
      player.velocity.x = dx > 0 ? 5 : -5;
      player.facingRight = dx > 0;
    } else {
      player.velocity.x = 0;
    }
  }, { passive: true });

  touchArea.addEventListener('touchend', () => {
    player.velocity.x = 0;
  }, { passive: true });
}

addTouchControls();
