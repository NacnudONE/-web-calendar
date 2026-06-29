import { app, BrowserWindow, shell, dialog, ipcMain, Menu } from 'electron'
import { autoUpdater } from 'electron-updater'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { createReadStream, existsSync, statSync } from 'fs'
import { fileURLToPath } from 'url'
import { randomBytes } from 'crypto'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

// Фікс: пробіли в шляху до проєкту ламають Chromium cache/IndexedDB
app.setPath('userData', path.join(app.getPath('appData'), 'WebCalendar'))

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

const GOOGLE_CLIENT_ID = '24517293402-brc7tmtemhrsdgrnmf22vgmea9i9h13b.apps.googleusercontent.com'
const AUTH_CALLBACK_PORT = 47384

function startFileServer(distPath: string): Promise<number> {
  return new Promise((resolve) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = req.url === '/' ? '/index.html' : req.url!
      let filePath = path.join(distPath, url.split('?')[0])

      if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
        filePath = path.join(distPath, 'index.html')
      }

      const ext = path.extname(filePath)
      res.setHeader('Content-Type', MIME_TYPES[ext] ?? 'application/octet-stream')
      createReadStream(filePath).pipe(res)
    })

    server.listen(0, '127.0.0.1', () => {
      resolve((server.address() as { port: number }).port)
    })
  })
}

function startGoogleAuth(): Promise<{ idToken: string; accessToken: string }> {
  return new Promise((resolve, reject) => {
    const nonce = randomBytes(16).toString('hex')

    const callbackHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>WebCalendar — Авторизація</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f0f4f8;}
.card{text-align:center;padding:40px;background:white;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.1);}</style>
</head>
<body>
<div class="card" id="msg"><p>Обробка авторизації…</p></div>
<script>
const hash = window.location.hash.slice(1);
const params = new URLSearchParams(hash);
const idToken = params.get('id_token');
const accessToken = params.get('access_token');
if (idToken && accessToken) {
  fetch('/callback', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({idToken, accessToken})
  }).then(() => {
    document.getElementById('msg').innerHTML =
      '<h2 style="color:#22c55e">✓ Авторизацію виконано!</h2><p>Це вікно можна закрити.</p>';
  }).catch(() => {
    document.getElementById('msg').innerHTML = '<h2 style="color:#ef4444">Помилка. Спробуйте ще раз.</h2>';
  });
} else {
  document.getElementById('msg').innerHTML = '<h2 style="color:#ef4444">Токен не отримано.</h2>';
}
</script>
</body>
</html>`

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      if (req.method === 'POST' && req.url === '/callback') {
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const { idToken, accessToken } = JSON.parse(body)
            res.writeHead(200)
            res.end('OK')
            server.close()
            resolve({ idToken, accessToken })
          } catch {
            res.writeHead(400)
            res.end('Bad Request')
            reject(new Error('Invalid callback data'))
          }
        })
      } else {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.writeHead(200)
        res.end(callbackHtml)
      }
    })

    server.listen(AUTH_CALLBACK_PORT, '127.0.0.1', () => {
      const authUrl = new URL('https://accounts.google.com/o/oauth2/auth')
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
      authUrl.searchParams.set('redirect_uri', `http://localhost:${AUTH_CALLBACK_PORT}`)
      authUrl.searchParams.set('response_type', 'id_token token')
      authUrl.searchParams.set('scope', 'openid email profile')
      authUrl.searchParams.set('nonce', nonce)

      shell.openExternal(authUrl.toString())
    })

    server.on('error', (err) => {
      reject(err)
    })

    // Таймаут 5 хвилин
    setTimeout(() => {
      server.close()
      reject(new Error('Auth timeout'))
    }, 5 * 60 * 1000)
  })
}

function setupAutoUpdater() {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Оновлення готове',
      message: 'Нову версію завантажено. Перезапустити застосунок зараз?',
      buttons: ['Перезапустити', 'Пізніше'],
      defaultId: 0,
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err.message)
  })

  autoUpdater.checkForUpdates()
}

function createWindow(appUrl: string) {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'WebCalendar',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.loadURL(appUrl)

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('firebaseapp.com') || url.includes('accounts.google.com')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500,
          height: 650,
          resizable: false,
          title: 'Вхід через Google',
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            partition: 'persist:google-auth', // Запам'ятовує сесію між запусками
          },
        },
      }
    }
    if (url.startsWith('https:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })
}

ipcMain.handle('google-sign-in', () => startGoogleAuth())

Menu.setApplicationMenu(null)

app.whenReady().then(async () => {
  let appUrl: string

  if (VITE_DEV_SERVER_URL) {
    appUrl = VITE_DEV_SERVER_URL
  } else {
    const distPath = path.join(__dirname, '../dist')
    const port = await startFileServer(distPath)
    appUrl = `http://localhost:${port}`
  }

  createWindow(appUrl)

  if (app.isPackaged) {
    setupAutoUpdater()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(appUrl)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
