// ================= STATE =================
let selectedTime = null;
let timeLeft = 0;
let isRunning = false;
let timerInterval = null;
let selectedEggType = "";

// ================= DOM =================
const timeDisplay = document.getElementById("time-display");
const statusText = document.getElementById("status-text");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const startIcon = document.getElementById("start-icon");
const startText = document.getElementById("start-text");
const progressCircle = document.getElementById("progress-circle");
const eggButtons = document.querySelectorAll(".egg-btn");
const alarmSound = document.getElementById("alarm-sound");

// ================= iOS AUDIO UNLOCK =================
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked || !alarmSound) return;

  // لازم يصير داخل لمسة المستخدم (touch/click)
  alarmSound.muted = true;
  alarmSound.currentTime = 0;

  const p = alarmSound.play();
  if (p && p.then) {
    p.then(() => {
      alarmSound.pause();
      alarmSound.currentTime = 0;
      alarmSound.muted = false;
      audioUnlocked = true;
    }).catch(() => {
      alarmSound.muted = false;
    });
  } else {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.muted = false;
    audioUnlocked = true;
  }
}

// ================= PROGRESS RING =================
const radius = 110;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

// ================= UI HELPERS =================
function updateDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timeDisplay.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateProgress() {
  if (!selectedTime) return;
  const progress = (selectedTime - timeLeft) / selectedTime;
  const offset = circumference - (progress * circumference);
  progressCircle.style.strokeDashoffset = offset;
}

function setButtonsEnabled(enabled) {
  startBtn.disabled = !enabled;
  resetBtn.disabled = !enabled;
}

function setStartStateRunning(running) {
  isRunning = running;
  startIcon.textContent = running ? "⏸️" : "▶️";
  startText.textContent = running ? "Pause" : "Start";
}

// ================= EGG SELECTION =================
eggButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    unlockAudio(); // iOS: فتح الصوت من أول تفاعل

    eggButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    selectedTime = parseInt(btn.dataset.time, 10);
    selectedEggType = btn.dataset.name || "";
    timeLeft = selectedTime;

    setButtonsEnabled(true);
    stopTimer();
    statusText.textContent = "";
    progressCircle.classList.remove("complete");
    updateDisplay();
    updateProgress();
  }, { passive: true });
});

// ================= START / PAUSE (iOS: touchstart) =================
function handleStartPress() {
  unlockAudio();

  if (!selectedTime) return;

  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

startBtn.addEventListener("click", handleStartPress);
startBtn.addEventListener("touchstart", (e) => {
  e.preventDefault(); // مهم على iOS
  handleStartPress();
}, { passive: false });

// ================= RESET =================
resetBtn.addEventListener("click", resetTimer);
resetBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  resetTimer();
}, { passive: false });

// ================= TIMER =================
function startTimer() {
  if (timeLeft <= 0) return;

  setStartStateRunning(true);
  statusText.textContent = "";

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay();
    updateProgress();

    if (timeLeft <= 0) {
      completeTimer();
    }
  }, 1000);
}

function pauseTimer() {
  stopTimer();
  startText.textContent = "Resume";
}

function stopTimer() {
  setStartStateRunning(false);
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  if (!selectedTime) return;
  stopTimer();
  timeLeft = selectedTime;
  statusText.textContent = "";
  progressCircle.classList.remove("complete");
  updateDisplay();
  updateProgress();
}

// ================= COMPLETE =================
function completeTimer() {
  stopTimer();
  timeLeft = 0;
  updateDisplay();
  updateProgress();

  statusText.textContent = "Done! 🎉";
  progressCircle.classList.add("complete");

  playAlarm();
  flashTitle();
}

// ================= ALARM =================
function playAlarm() {
  if (!alarmSound) return;

  alarmSound.pause();
  alarmSound.currentTime = 0;

  alarmSound.play().catch(() => {
    // fallback beep
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

// ================= TITLE FLASH =================
function flashTitle() {
  let count = 0;
  const original = document.title;

  const interval = setInterval(() => {
    document.title = (count % 2 === 0) ? "🥚 Eggs Ready!" : original;
    count++;
    if (count > 10) {
      clearInterval(interval);
      document.title = original;
    }
  }, 500);
}

// ================= INIT =================
setButtonsEnabled(false);
updateDisplay();
updateProgress();
