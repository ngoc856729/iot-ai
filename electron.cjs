const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    // Trong môi trường phát triển, tải từ máy chủ dev của Vite
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // Trong môi trường sản phẩm, tải tệp HTML đã được xây dựng
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Trên macOS, thông thường sẽ tạo lại một cửa sổ trong ứng dụng khi
  // biểu tượng dock được nhấp và không có cửa sổ nào khác đang mở.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
