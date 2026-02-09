// Timer state
let selectedTime = null;
let timeLeft = 0;
let isRunning = false;
let timerInterval = null;
let selectedEggType = '';

// DOM elements
const timeDisplay = document.getElementById('time-display');
const statusText = document.getElementById('status-text');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const startIcon = document.getElementById('start-icon');
const startText = document.getElementById('start-text');
const progressCircle = document.getElementById('progress-circle');
const eggButtons = document.querySelectorAll('.egg-btn');
const alarmSound = document.getElementById('alarm-sound');

// Progress circle circumference (2 * PI * radius)
const radius = 110;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

// Egg type selection
eggButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove selected class from all buttons
    eggButtons.forEach(b => b.classList.remove('selected'));
    
    // Add selected class to clicked button
    btn.classList.add('selected');
    
    // Get time and name from button data attributes
    selectedTime = parseInt(btn.dataset.time);
    selectedEggType = btn.dataset.name;
    timeLeft = selectedTime;
    
    // Enable start button
    startBtn.disabled = false;
    resetBtn.disabled = false;
    
    // Reset timer
    stopTimer();
    updateDisplay();
    updateProgress();
    statusText.textContent = '';
    progressCircle.classList.remove('complete');
  });
});

// Start/Pause button
startBtn.addEventListener('click', () => {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});

// Reset button
resetBtn.addEventListener('click', () => {
  resetTimer();
});

// Start timer function
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
    
    if (timeLeft <= 0) {
      completeTimer();
    }
  }, 1000);
}

// Pause timer function
function pauseTimer() {
  stopTimer();
  startIcon.textContent = '▶️';
  startText.textContent = 'Resume';
}

// Stop timer function
function stopTimer() {
  isRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  startIcon.textContent = '▶️';
  startText.textContent = 'Start';
}

// Reset timer function
function resetTimer() {
  stopTimer();
  timeLeft = selectedTime;
  updateDisplay();
  updateProgress();
  statusText.textContent = '';
  progressCircle.classList.remove('complete');
}

// Complete timer function
function completeTimer() {
  stopTimer();
  statusText.textContent = 'Done! 🎉';
  progressCircle.classList.add('complete');
  
  // Play alarm sound
  playAlarm();
  
  // Send notification to main process
  if (window.electron && window.electron.notifyTimerComplete) {
    window.electron.notifyTimerComplete(selectedEggType);
  }
  
  // Flash the window title
  flashTitle();
}

// Update time display
function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timeDisplay.textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update progress circle
function updateProgress() {
  if (!selectedTime) return;
  
  const progress = (selectedTime - timeLeft) / selectedTime;
  const offset = circumference - (progress * circumference);
  progressCircle.style.strokeDashoffset = offset;
}

// Play alarm sound
function playAlarm() {
  // Try to play the audio file
  alarmSound.play().catch(() => {
    // If audio file doesn't exist, use a simple beep
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  });
}

// Flash window title
function flashTitle() {
  let count = 0;
  const originalTitle = document.title;
  
  const flashInterval = setInterval(() => {
    document.title = count % 2 === 0 ? '🥚 Eggs Ready!' : originalTitle;
    count++;
    
    if (count > 10) {
      clearInterval(flashInterval);
      document.title = originalTitle;
    }
  }, 500);
}

// Initialize display
updateDisplay();
