
'use strict';
// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const W = 1200, H = 480;
const GRAVITY = 0.55, FRICTION = 0.82, JUMP_FORCE = -13;
const GROUND_Y = H - 80;

const SWORD_DATA = [
  { name: 'Pisau Jagung', stars: 1, dmg: 7, color: '#aaaaaa', glow: 'rgba(170,170,170,0.6)' },
  { name: 'Golok Mintul', stars: 2, dmg: 12, color: '#88aacc', glow: 'rgba(136,170,204,0.6)' },
  { name: 'Pedang Baja', stars: 3, dmg: 19, color: '#44aaff', glow: 'rgba(68,170,255,0.7)' },
  { name: 'Pedang Rune', stars: 4, dmg: 50, color: '#aa44ff', glow: 'rgba(170,68,255,0.8)' },
  { name: 'Pedang Legenda', stars: 5, dmg: 80, color: '#ffcc00', glow: 'rgba(255,204,0,0.9)' },
];

const KILL_TO_UPGRADE = [0, 5, 12, 22, 35];

const STORY_ACTS = [
  {
    act: 'Babak 1',
    title: 'Jagung Terakhir dan Sayembara Berdarah',
    text: 'Di sudut pasar Kerajaan Ardenwyr yang kumuh, Aratha hanyalah seorang pemuda miskin penjual jagung rebus. Namun, takdir mempertemukannya dengan Putri Lyra, jelmaan cahaya di tengah kejamnya kasta. Suatu senja, saat Aratha memberikan satu - satunya jagung rebus terakhir untuk Lyra, cinta terlarang pun tumbuh. Namun, dalam beberapa pekan kemudian desa mereka diserang oleh Kerajaan Obsidwyr yang dipimpin oleh Raja Obsidian. Di tengah kekacauan, Raja Malachar - ayah Lyra - mengumumkan sayembara gila: Siapapun yang bisa menaklukkan Obsidwyr, berhak menikahi Lyra. Sayembara itu adalah hukuman mati bagi rakyat jelata yang berani bermimpi.',
    bg: '#1a0a05'
  },
  {
    act: 'Babak 2',
    title: 'Demi Sebuah Cinta',
    text: 'Digerakkan oleh cinta yang buta, Aratha melangkah maju ke alun-alun istana, mendaftarkan namanya. Raja Malachar tertawa meremehkan melihat tangan kasar yang hanya terbiasa mengupas jagung itu. Lyra memohon dengan air mata agar ayahnya membatalkan niat Aratha. Namun, Raja justru melihat kesempatan untuk membuangnya. Raja mencengkeram kerah Aratha dan membisikkan syarat mustahil: "Bawa kepala Raja Obsidwyr ke hadapanku, dan arak mengelilingi desa. Jika berhasil, tahtaku dan putriku milikmu. Jika gagal, matilah." Aratha pun memulai perjalanan mautnya.',
    bg: '#0a0a1a'
  },
  {
    act: 'Babak 3',
    title: 'Darah, Keringat, dan Air Mata',
    text: 'Untuk mencapai jantung Kerajaan Obsidwyr tanpa disadari, Aratha harus menghabisi semua prajurit yang setara dewa zeus di Balai Obsidwyr yang mencekam. Bau darah dan keputusasaan menguar. Di kedalaman perjalanan kelam ini ia tidak hanya menghadapi prajurit bayangan musuh, melainkan juga Ksatria Kegelapan—sang algojo neraka yang tak kenal ampun. Berkali-kali Aratha tersungkur, namun bayangan senyum Lyra menjadi satu-satunya alasan pemuda penjual jagung ini bangkit dan mengangkat pedangnya lagi.',
    bg: '#0a1a05'
  },
  {
    act: 'Babak 4',
    title: 'Menembus Neraka Obsidian',
    text: 'Setelah pertarungan berdarah yang hampir merenggut nyawanya, Aratha berhasil mengalahkan Raja Obsidian. Namun mimpi buruk belum berakhir. Pasukan Raja Malachar yang seharusnya menjadi sekutu justru menghadangnya di jalan pulang. Sang Raja telah berkhianat, tidak pernah berniat memberikan putrinya kepada seorang penjual jagung. Aratha harus menebas jalan melalui pasukan kerajaannya sendiri.',
    bg: '#1a0005'
  },
  {
    act: 'Babak 5',
    title: 'Kepala Sang Raja dan Penagihan Janji',
    text: 'Dengan luka di sekujur tubuh, Aratha berjalan tertatih menyeret sisa-sisa pertarungan hingga ke ruang tahta Ardenwyr. Raja Malachar gemetar pucat pasi melihat pemuda yang menolak untuk mati itu. Kini, bukan lagi soal sayembara, melainkan penuntutan keadilan. Sang penjual jagung akan membuktikan sumpahnya, menagih tahta, dan merebut kembali cinta sejatinya dari tangan sang tiran.',
    bg: '#1a0f00'
  },
];

const STAGE_STORY_IDX = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]; // which story shows before each stage 1-10

const QUOTES = [
  'Pedang bisa patah, namun tekad tidak.',
  'Seorang pejuang sejati bangkit setelah tujuh kali jatuh.',
  'Cinta adalah baja paling keras di dunia.',
  'Mati di medan laga lebih mulia dari hidup dalam pengecut.',
];

// ─── STATE ───────────────────────────────────────────────────────────────────
const state = {
  screen: 'menu',   // menu | story | game | stageclear | gameover | ending
  stage: 1,
  score: 0,
  totalKills: 0,
  swordLevel: 0,    // 0-4
  killsSinceUpgrade: 0,
  stageKills: 0,
  paused: false,
  storyIndex: 0,
  pendingScreen: 'game',

  difficulty: 'normal',
  selectedSkin: 'default',

  // Progression (persist per user/device)
  totalStagesCleared: 0,
  bossObsidianDefeated: 0,
  bossMalacharDefeated: 0,
  maxStageReached: 1,
  unlockedSkins: {
    default: true,
    praajurit: false,
    ksatria: false,
    sangraja: false,
    sangdewa: false,
  },
};

// ─── INPUT ────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};
const justReleased = {};
const playableKeyCodes = new Set(['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyZ', 'KeyX', 'KeyC']);

function pressKey(code) {
  if (!keys[code]) justPressed[code] = true;
  keys[code] = true;
}

function releaseKey(code) {
  if (keys[code]) justReleased[code] = true;
  keys[code] = false;
}

