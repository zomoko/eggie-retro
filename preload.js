const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Send timer complete notification to main process
  notifyTimerComplete: (eggType) => {
    ipcRenderer.send('timer-complete', eggType);
  },
  
  // Minimize to tray
  minimizeToTray: () => {
    ipcRenderer.send('minimize-to-tray');
  }
});
