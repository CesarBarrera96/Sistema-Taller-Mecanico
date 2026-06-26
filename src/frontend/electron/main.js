const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let mainWindow;
let backendProcess;

const BACKEND_PORT = 5118;

function getBackendPath() {
  return path.join(process.resourcesPath, 'backend', 'TallerMecanico.API.exe');
}

function getBackendCwd() {
  return path.join(process.resourcesPath, 'backend');
}

function startBackend() {
  const isDev = !app.isPackaged;

  let exePath, cwd;

  if (isDev) {
    exePath = path.join(__dirname, 'backend', 'TallerMecanico.API.exe');
    cwd = path.join(__dirname, 'backend');
  } else {
    exePath = getBackendPath();
    cwd = getBackendCwd();
  }

  backendProcess = spawn(exePath, [
    '--urls', `http://localhost:${BACKEND_PORT}`
  ], {
    cwd: cwd,
    stdio: 'pipe',
    env: {
      ...process.env,
      ASPNETCORE_ENVIRONMENT: 'Production',
      ASPNETCORE_URLS: `http://localhost:${BACKEND_PORT}`
    }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend] ${data.toString().trim()}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`[Backend] Process exited with code ${code}`);
  });
}

function waitForBackend(retries = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get(`http://localhost:${BACKEND_PORT}/api/auth/login`, (res) => {
        resolve();
      });
      req.on('error', () => {
        if (attempts < retries) {
          setTimeout(check, 1000);
        } else {
          reject(new Error('Backend no respondio despues de 30 segundos'));
        }
      });
      req.setTimeout(2000, () => {
        req.destroy();
        if (attempts < retries) {
          setTimeout(check, 1000);
        } else {
          reject(new Error('Backend no respondio despues de 30 segundos'));
        }
      });
    };
    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    icon: path.join(__dirname, 'taller-icon.ico'),
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const indexPath = path.join(__dirname, '..', 'dist', 'frontend', 'browser', 'index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.setMenu(null);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  startBackend();

  try {
    await waitForBackend();
    console.log('[Electron] Backend listo, cargando app...');
  } catch (err) {
    console.error('[Electron]', err.message);
  }

  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
