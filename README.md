# 🥚 Egg Timer - Electron Desktop App

A beautiful desktop egg timer application built with Electron and Node.js.

## Features

- ✨ Three preset timers: Soft Boiled (3 min), Medium Boiled (7 min), Hard Boiled (10 min)
- ⏱️ Visual countdown with circular progress indicator
- 🔔 Desktop notifications when timer completes
- 🎵 Audio alarm
- ⏯️ Start, Pause, and Reset controls
- 💻 Cross-platform (Windows, macOS, Linux)

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Go to https://nodejs.org/
2. Download the LTS (Long Term Support) version
3. Install it on your computer

### Step 2: Install Dependencies
Open terminal/command prompt in the project folder and run:

```bash
npm install
```

This will install Electron and all required dependencies.

### Step 3: Run the App
```bash
npm start
```

The egg timer application will open in a new window!

## Project Structure

```
egg-timer-app/
├── main.js          # Main Electron process (backend)
├── preload.js       # Security bridge between main and renderer
├── renderer.js      # Timer logic (frontend JavaScript)
├── index.html       # App UI structure
├── styles.css       # App styling
├── package.json     # Project configuration and dependencies
├── assets/          # Images and sounds
│   ├── icon.png     # App icon
│   └── alarm.mp3    # Alarm sound (optional)
└── README.md        # This file
```

## How It Works - Learning Guide

### 1. **main.js - The Main Process**
This is the "backend" of your Electron app. It:
- Creates the application window
- Handles system notifications
- Manages the app lifecycle (open, close, minimize)

**Key concepts:**
```javascript
// Creating a window
const window = new BrowserWindow({
  width: 400,
  height: 650,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js')
  }
});

// Loading your HTML file
window.loadFile('index.html');
```

### 2. **preload.js - The Security Bridge**
Electron uses this to safely connect the frontend (HTML/JS) with the backend (Node.js).

**Why we need it:**
- Security: Prevents malicious code from accessing Node.js
- Communication: Allows safe message passing between processes

**Key concepts:**
```javascript
// Expose specific functions to the frontend
contextBridge.exposeInMainWorld('electron', {
  notifyTimerComplete: (eggType) => {
    ipcRenderer.send('timer-complete', eggType);
  }
});
```

### 3. **index.html - The User Interface**
Standard HTML that defines what the user sees:
- Timer display with SVG progress circle
- Buttons for controls
- Egg type selection buttons

### 4. **styles.css - The Styling**
Makes the app look beautiful with:
- Gradient backgrounds
- Circular progress animation
- Button hover effects
- Responsive layout

**Key concepts:**
```css
/* Animated progress circle */
.progress-ring-circle {
  stroke-dasharray: 691;
  stroke-dashoffset: 691;
  transition: stroke-dashoffset 1s linear;
}
```

### 5. **renderer.js - The Timer Logic**
This is where the magic happens! It handles:

**Timer State Management:**
```javascript
let selectedTime = null;  // Total time in seconds
let timeLeft = 0;         // Remaining time
let isRunning = false;    // Is timer running?
```

**Timer Countdown:**
```javascript
setInterval(() => {
  timeLeft--;              // Decrease by 1 second
  updateDisplay();         // Update the clock display
  updateProgress();        // Update the circular progress
}, 1000);                  // Run every 1000ms (1 second)
```

**Progress Circle Math:**
```javascript
// Calculate how much of the circle to fill
const progress = (selectedTime - timeLeft) / selectedTime;
const circumference = 2 * Math.PI * radius;
const offset = circumference - (progress * circumference);
```

## Building a Distributable App

To create an executable file you can share:

### Windows
```bash
npm run package-win
```
Creates a `.exe` installer in the `dist` folder.

### macOS
```bash
npm run package-mac
```
Creates a `.dmg` file in the `dist` folder.

### Linux
```bash
npm run package-linux
```
Creates an `.AppImage` file in the `dist` folder.

## Customization Ideas

Want to make this app your own? Try:

1. **Add more timer presets** (soft-medium, super hard-boiled)
2. **Custom timer input** - let users enter any time
3. **Different themes** - dark mode, colorful themes
4. **Sound options** - different alarm sounds
5. **History tracking** - save what timers you've used
6. **Multiple timers** - run several timers at once

## Learning Resources

### Electron Basics
- Official Docs: https://www.electronjs.org/docs/latest/
- Tutorial: https://www.electronjs.org/docs/latest/tutorial/tutorial-prerequisites

### JavaScript Timer Concepts
- `setInterval()` - runs code repeatedly
- `setTimeout()` - runs code once after delay
- `clearInterval()` - stops a repeating timer

### Key Electron Concepts You Learned

1. **Main Process vs Renderer Process**
   - Main = Backend (Node.js)
   - Renderer = Frontend (HTML/CSS/JS)

2. **IPC (Inter-Process Communication)**
   - How main and renderer talk to each other
   - Uses `ipcMain` and `ipcRenderer`

3. **Context Isolation**
   - Security feature
   - Uses preload scripts to expose only what's needed

4. **Native Features**
   - Desktop notifications
   - System tray
   - Window management

## Troubleshooting

### App won't start
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

### No notifications showing
- Check your system notification settings
- Make sure notifications are enabled for the app

### Sound not playing
- Add your own `alarm.mp3` file in the `assets/` folder
- Or the app will use a generated beep sound

## Next Steps

1. **Learn more JavaScript** - the timer logic uses core JS concepts
2. **Explore Electron APIs** - try adding system tray, menus
3. **Add features** - make it your own!
4. **Build and share** - package it and give it to friends

## License

MIT - feel free to use this code to learn and build your own apps!

---

Made with ❤️ for learning Electron and Node.js
