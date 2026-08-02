
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    createProject: (path) => ipcRenderer.invoke('project:create', path),
    loadJsonFile: (filePath) => ipcRenderer.invoke('project:load-json-file', filePath),
    saveJsonFile: (filePath, dataObject) => ipcRenderer.invoke('project:save-json-file', filePath, dataObject),
    loadTextFile: (filePath) => ipcRenderer.invoke('project:load-file', filePath),
    loadBinaryFile: (filePath) => ipcRenderer.invoke('project:load-binary-file', filePath),
    createDirectory: (dirPath) => ipcRenderer.invoke('create-directory', dirPath),
    openDirectory: () => ipcRenderer.invoke('dialog:open-directory'),
    saveTextFile: (filePath, content) => ipcRenderer.invoke('save-text-file', filePath, content),
    copyFile: (sourcePath, destinationPath) => ipcRenderer.invoke('copy-file', sourcePath, destinationPath),
    directoryExists: (dirPath) => ipcRenderer.invoke('dir-exists', dirPath),
    fileExists: (filePath) => ipcRenderer.invoke('file-exists', filePath),
    quit: () => ipcRenderer.invoke('app:quit'),
});