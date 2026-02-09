# How to Code an Egg Timer Electron App - Complete Tutorial

## Table of Contents
1. [What is Electron?](#what-is-electron)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Code Breakdown](#code-breakdown)
4. [Key Concepts Explained](#key-concepts-explained)
5. [Common Patterns](#common-patterns)

---

## What is Electron?

Electron lets you build desktop apps using web technologies (HTML, CSS, JavaScript). Apps like VS Code, Slack, and Discord are built with Electron!

**Think of it like this:**
- Your HTML/CSS/JS = The web page
- Electron = The browser that runs it
- Node.js = Backend powers (file system, notifications, etc.)

---

## Understanding the Architecture

Electron has **TWO** separate processes:

### 1. Main Process (main.js)
- **One per app**
- Runs Node.js
- Creates windows
- Handles system-level stuff (notifications, menus, files)
- Like the "backend" server

### 2. Renderer Process (renderer.js + HTML)
- **One per window**
- Runs your HTML/CSS/JS
- Like a web page in a browser
- Cannot directly access Node.js (for security)

### 3. Preload Script (preload.js)
- **Security bridge** between main and renderer
- Exposes only specific functions
- Prevents malicious code from accessing your computer

```
┌─────────────────────────────────────┐
│      MAIN PROCESS (main.js)         │
│  - Node.js access                   │
│  - Create windows                   │
│  - System notifications             │
└──────────────┬──────────────────────┘
               │
               │ IPC Communication
               │ (Inter-Process)
               │
┌──────────────┴──────────────────────┐
│   PRELOAD (preload.js)              │
│   - Security bridge                 │
│   - Exposes safe functions          │
└──────────────┬──────────────────────┘
               │
               │
┌──────────────┴──────────────────────┐
│   RENDERER (renderer.js + HTML)     │
│   - Your app UI                     │
│   - Timer logic                     │
│   - User interactions               │
└─────────────────────────────────────┘
```

---

## Code Breakdown

### 1. Main Process (main.js)

#### Creating a Window
```javascript
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 650,
    webPreferences: {
      nodeIntegration: false,      // Security: disable direct Node.js
      contextIsolation: true,       // Security: isolate contexts
      preload: path.join(__dirname, 'preload.js')  // Load bridge
    }
  });

  mainWindow.loadFile('index.html');  // Load your HTML
}

app.whenReady().then(createWindow);
```

**What this does:**
1. Creates a 400x650 pixel window
2. Loads preload.js for secure communication
3. Loads index.html as the content
4. Waits for Electron to be ready before creating window

#### Handling Notifications
```javascript
const { Notification } = require('electron');

ipcMain.on('timer-complete', (event, eggType) => {
  const notification = new Notification({
    title: '🥚 Egg Timer Complete!',
    body: `Your ${eggType} eggs are ready!`
  });
  
  notification.show();
});
```

**What this does:**
1. Listens for 'timer-complete' message from renderer
2. Creates a system notification
3. Shows it to the user

---

### 2. Preload Script (preload.js)

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  notifyTimerComplete: (eggType) => {
    ipcRenderer.send('timer-complete', eggType);
  }
});
```

**What this does:**
1. Creates a `window.electron` object in the renderer
2. Only exposes the `notifyTimerComplete` function
3. When called, sends a message to main process
4. Renderer can call: `window.electron.notifyTimerComplete('Soft Boiled')`

**Why we need this:**
- **Security**: Renderer can't access all of Node.js
- **Controlled**: Only specific functions are exposed
- **Safe**: Prevents malicious code from harming your computer

---

### 3. Timer Logic (renderer.js)

#### State Management
```javascript
let selectedTime = null;  // Total time selected (e.g., 180 seconds)
let timeLeft = 0;         // Time remaining
let isRunning = false;    // Is timer currently counting?
let timerInterval = null; // Reference to setInterval
```

**Why we need state:**
- Track what's happening with the timer
- Know when to update the UI
- Control the countdown

#### The Countdown Mechanism
```javascript
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;              // Subtract 1 second
    updateDisplay();         // Update the time shown
    updateProgress();        // Update the circle
    
    if (timeLeft <= 0) {
      completeTimer();       // Timer finished!
    }
  }, 1000);                  // Run every 1000 milliseconds (1 second)
}
```

**How setInterval works:**
```javascript
setInterval(function, delay)
```
- Runs `function` repeatedly
- Waits `delay` milliseconds between each run
- Returns an ID you can use to stop it

**To stop the timer:**
```javascript
clearInterval(timerInterval);
```

#### Updating the Display
```javascript
function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);  // Get minutes
  const seconds = timeLeft % 60;              // Get remaining seconds
  
  // Format: "05:30"
  timeDisplay.textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
