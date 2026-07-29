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
  const resultLabel = document.getElementById('result-label');
  const resultWins = document.getElementById('result-wins');
  const removeResultBtn = document.getElementById('remove-result-btn');

  let isSpinning = false;
  let currentRotation = 0;
  let animFrame = null;

  // ── Add option ──
  addBtn.addEventListener('click', function () {
    var text = optionInput.value.trim();
    if (!text) { optionInput.focus(); return; }
    if (options.length >= 20) { alert('Maximum 20 options allowed.'); return; }
    options.push({ text, color: COLORS[options.length % COLORS.length] });
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
      options.forEach(function (opt, i) {
        var tag = document.createElement('span');
        tag.className = 'option-tag';
        tag.textContent = opt.text;

        // Color swatch
        var swatch = document.createElement('button');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = opt.color;
        swatch.title = 'Change color';
        swatch.addEventListener('click', function (e) {
          e.stopPropagation();
          openColorPicker(i);
        });

        var rmBtn = document.createElement('button');
        rmBtn.className = 'remove-option';
        rmBtn.textContent = '✕';
        rmBtn.title = 'Remove';
        rmBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          removeOption(i);
        });

        tag.appendChild(swatch);
        tag.appendChild(rmBtn);
        optionsDisplay.appendChild(tag);
      });
    }

    spinBtn.disabled = options.length < 2;
    updateSaveBtn();
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
      ctx.fillStyle = options[i].color;
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

      var displayText = options[i].text;
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
      ctx.fillStyle = options[j].color;
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

    var totalRotation = currentRotation + (Math.random() * 3000 + 3000);
    var duration = 5000 + Math.random() * 2000;
    var startTime = performance.now();
    var startRotation = currentRotation;

    function easeOutQuint(t) {
      return 1 - Math.pow(1 - t, 5);
    }

    function animate(now) {
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutQuint(progress);
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

    var winner = options[idx];
    resultLabel.textContent = winner.text;
    resultLabel.style.color = winner.color;
    resultLabel.style.textShadow = '0 0 20px ' + winner.color + '80';
    resultWins.style.color = winner.color;
    removeResultBtn.style.background = 'linear-gradient(135deg, ' + winner.color + ', ' + winner.color + '88)';
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

  // ── DOM refs (save/load) ──
  const saveBtn = document.getElementById('save-btn');
  const savedWheelsEl = document.getElementById('saved-wheels');
  const savedListEl = document.getElementById('saved-list');
  const STORAGE_KEY = 'spinit-saved-wheels';

  // ── Save wheel ──
  var saveOverlay = null;
  var saveInput = null;

  saveBtn.addEventListener('click', function () {
    if (options.length < 2) return;
    if (!saveOverlay) createSaveModal();
    saveInput.value = '';
    saveInput.focus();
    saveOverlay.style.display = 'flex';
  });

  function doSave(name) {
    name = name.trim();
    if (!name) return;
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    saved[name] = options.map(function (o) { return { text: o.text, color: o.color }; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    saveOverlay.style.display = 'none';
    renderSavedWheels();
  }

  function createSaveModal() {
    saveOverlay = document.createElement('div');
    saveOverlay.className = 'color-picker-overlay';
    saveOverlay.style.display = 'none';

    var modal = document.createElement('div');
    modal.className = 'color-picker-modal';

    var title = document.createElement('h3');
    title.textContent = 'Name your wheel';
    modal.appendChild(title);

    saveInput = document.createElement('input');
    saveInput.type = 'text';
    saveInput.className = 'save-input';
    saveInput.placeholder = 'Enter a name...';
    saveInput.maxLength = 30;
    saveInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSave(saveInput.value);
    });
    modal.appendChild(saveInput);

    var btnRow = document.createElement('div');
    btnRow.className = 'save-btn-row';

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'save-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', function () { saveOverlay.style.display = 'none'; });

    var confirmBtn = document.createElement('button');
    confirmBtn.className = 'save-confirm';
    confirmBtn.textContent = 'Save';
    confirmBtn.addEventListener('click', function () { doSave(saveInput.value); });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    modal.appendChild(btnRow);

    saveOverlay.appendChild(modal);
    document.body.appendChild(saveOverlay);

    saveOverlay.addEventListener('click', function (e) {
      if (e.target === saveOverlay) saveOverlay.style.display = 'none';
    });
  }

  // ── Load wheel ──
  function loadWheel(name) {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!saved[name]) return;
    options = saved[name];
    hideResult();
    updateUI();
  }

  // ── Delete saved wheel ──
  function deleteSavedWheel(name) {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete saved[name];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    renderSavedWheels();
  }

  // ── Render saved wheels list ──
  function renderSavedWheels() {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    var names = Object.keys(saved);
    if (names.length === 0) {
      savedWheelsEl.hidden = true;
      return;
    }
    savedWheelsEl.hidden = false;
    savedListEl.innerHTML = '';
    names.forEach(function (name) {
      var item = document.createElement('div');
      item.className = 'saved-item';

      var label = document.createElement('span');
      label.className = 'saved-name';
      label.textContent = name;

      item.addEventListener('click', function () { loadWheel(name); });

      var delBtn = document.createElement('button');
      delBtn.className = 'saved-delete';
      delBtn.textContent = '✕';
      delBtn.title = 'Delete';
      delBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        deleteSavedWheel(name);
      });

      item.appendChild(label);
      item.appendChild(delBtn);
      savedListEl.appendChild(item);
    });
  }

  // ── Update save button state when options change ──
  function updateSaveBtn() {
    saveBtn.disabled = options.length < 2;
  }

  // ── Color Picker ──
  var colorPickerOverlay = null;
  var colorPickerModal = null;
  var pendingColorIndex = -1;

  function openColorPicker(optionIndex) {
    pendingColorIndex = optionIndex;
    if (!colorPickerOverlay) createColorPicker();
    colorPickerOverlay.style.display = 'flex';
  }

  function createColorPicker() {
    colorPickerOverlay = document.createElement('div');
    colorPickerOverlay.className = 'color-picker-overlay';
    colorPickerOverlay.style.display = 'none';

    colorPickerModal = document.createElement('div');
    colorPickerModal.className = 'color-picker-modal';

    var title = document.createElement('h3');
    title.textContent = 'Choose a color';
    colorPickerModal.appendChild(title);

    var grid = document.createElement('div');
    grid.className = 'color-grid';

    COLORS.forEach(function (color) {
      var box = document.createElement('button');
      box.className = 'color-box';
      box.style.backgroundColor = color;
      box.addEventListener('click', function () { selectColor(color); });
      grid.appendChild(box);
    });

    colorPickerModal.appendChild(grid);

    colorPickerOverlay.appendChild(colorPickerModal);
    document.body.appendChild(colorPickerOverlay);

    colorPickerOverlay.addEventListener('click', function (e) {
      if (e.target === colorPickerOverlay) colorPickerOverlay.style.display = 'none';
    });
  }

  function selectColor(color) {
    if (pendingColorIndex >= 0 && pendingColorIndex < options.length) {
      options[pendingColorIndex].color = color;
      updateUI();
    }
    colorPickerOverlay.style.display = 'none';
  }

  // ── Initial draw ──
  renderSavedWheels();
  updateUI();
})();
