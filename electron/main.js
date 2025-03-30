const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// 控制台颜色输出帮助函数
const logInfo = (msg) => console.log(`\x1b[34m[Electron]\x1b[0m ${msg}`);
const logError = (msg) => console.log(`\x1b[31m[Electron Error]\x1b[0m ${msg}`);

let mainWindow;

function createWindow() {
    logInfo('创建主窗口...');

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        frame: false, // For custom title bar
        backgroundColor: '#1a1a2e', // Dark background
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // 确定是否为开发环境
    const isDev = !app.isPackaged;
    logInfo(`运行模式: ${isDev ? '开发环境' : '生产环境'}`);

    if (isDev) {
        // 在开发模式中，尝试多种方式连接到开发服务器
        const VITE_DEV_SERVER_URL = 'http://localhost:3000/';
        logInfo(`尝试连接到开发服务器: ${VITE_DEV_SERVER_URL}`);

        mainWindow.loadURL(VITE_DEV_SERVER_URL)
            .then(() => {
                logInfo('成功连接到开发服务器');
                mainWindow.webContents.openDevTools();
            })
            .catch((error) => {
                logError(`连接开发服务器失败: ${error.message}`);

                // 尝试备用方法：直接加载index.html
                const indexPath = path.join(__dirname, '../index.html');
                if (fs.existsSync(indexPath)) {
                    logInfo(`尝试加载本地文件: ${indexPath}`);
                    mainWindow.loadFile(indexPath)
                        .catch(err => logError(`加载本地文件失败: ${err.message}`));
                } else {
                    logError(`找不到本地文件: ${indexPath}`);
                }
            });
    } else {
        // 在生产模式中，加载打包的文件
        const indexPath = path.join(__dirname, '../dist/index.html');
        logInfo(`加载生产环境文件: ${indexPath}`);
        mainWindow.loadFile(indexPath)
            .catch(err => logError(`加载生产环境文件失败: ${err.message}`));
    }

    // 处理窗口控制
    ipcMain.on('minimize-window', () => {
        mainWindow.minimize();
    });

    ipcMain.on('maximize-window', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('close-window', () => {
        mainWindow.close();
    });

    // 自定义文件操作
    ipcMain.handle('open-folder', async (event, folderPath) => {
        try {
            require('child_process').exec(`start "" "${folderPath}"`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 如果窗口创建失败，记录错误
    mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
        logError(`页面加载失败: ${errorDescription} (${errorCode})`);
    });
}

app.whenReady().then(() => {
    logInfo('应用准备就绪，创建窗口...');
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});