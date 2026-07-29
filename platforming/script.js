(function () {
  // ── Character images ──
  var playerImg = new Image();
  playerImg.src = "../drag-game/images/Mario_Jump.png";
  var coinImg = new Image();
  coinImg.src = "../drag-game/images/Coin.png";
  var goombaImg = new Image();
  goombaImg.src = "../drag-game/images/Goomba.png";
  var trophyImg = new Image();
  trophyImg.src = "../drag-game/images/Trophy.png";

  // ── Level definitions ──
  var levels = [
    { // Level 1 — Easy intro
      playerStart: { x: 50, y: 720 },
      platforms: [
        { x: 0, y: 800, w: 350, h: 20 },
        { x: 400, y: 800, w: 200, h: 20 },
        { x: 650, y: 730, w: 120, h: 20 },
        { x: 820, y: 800, w: 250, h: 20 },
        { x: 1120, y: 730, w: 120, h: 20 },
        { x: 1290, y: 800, w: 300, h: 20 },
      ],
      enemies: [
        { x: 150, y: 735, w: 65, h: 65, range: 60, dir: 1 },
      ],
      coins: [
        { x: 450, y: 750, collected: false },
        { x: 700, y: 680, collected: false },
        { x: 900, y: 750, collected: false },
        { x: 1170, y: 680, collected: false },
      ],
      finish: { x: 1500, y: 720 }
    },
    { // Level 2 — More enemies, tighter jumps
      playerStart: { x: 50, y: 720 },
      platforms: [
        { x: 0, y: 800, w: 300, h: 20 },
        { x: 370, y: 800, w: 150, h: 20 },
        { x: 590, y: 730, w: 100, h: 20 },
        { x: 760, y: 800, w: 180, h: 20 },
        { x: 1010, y: 730, w: 100, h: 20 },
        { x: 1180, y: 800, w: 150, h: 20 },
        { x: 1400, y: 730, w: 100, h: 20 },
        { x: 1570, y: 800, w: 250, h: 20 },
      ],
      enemies: [
        { x: 200, y: 735, w: 65, h: 65, range: 50, dir: 1 },
        { x: 800, y: 735, w: 65, h: 65, range: 60, dir: -1 },
      ],
      coins: [
        { x: 420, y: 750, collected: false },
        { x: 640, y: 680, collected: false },
        { x: 810, y: 750, collected: false },
        { x: 1060, y: 680, collected: false },
        { x: 1450, y: 680, collected: false },
      ],
      finish: { x: 1720, y: 720 }
    },
    { // Level 3 — Elevated platforms, more enemies
      playerStart: { x: 50, y: 720 },
      platforms: [
        { x: 0, y: 800, w: 250, h: 20 },
        { x: 320, y: 800, w: 120, h: 20 },
        { x: 510, y: 730, w: 100, h: 20 },
        { x: 680, y: 800, w: 150, h: 20 },
        { x: 900, y: 690, w: 100, h: 20 },
        { x: 1070, y: 800, w: 120, h: 20 },
        { x: 1260, y: 690, w: 100, h: 20 },
        { x: 1430, y: 800, w: 120, h: 20 },
        { x: 1620, y: 800, w: 250, h: 20 },
      ],
      enemies: [
        { x: 200, y: 735, w: 65, h: 65, range: 50, dir: 1 },
        { x: 550, y: 665, w: 65, h: 65, range: 60, dir: -1 },
        { x: 1100, y: 735, w: 65, h: 65, range: 50, dir: 1 },
      ],
      coins: [
        { x: 370, y: 750, collected: false },
        { x: 560, y: 680, collected: false },
        { x: 730, y: 750, collected: false },
        { x: 950, y: 640, collected: false },
        { x: 1310, y: 640, collected: false },
      ],
      finish: { x: 1770, y: 720 }
    },
    { // Level 4 — Challenging layout
      playerStart: { x: 50, y: 720 },
      platforms: [
        { x: 0, y: 800, w: 200, h: 20 },
        { x: 280, y: 800, w: 100, h: 20 },
        { x: 460, y: 730, w: 100, h: 20 },
        { x: 640, y: 800, w: 100, h: 20 },
        { x: 820, y: 690, w: 100, h: 20 },
        { x: 1000, y: 800, w: 100, h: 20 },
        { x: 1180, y: 690, w: 100, h: 20 },
        { x: 1360, y: 800, w: 100, h: 20 },
        { x: 1540, y: 730, w: 100, h: 20 },
        { x: 1720, y: 800, w: 200, h: 20 },
      ],
      enemies: [
        { x: 170, y: 735, w: 65, h: 65, range: 40, dir: 1 },
        { x: 500, y: 665, w: 65, h: 65, range: 60, dir: -1 },
        { x: 870, y: 625, w: 65, h: 65, range: 50, dir: 1 },
        { x: 1230, y: 625, w: 65, h: 65, range: 60, dir: -1 },
      ],
      coins: [
        { x: 330, y: 750, collected: false },
        { x: 510, y: 680, collected: false },
        { x: 690, y: 750, collected: false },
        { x: 870, y: 640, collected: false },
        { x: 1050, y: 750, collected: false },
        { x: 1230, y: 640, collected: false },
        { x: 1590, y: 680, collected: false },
      ],
      finish: { x: 1830, y: 720 }
    },
    { // Level 5 — The Gauntlet
      playerStart: { x: 50, y: 720 },
      platforms: [
        { x: 0, y: 800, w: 150, h: 20 },
        { x: 230, y: 800, w: 80, h: 20 },
        { x: 390, y: 730, w: 80, h: 20 },
        { x: 550, y: 800, w: 80, h: 20 },
        { x: 710, y: 690, w: 80, h: 20 },
        { x: 870, y: 800, w: 80, h: 20 },
        { x: 1030, y: 690, w: 80, h: 20 },
        { x: 1190, y: 800, w: 80, h: 20 },
        { x: 1350, y: 730, w: 80, h: 20 },
        { x: 1510, y: 800, w: 80, h: 20 },
        { x: 1670, y: 690, w: 80, h: 20 },
        { x: 1830, y: 800, w: 80, h: 20 },
        { x: 1990, y: 800, w: 200, h: 20 },
      ],
      enemies: [
        { x: 265, y: 735, w: 65, h: 65, range: 20, dir: -1 },
        { x: 590, y: 735, w: 65, h: 65, range: 50, dir: 1 },
        { x: 910, y: 735, w: 65, h: 65, range: 50, dir: -1 },
        { x: 1240, y: 735, w: 65, h: 65, range: 50, dir: 1 },
        { x: 1560, y: 735, w: 65, h: 65, range: 50, dir: -1 },
      ],
      coins: [
        { x: 280, y: 750, collected: false },
        { x: 440, y: 680, collected: false },
        { x: 600, y: 750, collected: false },
        { x: 760, y: 640, collected: false },
        { x: 920, y: 750, collected: false },
        { x: 1080, y: 640, collected: false },
        { x: 1240, y: 750, collected: false },
        { x: 1400, y: 680, collected: false },
        { x: 1560, y: 750, collected: false },
      ],
      finish: { x: 2100, y: 720 }
    }
  ];

  // ── State ──
  var currentLevel = 0;
  var coinsCollected = 0;
  var totalDeaths = 0;
  var lives = 5;
  var levelCoins = 0;
  var player, platforms, enemies, coins, finishZone;
  var keys = {};
  var gameOver = false;
  var levelComplete = false;
  var camera = { x: 0 };
  var animFrame = null;
  var useDPad = false;
  var dPadButtons = [];
  var isLuigi = false;
  var isPeach = false;
  var isToad = false;

  // ── DOM refs ──
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');
  var levelDisplay = document.getElementById('level-display');
  var coinDisplay = document.getElementById('coin-display');
  var livesDisplay = document.getElementById('lives-display');
  var levelCompleteOverlay = document.getElementById('level-complete');
  var gameWonOverlay = document.getElementById('game-won');
  var deathOverlay = document.getElementById('death-screen');

  // ── Save / Load progress ──
  var SAVE_KEY = 'platforming-progress';

  function saveProgress() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      level: currentLevel,
      coins: coinsCollected,
      deaths: totalDeaths,
      lives: lives
    }));
  }

  function loadProgress() {
    try {
      var data = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (data && data.level !== undefined) return data;
    } catch (e) {}
    return null;
  }

  function clearProgress() {
    localStorage.removeItem(SAVE_KEY);
  }

  // ── Character selection ──
  document.getElementById('mario-button').addEventListener('click', function () {
    chooseCharacter('../drag-game/images/Mario_Jump.png', false, false);
  });
  document.getElementById('luigi-button').addEventListener('click', function () {
    chooseCharacter('../drag-game/images/Luigi_Jump.png', true, false);
  });
  document.getElementById('peach-button').addEventListener('click', function () {
    chooseCharacter('../drag-game/images/Peach_Jump.png', false, true);
  });
  document.getElementById('toad-button').addEventListener('click', function () {
    chooseCharacter('../drag-game/images/toad.png', false, false, true);
  });

  // Show continue button if saved progress exists
  var saved = loadProgress();
  if (saved) {
    var contBtn = document.createElement('button');
    contBtn.id = 'continue-btn';
    contBtn.textContent = '▶ Continue (Level ' + (saved.level + 1) + ')';
    contBtn.style.background = 'linear-gradient(90deg, #06d6a0, #05b888)';
    document.getElementById('image-selection').appendChild(contBtn);
    contBtn.addEventListener('click', function () {
      currentLevel = saved.level;
      coinsCollected = saved.coins;
      totalDeaths = saved.deaths;
      lives = saved.lives !== undefined ? saved.lives : 5;
      playerImg.src = "../drag-game/images/Mario_Jump.png";
      document.getElementById('image-selection').style.display = 'none';
      document.getElementById('game-wrapper').style.display = 'block';
      showControlChoice(function (wantDPad) {
        useDPad = wantDPad;
        initLevel(currentLevel);
        if (useDPad) createDPad();
        gameLoop();
      });
    });
  }

  function chooseCharacter(src, luigi, peach, toad) {
    isLuigi = luigi;
    isPeach = peach;
    isToad = toad;
    playerImg.src = src;
    clearProgress();
    currentLevel = 0;
    coinsCollected = 0;
    totalDeaths = 0;
    lives = 5;
    document.getElementById('image-selection').style.display = 'none';
    document.getElementById('game-wrapper').style.display = 'block';

    showControlChoice(function (wantDPad) {
      useDPad = wantDPad;
      initLevel(currentLevel);
      if (useDPad) createDPad();
      gameLoop();
    });
  }

  function showControlChoice(callback) {
    var modal = document.createElement('div');
    modal.id = 'control-choice-modal';
    modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:2000;';
    modal.innerHTML =
      '<div style="background:linear-gradient(160deg,#0d1137,#06061a);padding:32px 24px;border-radius:16px;box-shadow:0 0 40px rgba(139,92,246,0.3);text-align:center;max-width:90vw;border:1px solid rgba(139,92,246,0.3);">' +
      '<h2 style="margin-bottom:18px;color:#e0d8f8;font-size:1.8em;">Controls</h2>' +
      '<button id="choose-dpad" style="margin:12px 16px;padding:12px 24px;font-size:1.2em;background:linear-gradient(90deg,#8b5cf6,#6d28d9);color:#fff;border:none;border-radius:8px;cursor:pointer;box-shadow:0 4px 15px rgba(139,92,246,0.25);">Show Arrow Buttons</button>' +
      '<button id="choose-keys" style="margin:12px 16px;padding:12px 24px;font-size:1.2em;background:linear-gradient(90deg,#8b5cf6,#6d28d9);color:#fff;border:none;border-radius:8px;cursor:pointer;box-shadow:0 4px 15px rgba(139,92,246,0.25);">Use Keyboard Arrows</button>' +
      '</div>';
    document.body.appendChild(modal);
    document.getElementById('choose-dpad').onclick = function () { modal.remove(); callback(true); };
    document.getElementById('choose-keys').onclick = function () { modal.remove(); callback(false); };
  }

  // ── Init level ──
  function initLevel(index) {
    var lv = levels[index];
    canvas.width = 3000;
    canvas.height = 850;

    var ps = lv.playerStart;
    if (isPeach) {
      player = { x: ps.x, y: ps.y, w: 65, h: 120, vx: 0, vy: 0, onGround: false, jumpCount: 0 };
    } else if (isToad) {
      player = { x: ps.x, y: ps.y, w: 70, h: 120, vx: 0, vy: 0, onGround: false, jumpCount: 0 };
    } else {
      player = { x: ps.x, y: ps.y, w: 80, h: 130, vx: 0, vy: 0, onGround: false, jumpCount: 0 };
    }

    platforms = lv.platforms.map(function (p) {
      return { x: p.x, y: p.y, w: p.w, h: p.h };
    });

    enemies = lv.enemies.map(function (e) {
      return {
        x: e.x, y: e.y, w: e.w, h: e.h,
        startX: e.x, range: e.range, dir: e.dir, speed: 1.5
      };
    });

    coins = lv.coins.map(function (c) {
      return { x: c.x, y: c.y, w: 50, h: 50, collected: false };
    });
    levelCoins = 0;

    finishZone = { x: lv.finish.x, y: lv.finish.y, w: 80, h: 100 };

    camera = { x: 0 };
    gameOver = false;
    levelComplete = false;

    levelDisplay.textContent = 'Level ' + (index + 1);
    updateHUD();
  }

  // ── Game loop ──
  function gameLoop() {
    if (!gameOver && !levelComplete) {
      update();
    }
    draw();
    animFrame = requestAnimationFrame(gameLoop);
  }

  // ── Update ──
  function update() {
    // Horizontal movement
    var speed = 5;
    if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -speed;
    else if (keys['ArrowRight'] || keys['KeyD']) player.vx = speed;
    else player.vx *= 0.7;

    // Jump
    if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && player.onGround) {
      player.vy = -12;
      player.onGround = false;
    }

    // Gravity
    player.vy += 0.6;
    if (player.vy > 15) player.vy = 15;

    // Move X
    player.x += player.vx;
    if (player.x < 0) player.x = 0;

    // Platform collision X
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      if (player.vx > 0 && player.x + player.w > p.x && player.x < p.x + p.w &&
          player.y + player.h > p.y && player.y < p.y + p.h) {
        player.x = p.x - player.w;
      } else if (player.vx < 0 && player.x < p.x + p.w && player.x + player.w > p.x &&
          player.y + player.h > p.y && player.y < p.y + p.h) {
        player.x = p.x + p.w;
      }
    }

    // Move Y
    player.y += player.vy;
    player.onGround = false;

    // Platform collision Y
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      if (player.vy >= 0 && player.y + player.h > p.y && player.y < p.y + p.h &&
          player.x + player.w > p.x && player.x < p.x + p.w) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
      } else if (player.vy < 0 && player.y < p.y + p.h && player.y + player.h > p.y &&
          player.x + player.w > p.x && player.x < p.x + p.w) {
        player.y = p.y + p.h;
        player.vy = 0;
      }
    }

    // Fall off world
    if (player.y > canvas.height + 50) {
      die();
      return;
    }

    // Update enemies
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      e.x += e.speed * e.dir;
      if (e.x > e.startX + e.range || e.x < e.startX - e.range) {
        e.dir *= -1;
      }
      // Enemy collision
      if (!gameOver && player.x < e.x + e.w && player.x + player.w > e.x &&
          player.y < e.y + e.h && player.y + player.h > e.y) {
        // Check if landing on top
        if (player.vy > 0 && player.y + player.h - e.y < 20) {
          enemies.splice(i, 1);
          i--;
          player.vy = -10;
        } else {
          die();
          return;
        }
      }
    }

    // Collect coins
    for (var i = 0; i < coins.length; i++) {
      var c = coins[i];
      if (!c.collected && player.x < c.x + c.w && player.x + player.w > c.x &&
          player.y < c.y + c.h && player.y + player.h > c.y) {
        c.collected = true;
        coinsCollected++;
        levelCoins++;
        saveProgress();
        updateHUD();
      }
    }

    // Check finish
    if (player.x < finishZone.x + finishZone.w && player.x + player.w > finishZone.x &&
        player.y < finishZone.y + finishZone.h && player.y + player.h > finishZone.y) {
      levelComplete = true;
      if (currentLevel === levels.length - 1) {
        showWin();
      } else {
        showLevelComplete();
      }
    }

    // Camera follow
    camera.x = player.x - canvas.width / 3;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > canvas.width - canvas.clientWidth) camera.x = canvas.width - canvas.clientWidth;
  }

  // ── Die ──
  function die() {
    gameOver = true;
    totalDeaths++;
    lives--;
    updateHUD();
    saveProgress();
    if (lives <= 0) {
      deathOverlay.querySelector('p').textContent = 'Out of lives! Game Over!';
      document.getElementById('retry-btn').textContent = 'Start Over';
    } else {
      deathOverlay.querySelector('p').textContent = 'You died! ' + lives + ' lives left.';
      document.getElementById('retry-btn').textContent = 'Retry';
    }
    deathOverlay.hidden = false;
  }

  // ── Retry ──
  document.getElementById('retry-btn').addEventListener('click', function () {
    deathOverlay.hidden = true;
    if (lives <= 0) {
      currentLevel = 0;
      coinsCollected = 0;
      totalDeaths = 0;
      lives = 5;
      clearProgress();
    }
    initLevel(currentLevel);
  });

  // ── Level complete ──
  function showLevelComplete() {
    document.getElementById('complete-stats').textContent =
      'Coins: ' + levelCoins + '  |  Deaths: ' + totalDeaths;
    levelCompleteOverlay.hidden = false;
  }

  document.getElementById('next-level-btn').addEventListener('click', function () {
    levelCompleteOverlay.hidden = true;
    currentLevel++;
    saveProgress();
    initLevel(currentLevel);
  });

  // ── Game won ──
  function showWin() {
    document.getElementById('win-stats').textContent =
      'Total Coins: ' + coinsCollected + '  |  Total Deaths: ' + totalDeaths;
    gameWonOverlay.hidden = false;
  }

  document.getElementById('play-again-btn').addEventListener('click', function () {
    gameWonOverlay.hidden = true;
    currentLevel = 0;
    coinsCollected = 0;
    totalDeaths = 0;
    lives = 5;
    clearProgress();
    initLevel(0);
  });

  // ── HUD ──
  function updateHUD() {
    coinDisplay.textContent = '🪙 ' + coinsCollected;
    livesDisplay.textContent = '❤️ ' + lives;
  }

  // ── Draw ──
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0f0c29');
    grad.addColorStop(0.5, '#302b63');
    grad.addColorStop(1, '#24243e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera.x, 0);

    // Platforms
    ctx.fillStyle = '#5a4a8a';
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      // Platform top
      ctx.fillStyle = '#7c6ab0';
      ctx.fillRect(p.x, p.y, p.w, 6);
      // Platform body
      ctx.fillStyle = '#5a4a8a';
      ctx.fillRect(p.x, p.y + 6, p.w, p.h - 6);
      // Border
      ctx.strokeStyle = '#8b7bc0';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    }

    // Coins
    for (var i = 0; i < coins.length; i++) {
      var c = coins[i];
      if (!c.collected) {
        if (coinImg.complete && coinImg.naturalWidth > 0) {
          ctx.drawImage(coinImg, c.x, c.y, c.w, c.h);
        } else {
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#daa520';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', c.x + c.w / 2, c.y + c.h / 2);
        }
      }
    }

    // Enemies
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (goombaImg.complete && goombaImg.naturalWidth > 0) {
        ctx.drawImage(goombaImg, e.x, e.y, e.w, e.h);
      } else {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.fillStyle = '#fff';
        ctx.fillRect(e.x + 8, e.y + 8, 8, 8);
        ctx.fillRect(e.x + e.w - 16, e.y + 8, 8, 8);
      }
    }

    // Finish zone
    if (trophyImg.complete && trophyImg.naturalWidth > 0) {
      ctx.drawImage(trophyImg, finishZone.x, finishZone.y, finishZone.w, finishZone.h);
    } else {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(finishZone.x, finishZone.y, finishZone.w, finishZone.h);
    }
    ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
    ctx.fillRect(finishZone.x - 10, finishZone.y - 10, finishZone.w + 20, finishZone.h + 20);

    // Player
    if (playerImg.complete && playerImg.naturalWidth > 0) {
      ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
    } else {
      ctx.fillStyle = '#e040fb';
      ctx.fillRect(player.x, player.y, player.w, player.h);
    }

    ctx.restore();
  }

  // ── Keyboard ──
  window.addEventListener('keydown', function (e) {
    keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) !== -1) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', function (e) {
    keys[e.code] = false;
  });

  // ── D-Pad (match Race/Finish-Line style) ──
  function simulateKey(code, isDown) {
    keys[code] = isDown;
  }

  function createDPad() {
    if (document.getElementById('dpad-container')) return;
    var dpad = document.createElement('div');
    dpad.id = 'dpad-container';
    dpad.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;position:fixed;bottom:30px;left:0;right:0;z-index:1000;pointer-events:none;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;width:100%;padding:0 30px;">' +
      '<div style="display:flex;gap:8px;pointer-events:auto;">' +
      '<button class="dpad-btn" id="dpad-left">&#9668;</button>' +
      '<button class="dpad-btn" id="dpad-right">&#9658;</button>' +
      '</div>' +
      '<button id="dpad-home" style="pointer-events:auto;background:linear-gradient(90deg,#8b5cf6,#6d28d9);color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:1.2em;cursor:pointer;box-shadow:0 4px 15px rgba(139,92,246,0.25);">Home</button>' +
      '<button id="dpad-jump" style="pointer-events:auto;width:130px;height:130px;min-width:130px;max-width:130px;padding:0;font-size:4em;line-height:130px;text-align:center;border-radius:50%;border:none;flex-shrink:0;flex-grow:0;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;cursor:pointer;box-shadow:0 4px 20px rgba(239,68,68,0.4);">&#9650;</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(dpad);

    var style = document.createElement('style');
    style.textContent =
      '.dpad-btn { width:48px; height:48px; margin:0; font-size:2em; border-radius:12px; border:none; background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; box-shadow:0 4px 15px rgba(239,68,68,0.4); }' +
      '.dpad-btn:active { background:#c82333; }';
    document.head.appendChild(style);

    document.getElementById('dpad-home').onclick = function () {
      window.location.href = '../index.html';
    };

    function bindKey(id, code) {
      var btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', function (e) { e.preventDefault(); simulateKey(code, true); });
      btn.addEventListener('touchend', function (e) { e.preventDefault(); simulateKey(code, false); });
      btn.addEventListener('mousedown', function (e) { e.preventDefault(); simulateKey(code, true); });
      btn.addEventListener('mouseup', function (e) { e.preventDefault(); simulateKey(code, false); });
      btn.addEventListener('mouseleave', function (e) { e.preventDefault(); simulateKey(code, false); });
    }

    bindKey('dpad-left', 'ArrowLeft');
    bindKey('dpad-right', 'ArrowRight');
    bindKey('dpad-jump', 'ArrowUp');
  }
})();