```

**Math breakdown:**
- `Math.floor(180 / 60)` = 3 minutes
- `180 % 60` = 0 seconds
- `padStart(2, '0')` turns "5" into "05"

#### Progress Circle Animation
```javascript
function updateProgress() {
  const progress = (selectedTime - timeLeft) / selectedTime;
  const circumference = 2 * Math.PI * 110;  // Circle circumference
  const offset = circumference - (progress * circumference);
  
  progressCircle.style.strokeDashoffset = offset;
}
```

**How SVG circles work:**
- `stroke-dasharray`: Length of dash pattern
- `stroke-dashoffset`: How much to offset the dash
- Animating offset creates the progress effect

**Example:**
- Circumference = 691
- Start: offset = 691 (circle is empty)
- 50% done: offset = 345.5 (half filled)
- 100% done: offset = 0 (fully filled)

---

## Key Concepts Explained

### 1. Event Listeners

```javascript
button.addEventListener('click', () => {
  // Code runs when button is clicked
});
```

**Common events:**
- `click` - User clicks element
- `input` - User types in input field
- `change` - Select box changes
- `submit` - Form is submitted

### 2. DOM Manipulation

```javascript
// Get element
const element = document.getElementById('my-id');

// Change text
element.textContent = 'New text';

// Change style
element.style.color = 'red';

// Add/remove class
element.classList.add('active');
element.classList.remove('inactive');
```

### 3. Arrow Functions

```javascript
// Old way
function myFunction() {
  return 'hello';
}

// New way (arrow function)
const myFunction = () => {
  return 'hello';
};

// Even shorter (implicit return)
const myFunction = () => 'hello';
```

### 4. Template Literals

```javascript
// Old way
const message = 'Hello, ' + name + '! You have ' + count + ' eggs.';

// New way (template literals)
const message = `Hello, ${name}! You have ${count} eggs.`;
```

### 5. Ternary Operator

```javascript
// Old way
let message;
if (isRunning) {
  message = 'Pause';
} else {
  message = 'Start';
}

// New way (ternary)
const message = isRunning ? 'Pause' : 'Start';
```

---

## Common Patterns

### Pattern 1: Toggle State
```javascript
let isRunning = false;

function toggle() {
  isRunning = !isRunning;  // Flip between true/false
  
  if (isRunning) {
    startTimer();
  } else {
    pauseTimer();
  }
}
```

### Pattern 2: Data Attributes
```html
<button data-time="180" data-name="Soft Boiled">
  Soft Boiled
</button>
```

```javascript
button.addEventListener('click', (e) => {
  const time = e.target.dataset.time;  // Gets "180"
  const name = e.target.dataset.name;  // Gets "Soft Boiled"
});
```

### Pattern 3: Disable/Enable Buttons
```javascript
// Disable button
button.disabled = true;
button.classList.add('disabled');

// Enable button
button.disabled = false;
button.classList.remove('disabled');
```

### Pattern 4: Audio Playback
```javascript
const audio = new Audio('sound.mp3');
audio.play();  // Play sound

// OR use HTML audio element
const audio = document.getElementById('my-audio');
audio.play();
```

---

## How to Extend This App

### Add Custom Time Input
```javascript
// Add to HTML
<input type="number" id="custom-minutes" placeholder="Minutes">
<button id="set-custom">Set Custom Time</button>

// Add to renderer.js
document.getElementById('set-custom').addEventListener('click', () => {
  const minutes = document.getElementById('custom-minutes').value;
  selectedTime = minutes * 60;
  timeLeft = selectedTime;
  updateDisplay();
});
```

### Add Dark Mode
```javascript
// Add toggle button
<button id="theme-toggle">🌙 Dark Mode</button>

// Add to renderer.js
let isDark = false;

document.getElementById('theme-toggle').addEventListener('click', () => {
  isDark = !isDark;
  document.body.classList.toggle('dark-mode');
});

// Add to styles.css
body.dark-mode {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: white;
}
```

### Save Preferences
```javascript
// Save to localStorage
function savePreferences() {
  localStorage.setItem('favoriteEggType', selectedEggType);
  localStorage.setItem('volume', audioVolume);
}

// Load on startup
function loadPreferences() {
  const favorite = localStorage.getItem('favoriteEggType');
  const volume = localStorage.getItem('volume');
  
  if (favorite) {
    selectEggType(favorite);
  }
}

// Call on app start
window.addEventListener('DOMContentLoaded', loadPreferences);
```

---

## Debugging Tips

### Console Logging
```javascript
console.log('Time left:', timeLeft);
console.log('Is running?', isRunning);
console.log('Selected time:', selectedTime);
```

### Open DevTools
In main.js, uncomment:
```javascript
mainWindow.webContents.openDevTools();
```

### Common Errors

**Error: "require is not defined"**
- Trying to use `require()` in renderer
- Solution: Use preload.js

**Error: "Cannot read property of null"**
- Element doesn't exist yet
- Solution: Wait for DOM to load
```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Your code here
});
```

**Timer not updating**
- Check if `setInterval` is being cleared
- Check if `updateDisplay()` is being called

---

## Next Learning Steps

1. **Learn more JavaScript:**
   - Promises and async/await
   - ES6+ features
   - Array methods (map, filter, reduce)

2. **Explore Electron APIs:**
   - Menu and Tray
   - Dialog boxes
   - File system access
   - Auto-updater

3. **Try adding features:**
   - Multiple simultaneous timers
   - Timer history/statistics
   - Different sound options
   - Keyboard shortcuts

4. **Learn about packaging:**
   - Code signing
   - Auto-updates
   - Installers for different platforms

---

## Resources

- **Electron Docs**: https://electronjs.org/docs
- **JavaScript Basics**: https://javascript.info
- **MDN Web Docs**: https://developer.mozilla.org
- **Node.js Docs**: https://nodejs.org/docs

Happy coding! 🥚⏱️