window.addEventListener('keydown', e => {
  pressKey(e.code);
  if (playableKeyCodes.has(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => {
  releaseKey(e.code);
});
function clearJust() {
  for (const k in justPressed) delete justPressed[k];
  for (const k in justReleased) delete justReleased[k];
}

const virtualTouches = new Map();

function releaseVirtualControls() {
  for (const code of virtualTouches.values()) releaseKey(code);
  virtualTouches.clear();
  document.querySelectorAll('.mobile-control-btn.pressed').forEach(btn => btn.classList.remove('pressed'));
}

window.addEventListener('blur', releaseVirtualControls);

// ─── CANVAS ───────────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  const viewportW = window.visualViewport?.width || window.innerWidth;
  const viewportH = window.visualViewport?.height || window.innerHeight;
  const touchLayout = window.matchMedia ? window.matchMedia('(hover: none) and (pointer: coarse)').matches : false;
  const portraitTouch = touchLayout && viewportH > viewportW;
  let usableH = viewportH;

  if (portraitTouch) {
    usableH = Math.max(260, viewportH - Math.min(190, Math.max(140, viewportH * 0.23)));
  }

  const ratio = Math.min(viewportW / W, usableH / H);
  const canvasW = W * ratio;
  const canvasH = H * ratio;
  let canvasTop = (viewportH - canvasH) / 2;

  if (portraitTouch) {
    canvasTop = Math.max(74, Math.min((usableH - canvasH) / 2 + 34, viewportH - canvasH - 150));
  }

  canvas.style.width = canvasW + 'px';
  canvas.style.height = canvasH + 'px';
  canvas.style.left = ((viewportW - canvasW) / 2) + 'px';
  canvas.style.top = canvasTop + 'px';
  canvas.width = W;
  canvas.height = H;
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
window.visualViewport?.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─── PARTICLES ────────────────────────────────────────────────────────────────
const particles = [];
function spawnParticles(x, y, color, count = 8, speed = 4) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const s = speed * (0.5 + Math.random());
    particles.push({
      x, y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s - 2,
      life: 1, maxLife: 0.5 + Math.random() * 0.5, color, size: 2 + Math.random() * 4
    });
  }
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.15;
    p.life -= dt / p.maxLife;
    if (p.life <= 0) particles.splice(i, 1);
  }
}
function drawParticles() {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── DAMAGE NUMBERS ────────────────────────────────────────────────────────────
const dmgNums = [];
function spawnDmgNum(x, y, val, color = '#ffcc00', crit = false) {
  dmgNums.push({ x, y, val, color, crit, age: 0, vy: -1.5 - Math.random() });
}
function updateDmgNums(dt) {
  for (let i = dmgNums.length - 1; i >= 0; i--) {
    const d = dmgNums[i];
    d.age += dt * 60;
    d.y += d.vy;
    d.vy *= 0.97;
    if (d.age > 60) dmgNums.splice(i, 1);
  }
}
function drawDmgNums() {
  for (const d of dmgNums) {
    const alpha = 1 - d.age / 60;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${d.crit ? 'bold ' : ''}${d.crit ? 20 : 14}px 'Cinzel', serif`;
    ctx.fillStyle = d.color;
    ctx.shadowColor = d.color;
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText(d.crit ? `⚡${d.val}!` : d.val, d.x, d.y);
    ctx.restore();
  }
}

// ─── BACKGROUND RENDERER ──────────────────────────────────────────────────────
// Paralax layers drawn procedurally per stage
function getStageTheme(stage) {
  const themes = [
    // Stage 1-2: Village market
    {
      sky: ['#0a0515', '#1a0a2e'], fogColor: 'rgba(20,10,40,0.3)',
      midColor: '#2a1a0a', nearColor: '#1a0f05', groundColor: '#3a2010',
      label: 'Pasar Ardenwyr'
    },
    // Stage 3-4: Dark forest
    {
      sky: ['#030810', '#0a1a10'], fogColor: 'rgba(0,20,10,0.4)',
      midColor: '#0a1a08', nearColor: '#051005', groundColor: '#1a2a10',
      label: 'Hutan Terlarang'
    },
    // Stage 5-6: Castle approach
    {
      sky: ['#0f0010', '#1a0020'], fogColor: 'rgba(20,0,30,0.35)',
      midColor: '#1a0a20', nearColor: '#0f0015', groundColor: '#2a1a30',
      label: 'Gerbang Obsidian'
    },
    // Stage 7-8: Obsidian fortress
    {
      sky: ['#050010', '#0a0020'], fogColor: 'rgba(50,0,20,0.4)',
      midColor: '#150010', nearColor: '#0a0008', groundColor: '#200015',
      label: 'Benteng Obsidian'
    },
    // Stage 9-10: Throne room
    {
      sky: ['#100005', '#200010'], fogColor: 'rgba(80,0,0,0.4)',
      midColor: '#200008', nearColor: '#150005', groundColor: '#2a0010',
      label: 'Ruang Tahta Raja'
    },
  ];
  return themes[Math.min(Math.floor((stage - 1) / 2), 4)];
}

let bgStars = [];
function initBgStars() {
  bgStars = [];
  for (let i = 0; i < 120; i++) {
    bgStars.push({
      x: Math.random() * W, y: Math.random() * (H * 0.55),
      r: 0.5 + Math.random() * 1.5, twinkle: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.05
    });
  }
}
initBgStars();

let bgOffset = 0; // parallax camera offset
function drawBackground(stage) {
  const t = getStageTheme(stage);
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  skyGrad.addColorStop(0, t.sky[0]);
  skyGrad.addColorStop(1, t.sky[1]);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Stars
  const now = performance.now() / 1000;
  for (const s of bgStars) {
    s.twinkle += s.speed;
    const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#e8d5a3';
    ctx.shadowColor = '#e8d5a3';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc((s.x - bgOffset * 0.1 + W * 10) % W, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Moon
  ctx.save();
  ctx.fillStyle = 'rgba(200,180,120,0.35)';
  ctx.shadowColor = 'rgba(201,168,76,0.4)';
  ctx.shadowBlur = 40;
  ctx.beginPath();
  ctx.arc(W * 0.8, H * 0.15, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(220,200,140,0.6)';
  ctx.beginPath();
  ctx.arc(W * 0.8, H * 0.15, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Far mountains (parallax layer 1)
  drawMountains(bgOffset * 0.15, t.midColor, 0.4, stage);

  // Mid layer - castle silhouette or trees
  drawMidLayer(bgOffset * 0.35, t.nearColor, stage);

  // Fog
  const fogGrad = ctx.createLinearGradient(0, H * 0.4, 0, GROUND_Y);
  fogGrad.addColorStop(0, 'transparent');
  fogGrad.addColorStop(1, t.fogColor);
  ctx.fillStyle = fogGrad;
  ctx.fillRect(0, 0, W, H);

  // Ground
  const gGrad = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gGrad.addColorStop(0, t.groundColor);
  gGrad.addColorStop(1, '#050505');
  ctx.fillStyle = gGrad;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  // Day-Night Transition overlay
  const time = Date.now() / 1000;
  const dayCycle = (Math.sin(time * 0.1) + 1) / 2; // 0 to 1
  ctx.fillStyle = `rgba(10, 5, 20, ${0.5 * dayCycle})`; // Darken for night
  ctx.fillRect(0, 0, W, H);

  // Ground highlight line
  ctx.strokeStyle = 'rgba(201,168,76,0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y); ctx.lineTo(W, GROUND_Y);
  ctx.stroke();

  // Ground texture
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  for (let gx = (-bgOffset * 0.5 % 60 + 60) % 60; gx < W; gx += 60) {
    ctx.beginPath();
    ctx.moveTo(gx, GROUND_Y + 5);
    ctx.lineTo(gx, H);
    ctx.stroke();
  }
}

// Weather particles
const weatherParticles = [];
function updateWeather() {
  if (Math.random() < 0.2) {
    weatherParticles.push({
      x: Math.random() * W + camX, y: -20,
      vx: (Math.random() - 0.5) * 3 - 1, vy: 1 + Math.random() * 2,
      type: state.stage > 5 ? 'ash' : 'leaf'
    });
  }
  for (let i = weatherParticles.length - 1; i >= 0; i--) {
    let p = weatherParticles[i];
    p.x += p.vx; p.y += p.vy;
    if (p.type === 'ash') p.vy -= 0.01;
    if (p.y > H || p.y < -50) weatherParticles.splice(i, 1);
  }
}
function drawWeather() {
  ctx.save();
  weatherParticles.forEach(p => {
    ctx.fillStyle = p.type === 'ash' ? 'rgba(255,80,30,0.6)' : 'rgba(40,180,40,0.4)';
    ctx.beginPath();
    ctx.arc(p.x - camX, p.y, p.type === 'ash' ? 1.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawMountains(offset, color, alpha, stage) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.7);
  const peaks = 8;
  for (let i = 0; i <= peaks; i++) {
    const px = (i / peaks) * W * 1.5 - (offset % (W * 1.5));
    const h = H * 0.2 + Math.sin(i * 1.7 + stage) * H * 0.15;
    if (i === 0) ctx.lineTo(px, H * 0.7 - h);
    else ctx.lineTo(px, H * 0.7 - h);
    if (i < peaks) ctx.lineTo(px + W * 0.75 / peaks * 0.5, H * 0.7 - h * 0.4);
  }
  ctx.lineTo(W, H * 0.7);
  ctx.lineTo(0, H * 0.7);
  ctx.closePath();
  ctx.fill();

  // Snow caps on mountains
  ctx.globalAlpha = alpha * 0.3;
  ctx.fillStyle = '#d0c0a0';
  ctx.fill();
  ctx.restore();
}

function drawMidLayer(offset, color, stage) {
  ctx.save();
  ctx.fillStyle = color;
  // Draw castle towers or trees based on stage
  const isForest = stage <= 4;
  const count = isForest ? 20 : 12;
  for (let i = 0; i < count; i++) {
    const bx = ((i / count) * W * 2 - offset + W * 2) % (W * 2.2) - 100;
    if (isForest) {
      // Tree
      const th = 60 + Math.sin(i * 3.1) * 30;
      ctx.fillRect(bx - 5, GROUND_Y - th, 10, th);
      ctx.beginPath();
      ctx.moveTo(bx, GROUND_Y - th - 40);
      ctx.lineTo(bx - 25, GROUND_Y - th + 20);
      ctx.lineTo(bx + 25, GROUND_Y - th + 20);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bx, GROUND_Y - th - 70);
      ctx.lineTo(bx - 18, GROUND_Y - th - 20);
      ctx.lineTo(bx + 18, GROUND_Y - th - 20);
      ctx.closePath();
      ctx.fill();
    } else {
      // Castle tower
      const th = 80 + Math.sin(i * 2.5) * 40;
      const tw = 18 + Math.sin(i) * 8;
      ctx.fillRect(bx - tw / 2, GROUND_Y - th, tw, th);
      // Battlements
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(bx - tw / 2 + j * (tw / 3), GROUND_Y - th - 14, tw / 3 - 3, 14);
      }
    }
  }
  ctx.restore();
}

// ─── PLAYER ───────────────────────────────────────────────────────────────────
const player = {
  x: 150, y: GROUND_Y,
  w: 32, h: 56,
  vx: 0, vy: 0,
  onGround: false,
  facingRight: true,
  hp: 200, maxHp: 200,
  // attack state
  attackTimer: 0,
  attackType: null, // 'slash'|'doubleSlash'|'heavySlash'|'spinSlash'
  attackPhase: 0,
  isBlocking: false,
  blockTimer: 0,
  invTimer: 0,   // invincibility frames after hit
  // animation
  animFrame: 0,
  animTimer: 0,
  animState: 'idle', // idle|run|jump|attack|block|hurt
  comboCount: 0,
  comboTimer: 0,
  // jump special
  jumpAttackDone: false,
};
function resetPlayer() {
  Object.assign(player, {
    x: 150, y: GROUND_Y, vx: 0, vy: 0,
    onGround: false, facingRight: true,
    hp: 200, maxHp: 200,
    attackTimer: 0, attackType: null, attackPhase: 0,
    isBlocking: false, blockTimer: 0, invTimer: 0,
    animFrame: 0, animTimer: 0, animState: 'idle',
    comboCount: 0, comboTimer: 0, jumpAttackDone: false,
  });
}

// ─── ENEMIES ──────────────────────────────────────────────────────────────────
const enemies = [];
const ENEMY_TYPES = {
  grunt: { w: 28, h: 48, hp: 40, maxHp: 40, dmg: 10, speed: 1.2, color: '#553322', armorColor: '#887766', score: 100 },
  archer: { w: 26, h: 46, hp: 28, maxHp: 28, dmg: 14, speed: 0.9, color: '#334422', armorColor: '#667755', score: 120 },
  knight: { w: 34, h: 54, hp: 90, maxHp: 90, dmg: 22, speed: 0.8, color: '#222244', armorColor: '#4455aa', score: 250 },
  heavy: { w: 40, h: 58, hp: 140, maxHp: 140, dmg: 35, speed: 0.5, color: '#442222', armorColor: '#883333', score: 400 },
  bossObsidian: { w: 56, h: 72, hp: 3000, maxHp: 3000, dmg: 45, speed: 1.0, color: '#1a0010', armorColor: '#660033', score: 2000 },
  bossMalachar: { w: 56, h: 72, hp: 5000, maxHp: 5000, dmg: 55, speed: 1.2, color: '#2a1a00', armorColor: '#c9a84c', score: 3000 },
};

function spawnEnemy(type, x) {
  const t = ENEMY_TYPES[type];
  const mult = getEnemyDifficultyMultipliers();
  const hp = Math.round(t.hp * (mult.hp));
  const maxHp = Math.round(t.maxHp * (mult.hp));
  const dmg = Math.round(t.dmg * (mult.dmg));
  const speed = t.speed * mult.speed;

  enemies.push({
    ...t,
    hp,
    maxHp,
    dmg,
    speed,
    type,
    x, y: GROUND_Y,
    vx: 0, vy: 0,
    onGround: false,
    facingRight: false,
    attackTimer: 0, attackCooldown: type === 'archer' ? 120 : 80,
    hitFlash: 0,
    dead: false,
    dyingTimer: 0,
    aiTimer: Math.random() * 60,
    aggroRange: type === 'archer' ? 400 : 200,
    projectiles: [],
    stunTimer: 0,
    animFrame: 0, animTimer: 0,
    shadow: true,
    _hitBySlashId: -1,
  });
  if (type === 'bossObsidian' || type === 'bossMalachar') AudioManager.play('bossAppear');
}

function getStageEnemyWaves(stage) {
  // Returns array of waves. Each wave = array of {type, x, delay}
  const waves = [];
  if (stage <= 2) {
    waves.push([
      { type: 'grunt', x: 600 }, { type: 'grunt', x: 750 }, { type: 'grunt', x: 900 },
    ]);
    waves.push([
      { type: 'grunt', x: 700 }, { type: 'archer', x: 900 }, { type: 'grunt', x: 1100 },
    ]);
    if (stage === 2) waves.push([{ type: 'knight', x: 700 }, { type: 'grunt', x: 850 }]);
  } else if (stage <= 4) {
    waves.push([{ type: 'knight', x: 600 }, { type: 'grunt', x: 800 }, { type: 'archer', x: 950 }]);
    waves.push([{ type: 'knight', x: 700 }, { type: 'knight', x: 900 }, { type: 'archer', x: 1050 }]);
    if (stage === 4) waves.push([{ type: 'heavy', x: 700 }, { type: 'archer', x: 900 }]);
  } else if (stage <= 6) {
    waves.push([{ type: 'heavy', x: 600 }, { type: 'knight', x: 800 }, { type: 'archer', x: 1000 }]);
    if (stage === 6) waves.push([{ type: 'bossObsidian', x: 800 }]);
    else waves.push([{ type: 'heavy', x: 700 }, { type: 'heavy', x: 900 }]);
  } else if (stage <= 8) {
    waves.push([{ type: 'heavy', x: 600 }, { type: 'heavy', x: 800 }, { type: 'knight', x: 1000 }]);
    waves.push([{ type: 'heavy', x: 700 }, { type: 'archer', x: 850 }, { type: 'knight', x: 1050 }]);
  } else {
    waves.push([{ type: 'heavy', x: 600 }, { type: 'heavy', x: 800 }, { type: 'heavy', x: 1000 }]);
    waves.push([{ type: 'knight', x: 650 }, { type: 'archer', x: 850 }, { type: 'heavy', x: 1050 }]);
    // Stage 10: boss wave
    if (stage === 10) waves.push([{ type: 'bossMalachar', x: 800 }]);
    else waves.push([{ type: 'heavy', x: 700 }, { type: 'heavy', x: 900 }]);
  }
  return waves;
}

// ─── PROJECTILES ─────────────────────────────────────────────────────────────
const projectiles = [];
function spawnArrow(x, y, facingRight, dmg) {
  projectiles.push({
    x, y, vx: facingRight ? 7 : -7, vy: -0.5, dmg, fromEnemy: true,
    w: 18, h: 6, life: 180
  });
}

// ─── SLASHES (visual hit areas) ───────────────────────────────────────────────
const slashes = [];
let _slashUID = 0;
function spawnSlash(x, y, w, h, facingRight, dmg, type, knockback = 4) {
  slashes.push({
    id: _slashUID++, x: facingRight ? x : x - w, y, w, h, dmg, type,
    knockback: facingRight ? knockback : -knockback,
    life: type === 'spin' ? 20 : 10,
    maxLife: type === 'spin' ? 20 : 10,
    angle: 0, facingRight
  });
}

// ─── WAVE MANAGER ─────────────────────────────────────────────────────────────
const waveManager = {
  waves: [], currentWave: 0, allCleared: false,
  spawnTimer: 0,
};
function initWaves(stage) {
  waveManager.waves = getStageEnemyWaves(stage);
  waveManager.currentWave = 0;
  waveManager.allCleared = false;
  waveManager.spawnTimer = 60;
  enemies.length = 0;
  projectiles.length = 0;
  slashes.length = 0;
  particles.length = 0;
  dmgNums.length = 0;
}
function updateWaveManager() {
  if (waveManager.allCleared) return;
  const wavesDone = enemies.length === 0 && waveManager.spawnTimer <= 0;
  if (wavesDone) {
    waveManager.currentWave++;
    if (waveManager.currentWave >= waveManager.waves.length) {
      waveManager.allCleared = true;
      return;
    }
    waveManager.spawnTimer = 90;
  }
  if (waveManager.spawnTimer > 0) {
    waveManager.spawnTimer--;
    if (waveManager.spawnTimer === 0 && waveManager.currentWave < waveManager.waves.length) {
      const wave = waveManager.waves[waveManager.currentWave];
      for (const e of wave) spawnEnemy(e.type, e.x);
    }
  }
}

// ─── CAMERA ──────────────────────────────────────────────────────────────────
let camX = 0;
const MAP_W = 3000;
function updateCamera() {
  const target = player.x - W * 0.35;
  camX += (target - camX) * 0.08;
  camX = Math.max(0, Math.min(MAP_W - W, camX));
  bgOffset = camX;
}

// ─── DIFFICULTY & PROGRESSION ───────────────────────────────────────────────
function getDeviceKey() {
  // Persist per user/device. IP asli butuh server-side.
  // Gunakan proxy identifier: hostname + userAgent (agar beda device biasanya beda progress).
  return `ardenwyr:${location.hostname}:${(navigator.userAgent || '').slice(0, 80)}`;
}

function loadProgress() {
  try {
    const key = `ardenwyr_progress_v1:${getDeviceKey()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && typeof data === 'object') {
      state.totalStagesCleared = Number(data.totalStagesCleared || 0);
      state.maxStageReached = Number(data.maxStageReached || 1);
      state.bossObsidianDefeated = Number(data.bossObsidianDefeated || 0);
      state.bossMalacharDefeated = Number(data.bossMalacharDefeated || 0);
      state.unlockedSkins = {
        default: true,
        praajurit: !!data.unlockedSkins?.praajurit,
        ksatria: !!data.unlockedSkins?.ksatria,
        sangraja: !!data.unlockedSkins?.sangraja,
        sangdewa: !!data.unlockedSkins?.sangdewa,
      };
      state.selectedSkin = data.selectedSkin || state.selectedSkin;
      if (!state.unlockedSkins[state.selectedSkin]) state.selectedSkin = 'default';
    }
  } catch (e) {
    // ignore
  }
}

function saveProgress() {
  try {
    const key = `ardenwyr_progress_v1:${getDeviceKey()}`;
    localStorage.setItem(key, JSON.stringify({
      totalStagesCleared: state.totalStagesCleared,
      maxStageReached: state.maxStageReached,
      bossObsidianDefeated: state.bossObsidianDefeated,
      bossMalacharDefeated: state.bossMalacharDefeated,
      unlockedSkins: state.unlockedSkins,
      selectedSkin: state.selectedSkin,
    }));
  } catch (e) {
    // ignore
  }
}

const SKINS = {
  default: { name: 'Penjual Jagung', cape: '#8b1a1a', tabard: '#c9a84c', headband: '#8b1a1a', armor: '#3a2010', helm: '#221100', eyes: '#ff2200' },
  praajurit: { name: 'Prajurit', cape: '#330015', tabard: '#887766', headband: '#660033', armor: '#1a0010', helm: '#2a2a3e', eyes: '#88ff88' },
  ksatria: { name: 'Ksatria', cape: '#1a1020', tabard: '#c9a84c', headband: '#4455aa', armor: '#110a05', helm: '#e8d5a3', eyes: '#44ccff' },
  sangraja: { name: 'Sang Raja', cape: '#2a1a00', tabard: '#ffcc00', headband: '#7a5c1a', armor: '#3a2010', helm: '#f0d070', eyes: '#ffcc44' },
  sangdewa: { name: 'Sang Dewa', cape: '#660033', tabard: '#e8d5a3', headband: '#ffcc00', armor: '#110008', helm: '#fff8d6', eyes: '#ff5533' },
};

function getSkin() {
  const sk = SKINS[state.selectedSkin] || SKINS.default;
  return sk;
}

function maybeUnlockSkins() {
  const cleared = state.totalStagesCleared;
  const maxStage = state.maxStageReached;

  if (maxStage >= 5) state.unlockedSkins.praajurit = true;
  if (maxStage >= 7) state.unlockedSkins.ksatria = true;
  if (cleared >= 32) state.unlockedSkins.sangraja = true;

  if (state.bossObsidianDefeated >= 5 && state.bossMalacharDefeated >= 5) {
    state.unlockedSkins.sangdewa = true;
  }

  // auto pick first unlocked if current invalid
  if (!state.unlockedSkins[state.selectedSkin]) {
    if (state.unlockedSkins.sangdewa) state.selectedSkin = 'sangdewa';
    else if (state.unlockedSkins.sangraja) state.selectedSkin = 'sangraja';
    else if (state.unlockedSkins.ksatria) state.selectedSkin = 'ksatria';
    else if (state.unlockedSkins.praajurit) state.selectedSkin = 'praajurit';
    else state.selectedSkin = 'default';
  }
}

// Skin unlock notification — defined immediately after maybeUnlockSkins so it's
// available when killEnemy / showStageClear call maybeUnlockSkinsWithNotif.
let skinUnlockNotif = null;
let skinUnlockTimer = 0;
function showSkinUnlockNotif(skinKey) {
  const sk = SKINS[skinKey];
  if (!sk) return;
  skinUnlockNotif = sk.name;
  skinUnlockTimer = 240; // ~4 seconds at 60fps
}
function drawSkinUnlockNotif() {
  if (!skinUnlockNotif || skinUnlockTimer <= 0) return;
  skinUnlockTimer--;
  const alpha = skinUnlockTimer > 180 ? (240 - skinUnlockTimer) / 60 : Math.min(1, skinUnlockTimer / 60);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  const bw = 420, bh = 52;
  const bx = (W - bw) / 2, by = H - 80;
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.font = 'bold 16px Cinzel, serif';
  ctx.fillStyle = '#f0d070';
  ctx.shadowColor = '#f0d070';
  ctx.shadowBlur = 10;
  ctx.textAlign = 'center';
  ctx.fillText('\ud83c\udfc6 SKIN TERBUKA: ' + skinUnlockNotif.toUpperCase(), W / 2, by + bh / 2 + 6);
  ctx.restore();
}
function maybeUnlockSkinsWithNotif() {
  const before = { ...state.unlockedSkins };
  maybeUnlockSkins();
  for (const key of Object.keys(state.unlockedSkins)) {
    if (state.unlockedSkins[key] && !before[key]) {
      showSkinUnlockNotif(key);
    }
  }
}

function applyDifficulty(applyToPlayer = false) {
  const d = state.difficulty || 'normal';

  // enemy multipliers applied during spawn (lightweight) via global variables
  // (karena ENEMY_TYPES konstanta, kita skalakan instance HP/dmg di spawnEnemy)
  if (!applyToPlayer) {
    return;
  }

  // Apply player HP multiplier after resetPlayer()
  const baseMaxHp = 200;
  let hpMult = 1;
  if (d === 'easy') hpMult = 1.35;
  else if (d === 'hard') hpMult = 0.8;
  else if (d === 'insane') hpMult = 0.65;

  player.maxHp = Math.round(baseMaxHp * hpMult);
  player.hp = player.hp > 0 ? Math.min(player.hp, player.maxHp) : player.maxHp;
}

function getEnemyDifficultyMultipliers() {
  const d = state.difficulty || 'normal';
  if (d === 'easy') return { hp: 0.78, dmg: 0.78, speed: 0.95 };
  if (d === 'hard') return { hp: 1.35, dmg: 1.25, speed: 1.05 };
  if (d === 'insane') return { hp: 1.75, dmg: 1.5, speed: 1.12 };
  return { hp: 1, dmg: 1, speed: 1 };
}

let skinRenderOverride = null;


// ─── PLAYER UPDATE ────────────────────────────────────────────────────────────
const ACTION_NAMES = {
  slash: { label: '⚔ TEBAS', color: '#ffcc44' },
  doubleSlash: { label: '⚔⚔ TEBAS GANDA', color: '#44ccff' },
  heavySlash: { label: '💥 TEBAS BERAT', color: '#ff8844' },
  spinSlash: { label: '🌀 TEBASAN BERPUTAR', color: '#aa44ff' },
  block: { label: '🛡 TANGKIS', color: '#88ff88' },
};
let actionLabelTimer = 0;
let actionLabelData = null;
let comboDisplayTimer = 0;

function showActionLabel(type) {
  actionLabelData = ACTION_NAMES[type];
  actionLabelTimer = 60;
}

function updatePlayer(dt) {
  const sword = SWORD_DATA[state.swordLevel];
  // Timers
  if (player.invTimer > 0) player.invTimer--;
  if (player.attackTimer > 0) player.attackTimer--;
  if (player.blockTimer > 0) player.blockTimer--;
  if (player.comboTimer > 0) { player.comboTimer--; if (player.comboTimer <= 0) player.comboCount = 0; }
  if (actionLabelTimer > 0) actionLabelTimer--;
  if (comboDisplayTimer > 0) comboDisplayTimer--;

  const attacking = player.attackTimer > 0;

  // Blocking
  player.isBlocking = !attacking && keys['KeyC'];
  if (player.isBlocking) { showActionLabel('block'); }

  // Movement (restricted during attacks)
  if (!attacking) {
    if (keys['ArrowLeft']) {
      player.vx -= 0.7;
      player.facingRight = false;
      if (player.animState !== 'run' && player.onGround) player.animState = 'run';
    } else if (keys['ArrowRight']) {
      player.vx += 0.7;
      player.facingRight = true;
      if (player.animState !== 'run' && player.onGround) player.animState = 'run';
    } else {
      if (player.onGround && !attacking) player.animState = 'idle';
    }
  }

  // Jump
  const spaceDown = justPressed['Space'];
  if (spaceDown && player.onGround && !attacking) {
    player.vy = JUMP_FORCE;
    player.onGround = false;
    player.jumpAttackDone = false;
    player.animState = 'jump';
    spawnParticles(player.x - camX, GROUND_Y, '#c9a84c', 5, 3);
    AudioManager.play('jump');
  }

  // Attacks
  if (!attacking) {
    const spaceHeld = keys['Space'];
    const zPressed = justPressed['KeyZ'];
    const xPressed = justPressed['KeyX'];

    if (spaceHeld && zPressed && !player.jumpAttackDone) {
      // Heavy slash + jump if on ground
      if (player.onGround) { player.vy = JUMP_FORCE * 0.8; player.onGround = false; }
      player.attackType = 'heavySlash';
      player.attackTimer = 30;
      player.jumpAttackDone = true;
      const dmg = Math.round(sword.dmg * 2.2);
      const sx = player.facingRight ? player.x + player.w : player.x - 70;
      spawnSlash(sx, player.y - player.h, 70, player.h * 1.2, player.facingRight, dmg, 'heavy', 8);
      spawnParticles(player.x - camX + (player.facingRight ? 40 : -40), player.y - player.h * 0.5, sword.color, 15, 6);
      showActionLabel('heavySlash'); state.score += 5; player.animState = 'attack';
      AudioManager.play('heavySlash');

    } else if (spaceHeld && xPressed) {
      // Spin slash
      player.attackType = 'spinSlash';
      player.attackTimer = 40;
      const dmg = Math.round(sword.dmg * 1.8);
      spawnSlash(player.x - 50, player.y - player.h, 100, player.h, player.facingRight, dmg, 'spin', 6);
      spawnParticles(player.x - camX, player.y - player.h * 0.5, sword.color, 20, 7);
      showActionLabel('spinSlash'); state.score += 5; player.animState = 'attack';
      AudioManager.play('spinSlash');

    } else if (zPressed) {
      // Single slash
      player.attackType = 'slash';
      player.attackTimer = 18;
      const dmg = sword.dmg;
      const sx = player.facingRight ? player.x + player.w * 0.5 : player.x - 55;
      spawnSlash(sx, player.y - player.h, 55, player.h, player.facingRight, dmg, 'slash', 4);
      spawnParticles(player.x - camX + (player.facingRight ? 35 : -35), player.y - player.h * 0.5, sword.color, 6, 4);
      showActionLabel('slash'); state.score += 2; player.animState = 'attack';
      AudioManager.play('slash');

    } else if (xPressed) {
      // Double slash
      player.attackType = 'doubleSlash';
      player.attackTimer = 30;
      const dmg = Math.round(sword.dmg * 1.4);
      const sx = player.facingRight ? player.x + player.w * 0.5 : player.x - 60;
      spawnSlash(sx, player.y - player.h, 60, player.h, player.facingRight, dmg, 'slash', 5);
      // Second hit delayed
      setTimeout(() => {
        if (!gameRunning) return;
        const sx2 = player.facingRight ? player.x + player.w * 0.5 : player.x - 60;
        spawnSlash(sx2, player.y - player.h, 60, player.h, player.facingRight, dmg, 'slash', 5);
        spawnParticles(player.x - camX + (player.facingRight ? 40 : -40), player.y - player.h * 0.5, sword.color, 8, 5);
      }, 200);
      spawnParticles(player.x - camX + (player.facingRight ? 35 : -35), player.y - player.h * 0.5, sword.color, 8, 5);
      showActionLabel('doubleSlash'); state.score += 4; player.animState = 'attack';
      AudioManager.play('doubleSlash');
    }
  }

  // Physics
  player.vx *= FRICTION;
  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  // Ground collision
  if (player.y >= GROUND_Y) {
    player.y = GROUND_Y;
    player.vy = 0;
    player.onGround = true;
    player.jumpAttackDone = false;
    if (player.animState === 'jump') player.animState = 'idle';
  }

  // Map bounds
  player.x = Math.max(20, Math.min(MAP_W - 20, player.x));

  // Slash hitbox vs enemies
  for (let si = slashes.length - 1; si >= 0; si--) {
    const s = slashes[si];
    s.life--;
    s.angle += s.type === 'spin' ? 0.4 : 0.1;
    if (s.life <= 0) { slashes.splice(si, 1); continue; }
    for (const e of enemies) {
      if (e.dead || e._hitBySlashId === s.id) continue;
      if (rectsOverlap(s.x, s.y, s.w, s.h, e.x - e.w / 2, e.y - e.h, e.w, e.h)) {
        const isCrit = Math.random() < 0.2;
        const dmg = isCrit ? Math.round(s.dmg * 1.7) : s.dmg;
        const blocked = e.type === 'heavy' && Math.random() < 0.2;
        const finalDmg = blocked ? Math.round(dmg * 0.3) : dmg;
        e.hp -= finalDmg;
        e.hitFlash = 12;
        e.stunTimer = 20;
        e.vx += s.knockback;
        e._hitBySlashId = s.id;
        
        player.comboCount++;
        player.comboTimer = 120;
        comboDisplayTimer = 90;

        const dColor = isCrit ? '#ff4444' : sword.color;
        spawnDmgNum(e.x - camX, e.y - e.h - 10, finalDmg, dColor, isCrit);
        spawnParticles(e.x - camX, e.y - e.h / 2, '#cc2222', 6, 4);
        AudioManager.play('hit');
        if (e.hp <= 0 && !e.dead) killEnemy(e);
      }
    }
  }

  // Projectile vs player
  for (let pi = projectiles.length - 1; pi >= 0; pi--) {
    const p = projectiles[pi];
    p.x += p.vx; p.y += p.vy; p.vy += 0.05;
    p.life--;
    if (p.life <= 0 || p.x < 0 || p.x > MAP_W) { projectiles.splice(pi, 1); continue; }
    if (p.fromEnemy && player.invTimer <= 0) {
      if (rectsOverlap(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h,
        player.x - player.w / 2, player.y - player.h, player.w, player.h)) {
        let dmg = p.dmg;
        if (player.isBlocking) dmg = Math.round(dmg * 0.15);
        hitPlayer(dmg);
        projectiles.splice(pi, 1);
        spawnParticles(player.x - camX, player.y - player.h / 2, '#ff4444', 6, 3);
      }
    }
  }

  // Animation
  player.animTimer++;
  if (player.animTimer > 8) { player.animTimer = 0; player.animFrame = (player.animFrame + 1) % 4; }
}

function hitPlayer(dmg) {
  player.hp -= dmg;
  player.invTimer = 40;
  spawnDmgNum(player.x - camX, player.y - player.h - 10, dmg, '#ff4444');
  if (player.isBlocking) AudioManager.play('block');
  else AudioManager.play('playerHit');
  if (player.hp <= 0) {
    player.hp = 0;
    setTimeout(() => showGameOver(), 600);
  }
}

function killEnemy(e) {
  e.dead = true;
  e.dyingTimer = 40;
  state.score += e.score;
  state.totalKills++;
  state.stageKills++;
  state.killsSinceUpgrade++;

  // Boss progression
  if (e.type === 'bossObsidian') {
    state.bossObsidianDefeated++;
    saveProgress();
    maybeUnlockSkinsWithNotif();
  }
  if (e.type === 'bossMalachar') {
    state.bossMalacharDefeated++;
    saveProgress();
    maybeUnlockSkinsWithNotif();
  }

  spawnParticles(e.x - camX, e.y - e.h / 2, '#cc2222', 14, 6);
  spawnParticles(e.x - camX, e.y - e.h / 2, '#ffcc44', 6, 3);
  AudioManager.play('enemyDeath');
  checkSwordUpgrade();
  updateHUD();
}

function checkSwordUpgrade() {
  if (state.swordLevel < 4) {
    const needed = KILL_TO_UPGRADE[state.swordLevel + 1] - KILL_TO_UPGRADE[state.swordLevel];
    if (state.killsSinceUpgrade >= needed) {
      state.swordLevel++;
      state.killsSinceUpgrade = 0;
      const sword = SWORD_DATA[state.swordLevel];
      spawnParticles(player.x - camX, player.y - player.h, sword.color, 30, 7);
      flashSwordUpgrade(sword.name);
      AudioManager.play('swordUpgrade');
    }
  }
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ─── ENEMY UPDATE ─────────────────────────────────────────────────────────────
function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.dead) {
      e.dyingTimer--;
      e.y += 1;
      e.vy += GRAVITY;
      if (e.dyingTimer <= 0) enemies.splice(i, 1);
      continue;
    }
    if (e.stunTimer > 0) e.stunTimer--;
    if (e.hitFlash > 0) e.hitFlash--;
    if (e.attackTimer > 0) e.attackTimer--;

    // AI
    const dx = player.x - e.x;
    const dist = Math.abs(dx);
    e.facingRight = dx > 0;

    if (e.stunTimer <= 0) {
      if (e.type === 'archer') {
        // Keep distance and shoot
        if (dist < 150) e.vx += dx > 0 ? -0.4 : 0.4;
        else if (dist > 350) e.vx += dx > 0 ? 0.4 : -0.4;
        if (e.attackTimer <= 0 && dist < e.aggroRange) {
          e.attackTimer = e.attackCooldown;
          spawnArrow(e.x, e.y - e.h * 0.6, e.facingRight, e.dmg);
        }
      } else {
        // Rush player
        if (dist > e.w * 0.8) {
          e.vx += dx > 0 ? e.speed * 0.2 : -e.speed * 0.2;
        }
        // Melee attack
        if (dist < e.w + player.w && e.attackTimer <= 0) {
          e.attackTimer = e.attackCooldown;
          if (player.invTimer <= 0) {
            let dmg = e.dmg;
            if (player.isBlocking) dmg = Math.round(dmg * 0.12);
            hitPlayer(dmg);
          }
        }
        // Boss special: charge
        if ((e.type === 'bossObsidian' || e.type === 'bossMalachar') && e.attackTimer === 60) {
          e.vx = dx > 0 ? 6 : -6;
          spawnParticles(e.x - camX, e.y - e.h * 0.5, e.type === 'bossMalachar' ? '#ffcc00' : '#cc0022', 20, 6);
        }
      }
    }

    // Physics
    e.vx *= FRICTION;
    e.x += e.vx;
    e.vy += GRAVITY;
    e.y += e.vy;
    if (e.y >= GROUND_Y) { e.y = GROUND_Y; e.vy = 0; e.onGround = true; }
    e.x = Math.max(20, Math.min(MAP_W - 20, e.x));

    // Anim
    e.animTimer++;
    if (e.animTimer > 10) { e.animTimer = 0; e.animFrame = (e.animFrame + 1) % 4; }
  }
}

