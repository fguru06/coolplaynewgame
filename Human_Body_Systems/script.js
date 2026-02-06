const answers = {};
let currentHotspotId = '';
const totalQuestions = 10;

const overlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalQuestion = document.getElementById('modal-question');
const modalSubmit = document.getElementById('modal-submit');
const modalClose = document.getElementById('modal-close');
const savedMsg = document.getElementById('saved-msg');
const checkAllBtn = document.getElementById('check-all-btn');
const checkBtnWrapper = document.getElementById('check-btn-wrapper');
const progressCover = document.getElementById('progress-cover');
const resultsOverlay = document.getElementById('results-overlay');

function updateProgress() {
  const count = Object.keys(answers).length;
  const remaining = totalQuestions - count;
  const pct = (remaining / totalQuestions) * 100;
  progressCover.style.width = pct + '%';

  if (count >= totalQuestions) {
    checkBtnWrapper.classList.add('unlocked');
  }
}

function openModal(btn) {
  currentHotspotId = btn.id;
  modalTitle.textContent = btn.dataset.title;
  modalDesc.textContent = btn.dataset.desc;
  modalQuestion.textContent = btn.dataset.question;

  document.querySelectorAll('input[name="answer"]').forEach(r => r.checked = false);
  savedMsg.style.display = 'none';
  overlay.classList.add('show');
}

function closeModal() {
  overlay.classList.remove('show');
  document.querySelectorAll('.hotspot').forEach(b => b.classList.remove('active'));
}

// Hotspot clicks
document.querySelectorAll('.hotspot').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (btn.classList.contains('answered')) return;
    document.querySelectorAll('.hotspot').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    openModal(btn);
  });
});

// Save answer
modalSubmit.addEventListener('click', () => {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) return;

  answers[currentHotspotId] = selected.value;

  const hotspot = document.getElementById(currentHotspotId);
  hotspot.classList.add('answered');
  hotspot.textContent = '+';

  savedMsg.style.display = 'block';
  updateProgress();

  setTimeout(closeModal, 600);
});

// Close modal
modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

// Check all answers
checkAllBtn.addEventListener('click', () => {
  if (!checkBtnWrapper.classList.contains('unlocked')) return;

  let correct = 0;
  let html = '';

  document.querySelectorAll('.hotspot').forEach(btn => {
    const id = btn.id;
    const title = btn.dataset.title;
    const question = btn.dataset.question;
    const correctAnswer = btn.dataset.answer;
    const userAnswer = answers[id];
    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) correct++;

    html += '<div class="result-item ' + (isCorrect ? 'correct' : 'incorrect') + '">';
    html += '<strong>' + (isCorrect ? '✔' : '✘') + ' ' + title + '</strong>';
    html += question + ' — You said: ' + (userAnswer === 'true' ? 'True' : 'False');
    if (!isCorrect) html += ' (Answer: ' + (correctAnswer === 'true' ? 'True' : 'False') + ')';
    html += '</div>';
  });

  const wrong = totalQuestions - correct;
  const maxBarHeight = 120;

  const scoreEl = document.getElementById('result-score');
  scoreEl.textContent = correct + ' / ' + totalQuestions + ' correct';
  if (correct === totalQuestions) scoreEl.className = 'result-score perfect';
  else if (correct >= 7) scoreEl.className = 'result-score good';
  else scoreEl.className = 'result-score low';

  document.getElementById('results-list').innerHTML = html;

  // Render chart bars
  document.getElementById('chart-correct-count').textContent = correct;
  document.getElementById('chart-incorrect-count').textContent = wrong;

  // Animate bars after a short delay
  setTimeout(() => {
    document.getElementById('chart-correct-bar').style.height = (correct / totalQuestions) * maxBarHeight + 'px';
    document.getElementById('chart-incorrect-bar').style.height = (wrong / totalQuestions) * maxBarHeight + 'px';
  }, 100);

  resultsOverlay.classList.add('show');
});

// Close results
document.getElementById('results-close').addEventListener('click', () => {
  resultsOverlay.classList.remove('show');
});
resultsOverlay.addEventListener('click', (e) => {
  if (e.target === resultsOverlay) resultsOverlay.classList.remove('show');
});

