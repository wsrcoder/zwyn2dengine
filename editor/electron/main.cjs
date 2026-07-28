
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Define se estamos em modo de desenvolvimento (se não foi empacotado para produção)
const isDev = true;

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    // Remove completamente a barra de menu nativa do Windows/Linux/Mac
    win.setMenu(null);

    win.loadURL('http://localhost:5173');

    if (isDev) {
        // Abre automaticamente ou deixa pronto
        // win.webContents.openDevTools();

        // Atalho customizado global/da janela (ex: F12 para alternar o DevTools)
        win.webContents.on('before-input-event', (event, input) => {
            if (input.key === 'F12' && input.type === 'keyDown') {
                win.webContents.toggleDevTools();
                event.preventDefault();
            }
        });
    }
}

app.whenReady().then(createWindow);

// Escuta o comando do front-end para ler um arquivo do Tiled de qualquer lugar do disco
ipcMain.handle('project:load-json-file', async (event, absoluteFilePath) => {
    try {
        if (!fs.existsSync(absoluteFilePath)) {
            return { success: false, error: "Arquivo não encontrado no disco." };
        }
        
        const fileContent = fs.readFileSync(absoluteFilePath, 'utf-8');
        const rawJson = JSON.parse(fileContent);
        
        return { success: true, data: rawJson };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Escuta o comando do front-end para salvar um arquivo JSON no disco
ipcMain.handle('project:save-json-file', async (event, absoluteFilePath, dataObject) => {
    try {
        // Serializa o objeto para JSON formatado com 2 espaços de indentação
        const jsonString = JSON.stringify(dataObject, null, 2);
        
        // Salva o arquivo usando o módulo 'fs'
        fs.writeFileSync(absoluteFilePath, jsonString, 'utf-8');
        
        return { success: true };
    } catch (error) {
        console.error("[Electron] Erro ao salvar arquivo JSON:", error);
        return { success: false, error: error.message };
    }
});

// Escuta o comando do front-end para ler um arquivo XML de qualquer lugar do disco
ipcMain.handle('project:load-file', async (event, absoluteFilePath) => {
    try {
        if (!fs.existsSync(absoluteFilePath)) {
            return { success: false, error: "Arquivo não encontrado no disco." };
        }
        
        const fileContent = fs.readFileSync(absoluteFilePath, 'utf-8');
        
        return { success: true, data: fileContent };
    } catch (error) {
        console.error("Erro interno no fs.readFileSync:", error.message);
        return { success: false, error: error.message };
    }
});

// Exemplo de um "Superpoder" do Node: Criar a pasta do novo projeto de jogo!
ipcMain.handle('project:create', async (event, projectPath) => {
    try {
        // Exemplo: fs.mkdirSync cria a pasta e subpastas direto no disco do PC
        fs.mkdirSync(path.join(projectPath, 'assets'), { recursive: true });
        fs.mkdirSync(path.join(projectPath, 'maps'), { recursive: true });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Cria diretórios de forma recursiva (equivalente a mkdir -p)
ipcMain.handle('create-directory', async (event, dirPath) => {
    try {
        fs.mkdirSync(dirPath, { recursive: true });
        return { success: true };
    } catch (error) {
        console.error("[Electron] Erro ao criar diretório:", error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('dialog:open-directory', async () => {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (result.canceled) return null;
    return result.filePaths[0];
});

// Salva arquivos de texto/JSON no disco
ipcMain.handle('save-text-file', async (event, filePath, content) => {
    try {
        // Garante que o diretório pai existe antes de salvar
        const dirname = path.dirname(filePath);
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
        }

        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true };
    } catch (error) {
        console.error("[Electron] Erro ao salvar arquivo:", error);
        return { success: false, error: error.message };
    }
});

// Copia um arquivo de uma origem para um destino
ipcMain.handle('copy-file', async (event, sourcePath, destinationPath) => {
    try {
        // Garante que o diretório de destino existe antes de copiar
        const dirname = path.dirname(destinationPath);
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
        }

        fs.copyFileSync(sourcePath, destinationPath);
        return { success: true };
    } catch (error) {
        console.error("[Electron] Erro ao copiar arquivo:", error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('dir-exists', async (event, dirPath) => {
    try {
        return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
    } catch (error) {
        return false;
    }
});

ipcMain.handle('file-exists', async (event, filePath) => {
    try {
        return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
    } catch (error) {
        return false;
    }
});