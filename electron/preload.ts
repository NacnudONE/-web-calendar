import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  googleSignIn: () => ipcRenderer.invoke('google-sign-in'),
})
