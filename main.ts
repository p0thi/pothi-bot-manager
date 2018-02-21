import { app, BrowserWindow, screen, Menu, ipcMain, globalShortcut } from 'electron';
import * as path from 'path';
const nodeUrl = require('url');
const store = require('electron-settings');
const request = require('request-promise');
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWindow, serve, authWindow;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');
import * as url from 'url';

if (serve) {
  require('electron-reload')(__dirname, {
  });
}

ipcMain.on('discord-oauth', () => {
  auth();
});
ipcMain.on('check-login-status', (event) => {
  verifyToken(authenticated => {
    event.sender.send('login-status', authenticated);
  })
});

ipcMain.on('register-hotkey', (event, data) => {
  const modifiedReferenceSet = new Set([
    'Cmd',
    'Ctrl',
    'CmdOrCtrl',
    'Alt',
    'Option',
    'AltGr',
    'Shift',
    'Super'
  ]);
  const modifiers = new Set();
  const keyCodes = new Set();
  if (data.automated) {
    const settings = store.get('hotkeys.' + data.command);
    if (settings) {
      console.log(settings);
      data.names = settings.names;
      data.keys = settings.keys;
    } else {
      return;
    }
  }
  for (let i = 0; i < data.names.length; i++) {
    if (modifiedReferenceSet.has(data.names[i])) {
      modifiers.add(data.names[i]);
    } else {
      keyCodes.add(data.names[i]);
    }
  }
  if (modifiers.size < 1) {
    data.error = 'You must have at least one modifiers (Cmd, Alt, Shift...).<br> <strong>Maybe duplicate hotkey?</strong>';
    event.sender.send('register-hotkey-response-' + data.command, data);
    return;
  }
  if (keyCodes.size < 1) {
    data.error = 'You must have at least one additional key (like letters, numbers...).<br> <strong>Maybe duplicate hotkey?</strong>';
    event.sender.send('register-hotkey-response-' + data.command, data);
    return;
  }

  const shortcutString = Array.from(modifiers).join('+') + '+' + Array.from(keyCodes).join('+');
  if (globalShortcut.isRegistered(shortcutString) && !data.automated) {
    data.error = 'This shortcut is already used.';
    event.sender.send('register-hotkey-response-' + data.command, data);
  } else {
    data.accelerator = shortcutString;
    globalShortcut.register(shortcutString, () => {
      event.sender.send('shortcut-called-' + data.command, data);
    });
    store.set('hotkeys.' + data.command, {
      keys: data.keys,
      names: data.names
    });
    event.sender.send('register-hotkey-response-' + data.command, data);
  }

});

ipcMain.on('unregister-hotkey', (event, data) => {
  console.log(data);
  if (!data || !data.names || !data.command) {
    event.sender.send('unregister-hotkey-response', {error: 'Hotkey not set.'});
    return;
  }
  const accelerator = data.names.join('+');
  if (globalShortcut.isRegistered(accelerator)) {
    globalShortcut.unregister(accelerator);
    store.delete('hotkeys.' + data.command);
    event.sender.send('unregister-hotkey-response-' + data.command, data);
  } else {
    data.error = 'Hotkey not set.';
    event.sender.send('unregister-hotkey-response-' + data.command, data);
  }
});

ipcMain.on('logout', (event) => {
  store.delete('token');
  event.sender.send('logout');
});

function createWindow() {

  const electronScreen = screen;
  // const size = electronScreen.getPrimaryDisplay().workAreaSize;
  const size = {
    width: 1200,
    height: 900
  };

  // Create the browser window.
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      x: 0,
      y: 0,
      width: size.width,
      height: size.height
    });
  }

  globalShortcut.unregisterAll();

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    protocol: 'file:',
    pathname: path.join(__dirname, '/index.html'),
    slashes:  true
  }));

  // Open the DevTools.
  if (serve) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

try {
  app.on('ready', () => {
    autoUpdater.checkForUpdates();
    createWindow();
  });

  autoUpdater.on('checking-for-update', () => {
    console.log('checking for updates');
  });
  autoUpdater.on('update-available', (info) => {
    console.log('update available');
    mainWindow.webContents.send('update', {message: 'update'});
  });
  autoUpdater.on('update-not-available', (info) => {
    console.log('no update available');

    // mainWindow.webContents.send('update', {message: 'update'});
    // mainWindow.webContents.send('update', {message: 'progress', progress: {
    //     percent: 50,
    //     bytesPerSecond: 2000000
    //   }});
  });
  autoUpdater.on('error', (err) => {
    console.log('update error');
    console.error(err);
  });
  autoUpdater.on('download-progress', (progressObj) => {
    console.log('update progress: ' + progressObj.percent);
    mainWindow.webContents.send('update', {message: 'progress', progress: progressObj});
  });
  autoUpdater.on('update-downloaded', (info) => {
    console.log('update downloaded');
    mainWindow.webContents.send('update', {message: 'done'});
    autoUpdater.quitAndInstall(true, true);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

function auth() {

    const uri = 'https://discordapp.com/oauth2/authorize' +
      '?response_type=code&client_id=185542328218288128' +
      '&redirect_uri=http://localhost/callback&scope=email%20identify&state=baum';
    authWindow = new BrowserWindow({
      width: 500,
      height: 800,
      show: false,
      webPreferences: {
        nodeIntegration : false,
        webSecurity: false
      }
    });

    authWindow.webContents.loadURL(uri);

    authWindow.show();
    authWindow.webContents.on('did-stop-loading', (event, oldURL, newURL, isMainFrame) => {
    });

    function onCallback(callUrl: string) {
      authWindow.on('closed', () => {
        authWindow = null;
      });
      setImmediate(() => {
        authWindow.close();
      });
      const urlParts = nodeUrl.parse(callUrl, true);
      const query = urlParts.query;
      const code = query.code;
      const error = query.error;

      if (error !== undefined) {
        console.log('Error occurred.', error);
      } else if (code) {
        const options = {
          url: 'http://bot.glowtrap.de:3232/auth',
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: {
            code: code,
            clientId: '185542328218288128',
            redirectUri: 'http://localhost/callback',
            responseType: 'code',
            scope: ['email', 'identify'],
          }
        };
        call(options, (err, res) => {
          if (err) {
            if (err.error === 401) {
              createWindow();
              return;
            }
          }
          console.log(res);
          store.set('token', res.token);
          createWindow();
        });
      }
    }

    authWindow.webContents.on('will-navigate', (event, targetUrl) => {
      console.log('authWindow will navigate.');
      onCallback(targetUrl);
    });

}

function verifyToken(callback) {
  call({
    url: 'http://bot.glowtrap.de:3232/verify_token',
    headers: {
      Authorization: 'Basic ' + store.get('token')
    }
  }, (err, body) => {
    if (err) {
      callback(false);
    } else if (body.status === 'ok') {
      callback(true);
    } else {
      callback(false);
    }
  });
}


function call(options, callback) {
  if (!options.headers) {
    options.headers = {};
  }
  const token = store.get('token');
  if (token) {
    options.headers.Authorization = 'Basic ' + store.get('token');
  }
  options.json = true;

  request(options)
    .then(body => {
      console.log(body);
      callback(undefined, body);
    })
    .catch(err => {
      callback(err, undefined);
    });
}