// ─── DRAWING ──────────────────────────────────────────────────────────────────
function drawShadow(cx, y, w) {
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(cx - camX, y, w * 0.6, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  const p = player;
  const cx = p.x - camX;
  const cy = p.y;
  const sword = SWORD_DATA[state.swordLevel];
  const skin = getSkin();
  const skinKey = state.selectedSkin;

  drawShadow(p.x, GROUND_Y + 3, p.w * 0.9);
  if (p.invTimer > 0 && Math.floor(p.invTimer / 4) % 2 === 1) return;

  ctx.save();
  ctx.translate(cx, cy);
  if (!p.facingRight) ctx.scale(-1, 1);

  const runOff = p.animState === 'run' ? Math.sin(p.animFrame * 1.5) * 6 : 0;
  const armSwing = p.attackTimer > 0 ? Math.sin((20 - p.attackTimer) / 20 * Math.PI) * 12 : 0;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // ── Sang Dewa: divine aura behind character ──
  if (skinKey === 'sangdewa') {
    ctx.save();
    const auraPhase = Date.now() / 600;
    ctx.globalAlpha = 0.12 + 0.08 * Math.sin(auraPhase);
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.ellipse(0, -p.h * 0.45, p.w * 1.2, p.h * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    // Inner divine glow
    ctx.globalAlpha = 0.08 + 0.06 * Math.sin(auraPhase * 1.7);
    ctx.fillStyle = '#ff5533';
    ctx.shadowColor = '#ff5533';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.ellipse(0, -p.h * 0.45, p.w * 0.7, p.h * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Cape
  ctx.fillStyle = skin.cape;
  ctx.beginPath();
  ctx.moveTo(-6, -p.h + 14);
  ctx.quadraticCurveTo(-20, -p.h + 20 + runOff, -15 - runOff * 1.5, -5);
  ctx.lineTo(-5, -5);
  ctx.fill();

  // ── Sang Raja & Sang Dewa: longer royal cape ──
  if (skinKey === 'sangraja' || skinKey === 'sangdewa') {
    ctx.fillStyle = skinKey === 'sangdewa' ? '#440022' : '#1a0a00';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(-8, -p.h + 16);
    ctx.quadraticCurveTo(-28, -p.h + 26 + runOff, -22 - runOff * 1.2, 0);
    ctx.lineTo(-6, 0);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Back Leg
  ctx.strokeStyle = '#1a0f05'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-3, -20); ctx.lineTo(-6 + runOff, -4); ctx.stroke();
  // Front Leg
  ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(3, -20); ctx.lineTo(6 - runOff, -4); ctx.stroke();

  // ── Ksatria / Sang Raja / Sang Dewa: leg armor (greaves) ──
  if (skinKey === 'ksatria' || skinKey === 'sangraja' || skinKey === 'sangdewa') {
    ctx.strokeStyle = skin.headband; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-4, -14); ctx.lineTo(-6 + runOff * 0.5, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -14); ctx.lineTo(6 - runOff * 0.5, -6); ctx.stroke();
  }

  // Torso
  ctx.fillStyle = skin.armor;
  ctx.beginPath(); ctx.moveTo(-7, -p.h + 14); ctx.lineTo(7, -p.h + 14); ctx.lineTo(5, -20); ctx.lineTo(-5, -20); ctx.closePath(); ctx.fill();

  // Armor Tabard
  ctx.fillStyle = skin.tabard;
  ctx.fillRect(-4, -p.h + 14, 8, 18);

  // ── Prajurit: shoulder armor pads ──
  if (skinKey === 'praajurit') {
    ctx.fillStyle = skin.headband;
    ctx.beginPath(); ctx.arc(-7, -p.h + 14, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -p.h + 14, 5, 0, Math.PI * 2); ctx.fill();
  }

  // ── Ksatria: chest emblem ──
  if (skinKey === 'ksatria') {
    ctx.fillStyle = '#4455aa';
    ctx.shadowColor = '#4455aa';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(0, -p.h + 17);
    ctx.lineTo(-3, -p.h + 22);
    ctx.lineTo(0, -p.h + 26);
    ctx.lineTo(3, -p.h + 22);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── Sang Raja: royal chest insignia ──
  if (skinKey === 'sangraja') {
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, -p.h + 22, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── Sang Dewa: divine chest rune ──
  if (skinKey === 'sangdewa') {
    const runeGlow = 0.5 + 0.5 * Math.sin(Date.now() / 400);
    ctx.save();
    ctx.globalAlpha = runeGlow;
    ctx.fillStyle = '#ff5533';
    ctx.shadowColor = '#ff5533';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, -p.h + 16);
    ctx.lineTo(-4, -p.h + 22);
    ctx.lineTo(0, -p.h + 28);
    ctx.lineTo(4, -p.h + 22);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Head
  ctx.fillStyle = '#e8d5a3';
  ctx.beginPath(); ctx.arc(0, -p.h + 6, 8, 0, Math.PI * 2); ctx.fill();

  // Headband and Hair/Helmet
  ctx.fillStyle = skin.headband;
  ctx.fillRect(-8, -p.h + 2, 16, 4);
  ctx.fillStyle = skin.helm;
  ctx.beginPath(); ctx.arc(0, -p.h + 4, 8, Math.PI, Math.PI * 2); ctx.fill();

  // ── Ksatria: knight helmet crest ──
  if (skinKey === 'ksatria') {
    ctx.fillStyle = '#4455aa';
    ctx.beginPath();
    ctx.moveTo(-2, -p.h - 2);
    ctx.lineTo(0, -p.h - 10);
    ctx.lineTo(2, -p.h - 2);
    ctx.closePath();
    ctx.fill();
    // Visor slit
    ctx.fillStyle = '#112244';
    ctx.fillRect(-5, -p.h + 5, 10, 2);
  }

  // ── Sang Raja: golden crown ──
  if (skinKey === 'sangraja') {
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-9, -p.h + 1);
    ctx.lineTo(9, -p.h + 1);
    ctx.lineTo(10, -p.h - 3);
    ctx.lineTo(5, -p.h);
    ctx.lineTo(0, -p.h - 6);
    ctx.lineTo(-5, -p.h);
    ctx.lineTo(-10, -p.h - 3);
    ctx.closePath();
    ctx.fill();
    // Jewel on crown
    ctx.fillStyle = '#ff0000';
    ctx.beginPath(); ctx.arc(0, -p.h - 2, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── Sang Dewa: divine halo + crown ──
  if (skinKey === 'sangdewa') {
    // Halo ring
    const haloAlpha = 0.5 + 0.3 * Math.sin(Date.now() / 500);
    ctx.save();
    ctx.globalAlpha = haloAlpha;
    ctx.strokeStyle = '#ffcc00';
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -p.h - 6, 12, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // Crown
    ctx.fillStyle = '#fff8d6';
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(-9, -p.h + 1);
    ctx.lineTo(9, -p.h + 1);
    ctx.lineTo(11, -p.h - 4);
    ctx.lineTo(6, -p.h);
    ctx.lineTo(3, -p.h - 7);
    ctx.lineTo(0, -p.h - 2);
    ctx.lineTo(-3, -p.h - 7);
    ctx.lineTo(-6, -p.h);
    ctx.lineTo(-11, -p.h - 4);
    ctx.closePath();
    ctx.fill();
    // Jewels
    ctx.fillStyle = '#ff3300';
    ctx.beginPath(); ctx.arc(0, -p.h - 1, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3366ff';
    ctx.beginPath(); ctx.arc(-5, -p.h, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -p.h, 1, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── Eyes (all skins) ──
  ctx.fillStyle = skin.eyes;
  ctx.shadowColor = skin.eyes;
  ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.arc(-3, -p.h + 6, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3, -p.h + 6, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // Arm & Sword
  ctx.save();
  ctx.translate(0, -p.h + 16);
  ctx.rotate(p.attackTimer > 0 ? -0.6 + armSwing * 0.1 : 0.2);

  // Arm
  ctx.strokeStyle = '#e8d5a3'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8, 8); ctx.lineTo(16, 2); ctx.stroke();

  // Sleeve
  ctx.strokeStyle = skin.armor; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8, 8); ctx.stroke();

  // ── Prajurit / Ksatria: arm gauntlet ──
  if (skinKey === 'praajurit' || skinKey === 'ksatria') {
    ctx.strokeStyle = skin.headband; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(14, 2); ctx.stroke();
  }

  // Sword
  ctx.save();
  ctx.translate(16, 2);
  ctx.rotate(Math.PI / 2 - 0.2);
  const slvl = state.swordLevel;
  ctx.shadowColor = sword.color;
  ctx.shadowBlur = 8 + slvl * 5;
  ctx.fillStyle = '#3a2010'; ctx.fillRect(-3, -2, 6, 8);
  ctx.fillStyle = sword.color; ctx.fillRect(-6, -4, 12, 4);

  const bladeLen = 28 + slvl * 8;
  const bladeGrad = ctx.createLinearGradient(0, -4, 0, -4 - bladeLen);
  bladeGrad.addColorStop(0, sword.color);
  bladeGrad.addColorStop(0.5, '#fff');
  bladeGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = bladeGrad;
  ctx.beginPath(); ctx.moveTo(-3, -4); ctx.lineTo(0, -4 - bladeLen); ctx.lineTo(3, -4); ctx.fill();

  if (slvl >= 3) {
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 300);
    ctx.fillStyle = sword.color;
    ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.moveTo(-1, -4); ctx.lineTo(0, -4 - bladeLen + 6); ctx.lineTo(1, -4); ctx.fill();
  }
  ctx.restore();
  ctx.restore();

  if (p.isBlocking) {
    ctx.fillStyle = 'rgba(100,200,100,0.3)';
    ctx.strokeStyle = '#88ff88';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#88ff88';
    ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.ellipse(-8, -p.h * 0.5, 8, 20, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ── Sang Dewa: divine sparkles around player ──
  if (skinKey === 'sangdewa' && Math.random() < 0.15) {
    spawnParticles(p.x - camX + (Math.random() - 0.5) * 30, p.y - p.h * Math.random(), '#ffcc44', 1, 1.5);
  }

  ctx.restore();
}

function drawEnemy(e) {
  const cx = e.x - camX;
  if (cx < -100 || cx > W + 100) return;

  drawShadow(e.x, GROUND_Y + 3, e.w * 0.9);

  if (e.dead) {
    ctx.save();
    ctx.globalAlpha = e.dyingTimer / 40;
    ctx.translate(cx, e.y);
    if (!e.facingRight) ctx.scale(-1, 1);
    ctx.fillStyle = '#440000';
    ctx.beginPath(); ctx.ellipse(0, -6, e.w / 2, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(cx, e.y);
  if (!e.facingRight) ctx.scale(-1, 1);

  if (e.hitFlash > 0) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffffff';
  }

  const runOff = Math.sin(e.animFrame * 1.5) * 4;

  if (e.type === 'bossObsidian' || e.type === 'bossMalachar') {
    drawBossBody(e, runOff);
  } else {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Back Leg
    ctx.strokeStyle = e.hitFlash > 0 ? '#fff' : '#111'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-3, -20); ctx.lineTo(-6 + runOff, -4); ctx.stroke();
    // Front Leg
    ctx.strokeStyle = e.hitFlash > 0 ? '#fff' : '#333'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(3, -20); ctx.lineTo(6 - runOff, -4); ctx.stroke();

    // Torso
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : e.color;
    ctx.beginPath(); ctx.moveTo(-8, -e.h + 16); ctx.lineTo(8, -e.h + 16); ctx.lineTo(6, -20); ctx.lineTo(-6, -20); ctx.closePath(); ctx.fill();

    // Armor
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : e.armorColor;
    ctx.fillRect(-6, -e.h + 16, 12, 16);

    // Head
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : '#dcb';
    ctx.beginPath(); ctx.arc(0, -e.h + 8, 7, 0, Math.PI * 2); ctx.fill();
    // Helmet
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : e.armorColor;
    ctx.beginPath(); ctx.arc(0, -e.h + 6, 7.5, Math.PI, Math.PI * 2.2); ctx.fill();

    // Glowing Eyes
    ctx.fillStyle = '#ff2200'; ctx.beginPath(); ctx.arc(-3, -e.h + 8, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(3, -e.h + 8, 1.5, 0, Math.PI * 2); ctx.fill();

    // Weapon Arm
    ctx.save();
    ctx.translate(0, -e.h + 20);

    if (e.type !== 'archer') {
      ctx.rotate(e.attackTimer > 0 ? -0.8 : 0.2);
      ctx.strokeStyle = e.armorColor; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 6); ctx.lineTo(18, 0); ctx.stroke();

      // Sword/Axe
      ctx.translate(18, 0);
      ctx.rotate(Math.PI / 2 - 0.2);
      ctx.fillStyle = e.hitFlash > 0 ? '#fff' : '#888';
      ctx.fillRect(-2, -18, 4, 24);
      if (e.type === 'heavy') ctx.fillRect(2, -14, 8, 12);
    } else {
      ctx.rotate(-0.2);
      ctx.strokeStyle = e.armorColor; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, -2); ctx.stroke();

      ctx.translate(14, -2);
      ctx.strokeStyle = e.hitFlash > 0 ? '#fff' : '#664422'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 14, -Math.PI * 0.6, Math.PI * 0.6); ctx.stroke();
      ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-4, -12); ctx.lineTo(-4, 12); ctx.stroke();
    }
    ctx.restore();

    drawEnemyHPBar(e);
  }
  ctx.restore();
}

function drawBossBody(e, runOff) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const isMalachar = e.type === 'bossMalachar';
  const mainColor = isMalachar ? '#3a2000' : '#110008';
  const armorColor = isMalachar ? '#c9a84c' : '#330015';
  const accentColor = isMalachar ? '#fff' : '#660033';
  const glowColor = isMalachar ? '#ffcc00' : '#ff0000';

  // Cape
  ctx.fillStyle = isMalachar ? '#cc2222' : '#220011';
  ctx.beginPath();
  ctx.moveTo(-10, -e.h + 16);
  ctx.quadraticCurveTo(-30, -e.h + 30 + runOff, -25 - runOff, -5);
  ctx.lineTo(-10, -5);
  ctx.fill();

  // Legs
  ctx.strokeStyle = '#111'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(-6, -26); ctx.lineTo(-10 + runOff, -4); ctx.stroke();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(6, -26); ctx.lineTo(10 - runOff, -4); ctx.stroke();

  // Torso
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : mainColor;
  ctx.beginPath(); ctx.moveTo(-14, -e.h + 20); ctx.lineTo(14, -e.h + 20); ctx.lineTo(10, -26); ctx.lineTo(-10, -26); ctx.closePath(); ctx.fill();

  // Armor Plates
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : armorColor;
  ctx.fillRect(-10, -e.h + 20, 20, 26);

  // Shoulders
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : accentColor;
  ctx.beginPath(); ctx.arc(-14, -e.h + 20, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(14, -e.h + 20, 8, 0, Math.PI * 2); ctx.fill();

  // Head
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : mainColor;
  ctx.beginPath(); ctx.arc(0, -e.h + 10, 10, 0, Math.PI * 2); ctx.fill();

  // Crown / Helmet
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : accentColor;
  ctx.beginPath(); ctx.moveTo(-12, -e.h + 6); ctx.lineTo(12, -e.h + 6); ctx.lineTo(14, -e.h - 4); ctx.lineTo(6, -e.h + 2); ctx.lineTo(0, -e.h - 6); ctx.lineTo(-6, -e.h + 2); ctx.lineTo(-14, -e.h - 4); ctx.fill();

  // Eye glow
  ctx.fillStyle = glowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(-3, -e.h + 10, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -e.h + 10, 2, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // Arm & Weapon
  ctx.save();
  ctx.translate(0, -e.h + 24);
  ctx.rotate(e.attackTimer > 0 ? -1.2 : 0.3);

  // Arm
  ctx.strokeStyle = armorColor; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(16, 10); ctx.lineTo(30, 0); ctx.stroke();

  // Great Weapon
  ctx.translate(30, 0);
  ctx.rotate(Math.PI / 2 - 0.2);
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : '#444';
  ctx.fillRect(-3, -25, 6, 40);

  if (isMalachar) {
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : '#e8d5a3';
    ctx.beginPath(); ctx.moveTo(-6, -25); ctx.lineTo(0, -55); ctx.lineTo(6, -25); ctx.fill();
  } else {
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : '#880033';
    ctx.beginPath(); ctx.moveTo(3, -20); ctx.lineTo(25, -5); ctx.lineTo(3, 10); ctx.fill();
  }
  ctx.restore();

  // Aura
  ctx.globalAlpha = 0.15 + 0.1 * Math.sin(Date.now() / 400);
  ctx.fillStyle = glowColor;
  ctx.beginPath(); ctx.ellipse(0, -e.h * 0.5, e.w * 0.8, e.h * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

function drawEnemyHPBar(e) {
  const pct = e.hp / e.maxHp;
  const bw = e.w + 8;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(-bw / 2, -e.h - 10, bw, 5);
  ctx.fillStyle = pct > 0.6 ? '#44dd66' : pct > 0.3 ? '#ddcc22' : '#cc2222';
  ctx.fillRect(-bw / 2, -e.h - 10, bw * pct, 5);
}

function drawSlashes() {
  for (const s of slashes) {
    ctx.save();
    const alpha = s.life / s.maxLife;
    ctx.globalAlpha = alpha * 0.7;
    const sword = SWORD_DATA[state.swordLevel];
    ctx.strokeStyle = sword.color;
    ctx.shadowColor = sword.color;
    ctx.shadowBlur = 15;
    ctx.lineWidth = 3;
    const cx = s.x - camX + s.w / 2;
    const cy = s.y + s.h / 2;
    if (s.type === 'spin') {
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(s.w, s.h) * 0.5, s.angle, s.angle + Math.PI * 1.5);
      ctx.stroke();
    } else {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(s.angle * 0.3);
      ctx.beginPath();
      ctx.moveTo(-s.w * 0.5, 0);
      ctx.lineTo(s.w * 0.5, 0);
      ctx.stroke();
      if (s.type === 'heavy') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-s.w * 0.3, -s.h * 0.3);
        ctx.lineTo(s.w * 0.3, s.h * 0.3);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }
}

function drawProjectiles() {
  for (const p of projectiles) {
    const cx = p.x - camX;
    ctx.save();
    ctx.fillStyle = '#cc8833';
    ctx.shadowColor = '#ffaa44';
    ctx.shadowBlur = 6;
    ctx.save();
    ctx.translate(cx, p.y);
    ctx.rotate(Math.atan2(p.vy, p.vx));
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    // Arrow tip
    ctx.fillStyle = '#aaaaaa';
    ctx.beginPath();
    ctx.moveTo(p.w / 2, 0);
    ctx.lineTo(p.w / 2 + 6, -3);
    ctx.lineTo(p.w / 2 + 6, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }
}

// ─── HUD UPDATE ───────────────────────────────────────────────────────────────
function updateHUD() {
  const sword = SWORD_DATA[state.swordLevel];
  // HP
  const pct = Math.max(0, player.hp / player.maxHp);
  document.getElementById('hud-hp-fill').style.width = (pct * 100) + '%';

  document.getElementById('hud-hp-fill').style.background =
    pct > 0.6 ? 'linear-gradient(90deg,#3ddc84,#5dfc9a)' :
      pct > 0.3 ? 'linear-gradient(90deg,#f0c040,#f0e060)' :
        'linear-gradient(90deg,#cc2222,#ee4444)';
  document.getElementById('hud-hp-num').textContent = `${player.hp}/${player.maxHp}`;
  // Sword
  document.getElementById('hud-sword-stars').textContent = '★'.repeat(sword.stars) + '☆'.repeat(5 - sword.stars);
  document.getElementById('hud-sword-name').textContent = sword.name;
  document.getElementById('hud-sword-name').style.color = sword.color;
  // Stage / Score / Kills
  document.getElementById('hud-stage-num').textContent = state.stage;
  document.getElementById('hud-score-num').textContent = state.score.toLocaleString();
  document.getElementById('hud-kill-num').textContent = state.totalKills;
  // Skin name badge
  const skinEl = document.getElementById('hud-skin-name');
  if (skinEl) {
    const sk = getSkin();
    skinEl.textContent = sk.name;
    skinEl.style.color = SKINS[state.selectedSkin]?.tabard || '#c9a84c';
  }
  // Difficulty badge
  const diffEl = document.getElementById('hud-diff-badge');
  if (diffEl) {
    const diffColors = { easy: '#3ddc84', normal: '#c9a84c', hard: '#ff8844', insane: '#ff3333' };
    const diffNames  = { easy: 'MUDAH', normal: 'NORMAL', hard: 'SULIT', insane: 'GILA' };
    diffEl.textContent = diffNames[state.difficulty] || 'NORMAL';
    diffEl.style.color = diffColors[state.difficulty] || '#c9a84c';
  }
  // Boss HP
  const boss = enemies.find(e => (e.type === 'bossObsidian' || e.type === 'bossMalachar') && !e.dead);
  const bossHud = document.getElementById('boss-hud');
  if (boss) {
    bossHud.style.display = 'flex';
    document.getElementById('boss-name').textContent = boss.type === 'bossMalachar' ? 'RAJA MALACHAR' : 'RAJA OBSIDIAN';
    document.getElementById('boss-hp-fill').style.width = (boss.hp / boss.maxHp * 100) + '%';
  } else {
    bossHud.style.display = 'none';
  }
}

// ─── SWORD UPGRADE FLASH ──────────────────────────────────────────────────────
let upgradeFlashTimer = 0;
let upgradeFlashName = '';
function flashSwordUpgrade(name) {
  upgradeFlashTimer = 120;
  upgradeFlashName = name;
}
function drawUpgradeFlash() {
  if (upgradeFlashTimer <= 0) return;
  upgradeFlashTimer--;
  const alpha = upgradeFlashTimer > 60 ? 1 : upgradeFlashTimer / 60;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(201,168,76,0.15)';
  ctx.fillRect(0, 0, W, H);
  const sword = SWORD_DATA[state.swordLevel];
  ctx.font = 'bold 28px Cinzel, serif';
  ctx.fillStyle = sword.color;
  ctx.shadowColor = sword.color;
  ctx.shadowBlur = 20;
  ctx.textAlign = 'center';
  ctx.fillText(`⬆ PEDANG DITINGKATKAN: ${upgradeFlashName.toUpperCase()} ⬆`, W / 2, H / 2 - 20);
  ctx.font = '16px Cinzel, serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('★'.repeat(state.swordLevel + 1), W / 2, H / 2 + 20);
  ctx.restore();
}

// ─── COMBO & ACTION DISPLAY ───────────────────────────────────────────────────
function drawComboAndAction() {
  const comboEl = document.getElementById('combo-display');
  const actionEl = document.getElementById('action-label');
  if (comboDisplayTimer > 0 && player.comboCount >= 2) {
    comboEl.style.opacity = '1';
    comboEl.textContent = `${player.comboCount} COMBO!`;
  } else {
    comboEl.style.opacity = '0';
  }
  if (actionLabelTimer > 0 && actionLabelData) {
    const t = actionLabelTimer / 60;
    actionEl.style.opacity = String(Math.min(1, t * 3));
    actionEl.textContent = actionLabelData.label;
    actionEl.style.color = actionLabelData.color;
    const scale = 0.9 + 0.1 * Math.min(1, actionLabelTimer / 15);
    actionEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
  } else {
    actionEl.style.opacity = '0';
  }
}

// ─── MAIN GAME LOOP ───────────────────────────────────────────────────────────
let lastTime = 0;
let gameRunning = false;

function gameLoop(timestamp) {
  if (!gameRunning) return;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  if (state.paused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  ctx.clearRect(0, 0, W, H);

  // Update
  updateCamera();
  drawBackground(state.stage);
  updateWeather();
  drawWeather();
  updateParticles(dt);
  updateDmgNums(dt);
  updateWaveManager();
  updatePlayer(dt);
  updateEnemies(dt);

  // Draw
  drawProjectiles();
  drawSlashes();
  for (const e of enemies) drawEnemy(e);
  drawPlayer();
  drawParticles();
  drawDmgNums();
  drawUpgradeFlash();
  drawSkinUnlockNotif();
  drawComboAndAction();

  // HUD
  updateHUD();

  // Check wave clear
  if (waveManager.allCleared) {
    waveManager.allCleared = false;
    gameRunning = false;
    setTimeout(() => showStageClear(), 800);
    return;
  }

  clearJust();
  requestAnimationFrame(gameLoop);
}

function startGameLoop() {
  gameRunning = true;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function setPaused(paused) {
  if (state.screen !== 'game') return;
  state.paused = paused;
  releaseVirtualControls();
  document.getElementById('pause-overlay').style.display = paused ? 'flex' : 'none';
  if (paused) AudioManager.stopBg();
  else AudioManager.startBg();
}

// ─── SCREEN TRANSITIONS ───────────────────────────────────────────────────────
function showScreen(id) {
  releaseVirtualControls();
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const el = document.getElementById(id);
  el.style.display = 'flex';
  requestAnimationFrame(() => { el.classList.add('active'); });
  if (window.lucide) lucide.createIcons();
  resizeCanvas();
}

function showMenu() {
  gameRunning = false;
  state.screen = 'menu';
  showScreen('menu-screen');
  AudioManager.stopBg();
  renderSkinButtons();
  renderDifficultyButtons();
}

function showStory(idx, afterFn) {
  const act = STORY_ACTS[idx];
  document.getElementById('story-act-label').textContent = act.act;
  document.getElementById('story-title').textContent = act.title;
  document.getElementById('story-text').textContent = act.text;
  document.getElementById('story-bg').style.background =
    `radial-gradient(ellipse at 30% 60%, ${act.bg} 0%, #0a0a0f 100%)`;
  showScreen('story-screen');
  const btn = document.getElementById('story-continue-btn');
  btn.onclick = () => { afterFn(); };
}

function startStage(stage) {
  state.stage = stage;
  state.maxStageReached = Math.max(state.maxStageReached || 1, stage);
  saveProgress();
  maybeUnlockSkinsWithNotif(); // Re-check if reaching new stage unlocks a skin

  state.screen = 'game';
  state.stageKills = 0;
  particles.length = 0;
  slashes.length = 0;
  dmgNums.length = 0;
  upgradeFlashTimer = 0;
  camX = 0;
  bgOffset = 0;

  // Apply difficulty before spawning entities
  applyDifficulty();

  resetPlayer();
  // Re-apply player stats after resetPlayer()
  applyDifficulty(true);

  initWaves(stage);

  showScreen('game-screen');
  updateHUD();
  startGameLoop();
}

function showStageClear() {
  gameRunning = false;
  state.screen = 'stageclear';
  showScreen('stage-clear-screen');

  // progression: count cleared stage history
  state.totalStagesCleared++;
  maybeUnlockSkinsWithNotif();
  saveProgress();

  document.getElementById('sc-stage-num').textContent = `STAGE ${state.stage}`;
  document.getElementById('sc-kills').textContent = state.stageKills;
  document.getElementById('sc-score').textContent = state.score.toLocaleString();
  const sword = SWORD_DATA[state.swordLevel];
  document.getElementById('sc-sword').textContent =
    '★'.repeat(sword.stars) + ' ' + sword.name;
  document.getElementById('sc-upgrade-msg').textContent = '';
  AudioManager.play('stageClear');
}

function showGameOver() {
  gameRunning = false;
  state.screen = 'gameover';
  showScreen('gameover-screen');
  document.getElementById('go-quote').textContent =
    QUOTES[Math.floor(Math.random() * QUOTES.length)];
  AudioManager.play('gameOver');
  AudioManager.stopBg();
}

let endingAnimState = null;

function showEnding() {
  gameRunning = false;
  AudioManager.stopBg();
  AudioManager.play('stageClear');

  state.screen = 'ending-anim';
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const gs = document.getElementById('game-screen');
  gs.style.display = 'flex';
  requestAnimationFrame(() => gs.classList.add('active'));
  document.getElementById('hud').style.display = 'none';
  document.getElementById('boss-hud').style.display = 'none';
  document.getElementById('pause-overlay').style.display = 'none';
  
  endingAnimState = {
    aratha: { x: -50, y: GROUND_Y, animFrame: 0, frameTimer: 0 },
    lyra: { x: W/2, y: GROUND_Y },
    crown: { y: -50, alpha: 0 },
    phase: 0, 
    timer: 0
  };
  
  requestAnimationFrame(endingLoop);
}

function endingLoop() {
  if (state.screen !== 'ending-anim') return;
  
  ctx.clearRect(0, 0, W, H);
  
  const oldCam = camX;
  camX = 0; 
  drawBackground(10);
  
  if (endingAnimState.phase === 0) {
    endingAnimState.aratha.x += 1.5;
    endingAnimState.aratha.frameTimer++;
    if (endingAnimState.aratha.frameTimer > 8) {
      endingAnimState.aratha.frameTimer = 0;
      endingAnimState.aratha.animFrame = (endingAnimState.aratha.animFrame + 1) % 4;
    }
    if (endingAnimState.aratha.x >= endingAnimState.lyra.x - 40) {
      endingAnimState.phase = 1;
    }
  } else if (endingAnimState.phase === 1) {
    endingAnimState.aratha.animFrame = 0; 
    endingAnimState.crown.y += 1;
    if (endingAnimState.crown.y >= endingAnimState.aratha.y - 70) { 
      endingAnimState.crown.y = endingAnimState.aratha.y - 70;
      endingAnimState.timer++;
      if (endingAnimState.timer > 90) {
        endingAnimState.phase = 2;
        endingAnimState.timer = 0;
      }
    }
  } else if (endingAnimState.phase === 2) {
    endingAnimState.timer++;
    if (endingAnimState.timer > 150) {
      showEndingScreenOverlay();
      return;
    }
  }
  
  drawLyra(endingAnimState.lyra.x, endingAnimState.lyra.y);
  
  const oldP = { ...player };
  player.x = endingAnimState.aratha.x;
  player.y = endingAnimState.aratha.y;
  player.animFrame = endingAnimState.aratha.animFrame;
  player.animState = endingAnimState.phase === 0 ? 'run' : 'idle';
  player.attackTimer = 0;
  player.invTimer = 0;
  player.facingRight = true;
  drawPlayer();
  Object.assign(player, oldP);
  
  if (endingAnimState.phase > 0) {
    drawCrown(endingAnimState.aratha.x, endingAnimState.crown.y);
  }
  
  if (endingAnimState.phase === 2) {
    const alpha = Math.min(0.8, endingAnimState.timer / 100);
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, 0, W, H);
  }
  
  requestAnimationFrame(endingLoop);
}

function drawLyra(x, y) {
  ctx.save();
  ctx.translate(x, y);
  
  ctx.fillStyle = '#f8f8f8';
  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.lineTo(-12, 0);
  ctx.lineTo(12, 0);
  ctx.fill();
  
  ctx.fillStyle = '#e8d5a3'; 
  ctx.beginPath(); ctx.arc(0, -45, 6, 0, Math.PI*2); ctx.fill(); 
  
  ctx.fillStyle = '#ffcc44';
  ctx.beginPath(); ctx.arc(0, -47, 7, Math.PI*0.8, Math.PI*2.2); ctx.fill();
  ctx.fillRect(-8, -45, 4, 15); 
  
  ctx.strokeStyle = '#e8d5a3'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -38); ctx.lineTo(-8, -25); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, -38); ctx.lineTo(8, -25); ctx.stroke();
  
  ctx.restore();
}

function drawCrown(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#ffcc00';
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(10, 0);
  ctx.lineTo(12, -8);
  ctx.lineTo(6, -4);
  ctx.lineTo(0, -12);
  ctx.lineTo(-6, -4);
  ctx.lineTo(-12, -8);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff0000';
  ctx.beginPath(); ctx.arc(0, -6, 2, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function showEndingScreenOverlay() {
  state.screen = 'ending';
  const screen = document.getElementById('ending-screen');
  screen.style.display = 'flex';
  requestAnimationFrame(() => { screen.classList.add('active'); });
  
  document.getElementById('ending-text').textContent =
    "Dengan berakhirnya tirani, Raja Malachar menyerahkan tahtanya dengan damai. Aratha menjemput Putri Lyra, cinta sejatinya, dan dinobatkan menjadi Raja Ardenwyr. Kisah penjual jagung yang menjadi legenda akan diceritakan turun-temurun, membawa kedamaian abadi bagi seluruh rakyat.";
}

// ─── BUTTON WIRING ────────────────────────────────────────────────────────────
document.getElementById('btn-play').onclick = () => {
  AudioManager.init();
  AudioManager.resume();
  AudioManager.startBg();
  AudioManager.play('menuClick');
  state.stage = 1; state.score = 0; state.totalKills = 0;
  state.swordLevel = 0; state.killsSinceUpgrade = 0;
  const storyIdx = STAGE_STORY_IDX[0];
  showStory(storyIdx, () => startStage(1));
};
document.getElementById('btn-controls').onclick = () => { AudioManager.play('menuClick'); showScreen('controls-screen'); };
document.getElementById('btn-lore').onclick = () => { AudioManager.play('menuClick'); showStory(0, showMenu); };
document.getElementById('btn-back-controls').onclick = () => { AudioManager.play('menuClick'); showScreen('menu-screen'); };
document.getElementById('btn-resume').onclick = () => {
  setPaused(false);
};
document.getElementById('btn-quit-game').onclick = () => {
  gameRunning = false;
  state.paused = false;
  releaseVirtualControls();
  document.getElementById('pause-overlay').style.display = 'none';
  showMenu();
};
document.getElementById('btn-retry').onclick = () => {
  AudioManager.init();
  AudioManager.startBg();
  const storyIdx = STAGE_STORY_IDX[Math.min(state.stage - 1, 9)];
  showStory(storyIdx, () => startStage(state.stage));
};
document.getElementById('btn-go-menu').onclick = showMenu;
document.getElementById('btn-next-stage').onclick = () => {
  const next = state.stage + 1;
  if (next > 10) { showEnding(); return; }
  const storyIdx = STAGE_STORY_IDX[Math.min(next - 1, 9)];
  const showNewStory = storyIdx !== STAGE_STORY_IDX[Math.min(state.stage - 1, 9)];
  if (showNewStory) {
    showStory(storyIdx, () => startStage(next));
  } else {
    startStage(next);
  }
};
document.getElementById('btn-ending-menu').onclick = showMenu;

// Escape = pause / resume
window.addEventListener('keydown', e => {
  if (e.code === 'Escape' && state.screen === 'game') {
    setPaused(!state.paused);
  }
});

function bindMobileControls() {
  const controls = document.getElementById('mobile-controls');
  if (!controls || !window.PointerEvent) return;

  controls.querySelectorAll('[data-key]').forEach(button => {
    const code = button.dataset.key;

    button.addEventListener('pointerdown', e => {
      if (state.screen !== 'game' || state.paused) return;
      e.preventDefault();
      virtualTouches.set(e.pointerId, code);
      pressKey(code);
      button.classList.add('pressed');
      if (button.setPointerCapture) button.setPointerCapture(e.pointerId);
    }, { passive: false });

    const releaseTouch = e => {
      e.preventDefault();
      const activeCode = virtualTouches.get(e.pointerId);
      if (activeCode) releaseKey(activeCode);
      virtualTouches.delete(e.pointerId);
      button.classList.remove('pressed');
      if (button.releasePointerCapture && button.hasPointerCapture(e.pointerId)) {
        button.releasePointerCapture(e.pointerId);
      }
    };

    button.addEventListener('pointerup', releaseTouch, { passive: false });
    button.addEventListener('pointercancel', releaseTouch, { passive: false });
    button.addEventListener('contextmenu', e => e.preventDefault());
  });

  const pauseButton = document.getElementById('btn-mobile-pause');
  if (pauseButton) {
    pauseButton.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (state.screen === 'game') setPaused(!state.paused);
    }, { passive: false });
    pauseButton.addEventListener('contextmenu', e => e.preventDefault());
  }
}

bindMobileControls();

// Mute button
document.getElementById('btn-mute').addEventListener('click', () => {
  const nowMuted = AudioManager.toggleMute();
  const btn = document.getElementById('btn-mute');
  btn.innerHTML = `<i data-lucide="${nowMuted ? 'volume-x' : 'volume-2'}" id="mute-icon"></i>`;
  if (window.lucide) lucide.createIcons();
  btn.classList.toggle('muted', nowMuted);
});

// ─── SKIN & DIFFICULTY UI ─────────────────────────────────────────────────────
const SKIN_UNLOCK_HINTS = {
  default: 'Skin awal — Penjual Jagung.',
  praajurit: 'Capai stage 5 untuk membuka.',
  ksatria: 'Capai stage 7 untuk membuka.',
  sangraja: 'Selesaikan total 32 stage (bisa berulang) untuk membuka.',
  sangdewa: 'Kalahkan Raja Obsidian & Raja Malachar masing-masing 5× untuk membuka.',
};

const DIFF_LABELS = {
  easy:   { title: 'Mudah',  tip: 'HP lebih tinggi, musuh lebih lemah.' },
  normal: { title: 'Normal', tip: 'Pengalaman standar.' },
  hard:   { title: 'Sulit',  tip: 'HP berkurang, musuh lebih kuat & cepat.' },
  insane: { title: 'Gila',   tip: 'Ekstrem! HP sangat rendah, musuh mematikan.' },
};

function renderSkinButtons() {
  const container = document.getElementById('skin-options');
  if (!container) return;
  container.innerHTML = '';
  const skinKeys = Object.keys(SKINS);
  for (const key of skinKeys) {
    const sk = SKINS[key];
    const unlocked = !!state.unlockedSkins[key];
    const selected = state.selectedSkin === key;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'config-btn';
    if (selected) btn.classList.add('selected');
    if (!unlocked) btn.classList.add('disabled');
    btn.dataset.skin = key;
    const swatchHtml = unlocked ? '' : '🔒 ';
    btn.innerHTML = swatchHtml + sk.name;
    btn.title = unlocked ? `${sk.name} — klik untuk memilih` : SKIN_UNLOCK_HINTS[key];
    btn.onclick = () => {
      if (!state.unlockedSkins[key]) return;
      state.selectedSkin = key;
      saveProgress();
      renderSkinButtons();
      AudioManager.play('menuClick');
    };
    container.appendChild(btn);
  }
  // Update hint text
  const hintEl = document.getElementById('skin-hint');
  if (hintEl) {
    const currentHint = SKIN_UNLOCK_HINTS[state.selectedSkin] || '';
    const progressLines = [];
    progressLines.push(`Stage diselesaikan: ${state.totalStagesCleared}`);
    progressLines.push(`Raja Obsidian dikalahkan: ${state.bossObsidianDefeated}/5`);
    progressLines.push(`Raja Malachar dikalahkan: ${state.bossMalacharDefeated}/5`);
    hintEl.innerHTML = `<span style="color:var(--gold)">${SKINS[state.selectedSkin]?.name || 'Penjual Jagung'}</span> — ${currentHint}<br><span style="font-size:0.78em;opacity:0.7">${progressLines.join(' · ')}</span>`;
  }
}

function renderDifficultyButtons() {
  const container = document.getElementById('difficulty-options');
  if (!container) return;
  const buttons = container.querySelectorAll('.config-btn');
  buttons.forEach(btn => {
    const diff = btn.dataset.difficulty;
    btn.classList.toggle('selected', state.difficulty === diff);
    const info = DIFF_LABELS[diff];
    if (info) btn.title = info.tip;
    btn.onclick = () => {
      state.difficulty = diff;
      renderDifficultyButtons();
      updateDifficultyHint();
      AudioManager.play('menuClick');
    };
  });
  updateDifficultyHint();
}

function updateDifficultyHint() {
  // Show difficulty description below the difficulty card if element exists
  const info = DIFF_LABELS[state.difficulty];
  if (!info) return;
  let el = document.getElementById('difficulty-hint');
  if (!el) {
    el = document.createElement('div');
    el.id = 'difficulty-hint';
    el.className = 'config-hint';
    const card = document.querySelector('#difficulty-options')?.parentElement;
    if (card) card.appendChild(el);
  }
  el.textContent = `${info.title}: ${info.tip}`;
}

// (skin unlock notification + maybeUnlockSkinsWithNotif defined earlier, near maybeUnlockSkins)

// ─── BOOT ─────────────────────────────────────────────────────────────────────
loadProgress();
maybeUnlockSkins();
renderSkinButtons();
renderDifficultyButtons();
if (window.lucide) lucide.createIcons();
showMenu();