// Retry
document.getElementById('retry-btn').addEventListener('click', () => {
  Object.keys(answers).forEach(k => delete answers[k]);
  document.querySelectorAll('.hotspot').forEach(btn => {
    btn.classList.remove('answered');
    btn.textContent = '+';
  });
  checkBtnWrapper.classList.remove('unlocked');
  progressCover.style.width = '100%';
  resultsOverlay.classList.remove('show');

  // Reset chart bars
  document.getElementById('chart-correct-bar').style.height = '0';
  document.getElementById('chart-incorrect-bar').style.height = '0';
  document.getElementById('chart-correct-count').textContent = '0';
  document.getElementById('chart-incorrect-count').textContent = '0';
});

// Initialize cover at 100%
progressCover.style.width = '100%';

// Download PDF
document.getElementById('download-pdf-btn').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  // Title
  pdf.setFontSize(22);
  pdf.setTextColor(21, 101, 192);
  pdf.text('Human Body Systems - Quiz Results', pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Score
  let correct = 0;
  const total = totalQuestions;
  document.querySelectorAll('.hotspot').forEach(btn => {
    if (answers[btn.id] === btn.dataset.answer) correct++;
  });
  const wrong = total - correct;

  pdf.setFontSize(16);
  if (correct === total) pdf.setTextColor(46, 125, 50);
  else if (correct >= 7) pdf.setTextColor(245, 127, 23);
  else pdf.setTextColor(198, 40, 40);
  pdf.text('Score: ' + correct + ' / ' + total + ' correct', pageWidth / 2, y, { align: 'center' });
  y += 14;

  // Chart bars (drawn as rectangles)
  const barMaxHeight = 40;
  const barWidth = 30;
  const chartX = pageWidth / 2 - 40;
  const chartBaseline = y + barMaxHeight;

  // Correct bar
  const correctHeight = (correct / total) * barMaxHeight;
  pdf.setFillColor(102, 187, 106);
  pdf.rect(chartX, chartBaseline - correctHeight, barWidth, correctHeight, 'F');
  pdf.setFontSize(12);
  pdf.setTextColor(46, 125, 50);
  pdf.text(String(correct), chartX + barWidth / 2, chartBaseline - correctHeight - 3, { align: 'center' });
  pdf.setTextColor(100, 100, 100);
  pdf.text('Correct', chartX + barWidth / 2, chartBaseline + 6, { align: 'center' });

  // Incorrect bar
  const incorrectHeight = (wrong / total) * barMaxHeight;
  const barX2 = chartX + barWidth + 20;
  pdf.setFillColor(239, 83, 80);
  pdf.rect(barX2, chartBaseline - incorrectHeight, barWidth, incorrectHeight, 'F');
  pdf.setFontSize(12);
  pdf.setTextColor(198, 40, 40);
  pdf.text(String(wrong), barX2 + barWidth / 2, chartBaseline - incorrectHeight - 3, { align: 'center' });
  pdf.setTextColor(100, 100, 100);
  pdf.text('Incorrect', barX2 + barWidth / 2, chartBaseline + 6, { align: 'center' });

  y = chartBaseline + 16;

  // Divider
  pdf.setDrawColor(200, 200, 200);
  pdf.line(15, y, pageWidth - 15, y);
  y += 8;

  // Results list
  pdf.setFontSize(14);
  pdf.setTextColor(33, 33, 33);
  pdf.text('Detailed Results:', 15, y);
  y += 8;

  document.querySelectorAll('.hotspot').forEach(btn => {
    const title = btn.dataset.title;
    const question = btn.dataset.question;
    const correctAnswer = btn.dataset.answer;
    const userAnswer = answers[btn.id];
    const isCorrect = userAnswer === correctAnswer;

    // Check if we need a new page
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }

    // Icon and title
    pdf.setFontSize(12);
    if (isCorrect) {
      pdf.setTextColor(46, 125, 50);
      pdf.text('[CORRECT] ' + title, 15, y);
    } else {
      pdf.setTextColor(198, 40, 40);
      pdf.text('[WRONG] ' + title, 15, y);
    }
    y += 6;

    // Question and answer
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text('Q: ' + question, 20, y);
    y += 5;
    pdf.text('Your answer: ' + (userAnswer === 'true' ? 'True' : 'False'), 20, y);
    if (!isCorrect) {
      y += 5;
      pdf.setTextColor(198, 40, 40);
      pdf.text('Correct answer: ' + (correctAnswer === 'true' ? 'True' : 'False'), 20, y);
    }
    y += 8;
  });

  // Footer
  y += 5;
  if (y > 280) { pdf.addPage(); y = 20; }
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Generated by Interactive Human Body Systems Quiz', pageWidth / 2, y, { align: 'center' });

  pdf.save('human-body-quiz-results.pdf');
});
