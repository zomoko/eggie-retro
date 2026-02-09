const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 400,
    height: 650,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#FFF7ED',
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools in development (comment out for production)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS, re-create a window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle timer completion notification
ipcMain.on('timer-complete', (event, eggType) => {
  // Show system notification
  const notification = new Notification({
    title: '🥚 Egg Timer Complete!',
    body: `Your ${eggType} eggs are ready!`,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    sound: true
  });

  notification.show();

  // Flash the taskbar/dock icon
  if (mainWindow && !mainWindow.isFocused()) {
    mainWindow.flashFrame(true);
  }

  // Bring window to front
  if (mainWindow) {
    mainWindow.show();
  }
});

// Handle minimize to tray (optional feature)
ipcMain.on('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});
