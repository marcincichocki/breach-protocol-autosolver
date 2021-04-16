const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
  
  globalShortcut.register('CommandOrControl + A', () => {
    console.log('Electron loves global shortcuts!')
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')  {
    app.quit()
  }
})