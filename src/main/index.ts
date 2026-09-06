import { app, BrowserWindow, shell, ipcMain, session } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import {
  initDb,
  getAllEvents, createEvent, updateEvent, deleteEvent,
  getAllTasks, createTask, updateTask, deleteTask,
  getAllGoals, createGoal, updateGoal, deleteGoal
} from './db'
import { resetAllData } from './backup'

const RELEASES_URL = 'https://github.com/Julienlgn123/plan-studio/releases/latest'

let mainWindow: BrowserWindow

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 860,
    minHeight: 560,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d0d0f',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { /* mainWindow is reassigned on next createWindow() */ })
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.plan-studio.app')
  app.on('browser-window-created', (_, w) => optimizer.watchWindowShortcuts(w))

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = is.dev
      ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: ws://localhost:* http://localhost:*; " +
        'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src https://fonts.gstatic.com data:; ' +
        "img-src 'self' data: http://localhost:*"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'"
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    })
  })

  initDb()
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  if (app.isPackaged) {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('update-available', (info) => {
      mainWindow.webContents.send('update:available', { version: info.version })
    })
    autoUpdater.on('update-not-available', () => {
      mainWindow.webContents.send('update:not-available')
    })
    autoUpdater.on('download-progress', (progress) => {
      mainWindow.webContents.send('update:progress', Math.round(progress.percent))
    })
    autoUpdater.on('update-downloaded', () => {
      mainWindow.webContents.send('update:downloaded')
    })
    autoUpdater.on('error', (err) => {
      mainWindow.webContents.send('update:error', err.message)
    })

    let checked = false
    ipcMain.on('renderer:ready', () => {
      if (checked) return
      checked = true
      autoUpdater.checkForUpdates().catch(() => null)
    })
    setTimeout(() => {
      if (!checked) {
        checked = true
        autoUpdater.checkForUpdates().catch(() => null)
      }
    }, 8000)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

function registerIpc(): void {
  ipcMain.handle('window:minimize', () => mainWindow.minimize())
  ipcMain.handle('window:maximize', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
  })
  ipcMain.handle('window:close', () => mainWindow.close())

  ipcMain.handle('events:get', () => getAllEvents())
  ipcMain.handle('events:create', (_, d) => createEvent(d))
  ipcMain.handle('events:update', (_, id, d) => { updateEvent(id, d); return true })
  ipcMain.handle('events:delete', (_, id) => { deleteEvent(id); return true })

  ipcMain.handle('tasks:get', () => getAllTasks())
  ipcMain.handle('tasks:create', (_, d) => createTask(d))
  ipcMain.handle('tasks:update', (_, id, d) => { updateTask(id, d); return true })
  ipcMain.handle('tasks:delete', (_, id) => { deleteTask(id); return true })

  ipcMain.handle('goals:get', () => getAllGoals())
  ipcMain.handle('goals:create', (_, d) => createGoal(d))
  ipcMain.handle('goals:update', (_, id, d) => { updateGoal(id, d); return true })
  ipcMain.handle('goals:delete', (_, id) => { deleteGoal(id); return true })

  const settingsPath = join(app.getPath('userData'), 'settings.json')
  ipcMain.handle('settings:get', () => {
    try { return JSON.parse(readFileSync(settingsPath, 'utf-8')) } catch { return {} }
  })
  ipcMain.handle('settings:set', (_, d) => {
    writeFileSync(settingsPath, JSON.stringify(d, null, 2))
    return true
  })

  ipcMain.handle('backup:resetAll', () => resetAllData(mainWindow))

  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('update:check', () => { if (app.isPackaged) autoUpdater.checkForUpdates() })
  ipcMain.handle('update:download', () => {
    // macOS: ad-hoc signed builds fail Squirrel's signature check, so never try
    // to self-apply — send people to the Releases page for a manual download.
    if (process.platform === 'darwin') { shell.openExternal(RELEASES_URL); return }
    if (app.isPackaged) autoUpdater.downloadUpdate()
  })
  ipcMain.handle('update:install', () => {
    if (app.isPackaged && process.platform !== 'darwin') autoUpdater.quitAndInstall(false, true)
  })
  ipcMain.handle('update:openReleases', () => { shell.openExternal(RELEASES_URL); return true })
}
