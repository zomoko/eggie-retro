// ================= TIMER STATE =================
let selectedTime = null;
let timeLeft = 0;
let isRunning = false;
let timerInterval = null;
let selectedEggType = '';

// ================= DOM ELEMENTS =================
const timeDisplay = document.getElementById('time-display');
const statusText = document.getElementById('status-text');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const startIcon = document.getElementById('start-icon');
const startText = document.getElementById('start-text');
const progressCircle = document.getElementById('progress-circle');
const eggButtons = document.querySelectorAll('.egg-btn');
const alarmSound = document.getElementById('alarm-sound');

// ================= AUDIO UNLOCK =================
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked || !alarmSound) return;

  alarmSound.muted = true;
  alarmSound.currentTime = 0;

  alarmSound.play().then(() => {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.muted = false;
    audioUnlocked = true;
  }).catch(() => {
    alarmSound.muted = false;
  });
}

// ================= PROGRESS CIRCLE =================
const radius = 110;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

// ================= EGG SELECTION =================
eggButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    unlockAudio(); // مهم لسفاري

    eggButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    selectedTime = parseInt(btn.dataset.time);
    selectedEggType = btn.dataset.name;
    timeLeft = selectedTime;

    startBtn.disabled = false;
    resetBtn.disabled = false;

    stopTimer();
    updateDisplay();
    updateProgress();
    statusText.textContent = '';
    progressCircle.classList.remove('complete');
  });
});

// ================= START / PAUSE =================
startBtn.addEventListener('click', () => {
  unlockAudio();

  if (isRunning) pauseTimer();
  else startTimer();
});

// ================= RESET =================
resetBtn.addEventListener('click', resetTimer);

// ================= TIMER FUNCTIONS =================
function startTimer() {
  if (timeLeft <= 0) return;

  isRunning = true;
  startIcon.textContent = '⏸️';
  startText.textContent = 'Pause';
  statusText.textContent = '';

  timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay();
    updateProgress();

    if (timeLeft <= 0) completeTimer();
  }, 1000);
}

function pauseTimer() {
  stopTimer();
  startIcon.textContent = '▶️';
  startText.textContent = 'Resume';
}

function stopTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
  startIcon.textContent = '▶️';
  startText.textContent = 'Start';
}

function resetTimer() {
  stopTimer();
  timeLeft = selectedTime;
  updateDisplay();
  updateProgress();
  statusText.textContent = '';
  progressCircle.classList.remove('complete');
}

// ================= COMPLETE =================
function completeTimer() {
  stopTimer();
  statusText.textContent = 'Done! 🎉';
  progressCircle.classList.add('complete');
  playAlarm();
  flashTitle();
}

// ================= ALARM =================
function playAlarm() {
  if (!alarmSound) return;

  alarmSound.pause();
  alarmSound.currentTime = 0;

  alarmSound.play().catch(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

    osc.start();
    osc.stop(ctx.currentTime + 1);
  });
}

// ================= UI UPDATES =================
function updateDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timeDisplay.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function updateProgress() {
  if (!selectedTime) return;
  const progress = (selectedTime - timeLeft) / selectedTime;
  progressCircle.style.strokeDashoffset = circumference - (progress * circumference);
}

// ================= TITLE FLASH =================
function flashTitle() {
  let count = 0;
  const original = document.title;

  const interval = setInterval(() => {
    document.title = count % 2 === 0 ? '🥚 Eggs Ready!' : original;
    count++;
    if (count > 10) {
      clearInterval(interval);
      document.title = original;
    }
  }, 500);
}

// ================= INIT =================
updateDisplay();
