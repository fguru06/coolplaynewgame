(function () {
  const COLORS = [
    '#e040fb', '#06d6a0', '#ffd166', '#8b5cf6', '#ff6b6b',
    '#42a5f5', '#ff8a65', '#aed581', '#f06292', '#4dd0e1',
    '#dce775', '#ba68c8', '#4db6ac', '#ffb74d', '#7986cb',
    '#e57373', '#81c784', '#64b5f6', '#fff176', '#9575cd'
  ];

  // ── State ──
  let options = [];

  // ── DOM refs ──
  const optionInput = document.getElementById('option-input');
  const addBtn = document.getElementById('add-btn');
  const optionsDisplay = document.getElementById('options-display');
  const emptyMsg = document.getElementById('empty-msg');
  const spinBtn = document.getElementById('spin-btn');
  const clearBtn = document.getElementById('clear-btn');
  const canvas = document.getElementById('wheel-canvas');
  const ctx = canvas.getContext('2d');
  const resultDiv = document.getElementById('result');
  const resultValue = document.getElementById('result-value');
  const removeResultBtn = document.getElementById('remove-result-btn');

  let isSpinning = false;
  let currentRotation = 0;
  let animFrame = null;

  // ── Add option ──
  addBtn.addEventListener('click', function () {
    var text = optionInput.value.trim();
    if (!text) { optionInput.focus(); return; }
    if (options.length >= 20) { alert('Maximum 20 options allowed.'); return; }
    options.push(text);
    optionInput.value = '';
    optionInput.focus();
    updateUI();
  });

  optionInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addBtn.click();
  });

  // ── Clear all ──
  clearBtn.addEventListener('click', function () {
    if (options.length === 0) return;
    if (!confirm('Clear all options?')) return;
    options = [];
    hideResult();
    updateUI();
  });

  // ── Remove single option ──
  function removeOption(index) {
    options.splice(index, 1);
    hideResult();
    updateUI();
  }

  // ── Update UI ──
  function updateUI() {
    // Tags
    optionsDisplay.innerHTML = '';
    if (options.length === 0) {
      emptyMsg.style.display = 'block';
    } else {
      emptyMsg.style.display = 'none';
      options.forEach(function (text, i) {
        var tag = document.createElement('span');
        tag.className = 'option-tag';
        tag.textContent = text;

        var rmBtn = document.createElement('button');
        rmBtn.className = 'remove-option';
        rmBtn.textContent = '✕';
        rmBtn.title = 'Remove';
        rmBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          removeOption(i);
        });

        tag.appendChild(rmBtn);
        optionsDisplay.appendChild(tag);
      });
    }

    spinBtn.disabled = options.length < 2;
    drawWheel(currentRotation);
  }

  // ── Draw wheel ──
  function drawWheel(rotation) {
    var w = canvas.width;
    var h = canvas.height;
    var cx = w / 2;
    var cy = h / 2;
    var r = Math.min(cx, cy) - 8;

    ctx.clearRect(0, 0, w, h);

    if (options.length === 0) {
      // Empty wheel
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20, 18, 50, 0.6)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#605888';
      ctx.font = '16px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add at least 2 options', cx, cy);
      return;
    }

    var arc = (Math.PI * 2) / options.length;

    // Draw segments
    for (var i = 0; i < options.length; i++) {
      var startAngle = rotation + i * arc - Math.PI / 2;
      var endAngle = startAngle + arc;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(10, 8, 30, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text
      var midAngle = startAngle + arc / 2;
      var textR = r * 0.62;
      var tx = cx + Math.cos(midAngle) * textR;
      var ty = cy + Math.sin(midAngle) * textR;

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(midAngle + (midAngle > Math.PI / 2 && midAngle < Math.PI * 3 / 2 ? Math.PI : 0));
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 3;

      var displayText = options[i];
      if (displayText.length > 12) displayText = displayText.slice(0, 11) + '…';
      ctx.fillText(displayText, 0, 0);
      ctx.restore();
    }

    // Center circle
    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
    grad.addColorStop(0, '#2a2050');
    grad.addColorStop(1, '#0d1137');
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Outer glow dots
    for (var j = 0; j < options.length; j++) {
      var dotAngle = rotation + j * arc - Math.PI / 2;
      var dx = cx + Math.cos(dotAngle) * (r + 2);
      var dy = cy + Math.sin(dotAngle) * (r + 2);
      ctx.beginPath();
      ctx.arc(dx, dy, 4, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[j % COLORS.length];
      ctx.fill();
    }
  }

  // ── Spin ──
  spinBtn.addEventListener('click', function () {
    if (isSpinning || options.length < 2) return;
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    hideResult();
    isSpinning = true;
    spinBtn.disabled = true;

    var totalRotation = currentRotation + (Math.random() * 2000 + 2000);
    var duration = 3000 + Math.random() * 1000;
    var startTime = performance.now();
    var startRotation = currentRotation;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now) {
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(progress);
      currentRotation = startRotation + (totalRotation - startRotation) * eased;

      drawWheel(currentRotation);

      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        currentRotation = totalRotation;
        isSpinning = false;
        spinBtn.disabled = false;
        animFrame = null;
        showResult();
      }
    }

    animFrame = requestAnimationFrame(animate);
  });

  // ── Show result ──
  function showResult() {
    if (options.length === 0) return;

    // The pointer is at the top. The winning segment is determined by
    // which segment is at the top (angle = -PI/2).
    var arc = (Math.PI * 2) / options.length;
    // Normalize rotation so we can figure out which segment is at the top
    var norm = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    // Segment 0 starts at -PI/2. Top is at -PI/2.
    // Which segment is at the top?
    var idx = Math.floor(((Math.PI * 2) - norm) / arc) % options.length;

    resultValue.textContent = options[idx];
    resultDiv.hidden = false;

    // Store winner index for "remove & spin again"
    resultDiv.dataset.winnerIdx = idx;
  }

  function hideResult() {
    resultDiv.hidden = true;
    delete resultDiv.dataset.winnerIdx;
  }

  // ── Remove winner & spin again ──
  removeResultBtn.addEventListener('click', function () {
    var idx = parseInt(resultDiv.dataset.winnerIdx, 10);
    if (!isNaN(idx) && idx >= 0 && idx < options.length) {
      options.splice(idx, 1);
    }
    hideResult();
    updateUI();
    // Auto-spin if enough options remain
    if (options.length >= 2) {
      setTimeout(function () { spinBtn.click(); }, 400);
    }
  });

  // ── Initial draw ──
  updateUI();
})();
