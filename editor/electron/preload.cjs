
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    createProject: (path) => ipcRenderer.invoke('project:create', path),
    loadJsonFile: (filePath) => ipcRenderer.invoke('project:load-json-file', filePath),
    loadTextFile: (filePath) => ipcRenderer.invoke('project:load-file', filePath)
});