const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#343541', // Темный фон при загрузке
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Чтобы проще было работать с запросами
    },
    autoHideMenuBar: true // Убираем стандартное меню сверху
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
