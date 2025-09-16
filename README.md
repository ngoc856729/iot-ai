
# Factory Insight AI - Bảng Điều Khiển Bảo Trì Dự Đoán

<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.3-purple?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Electron-31-blueviolet?logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/AI-Gemini-orange?logo=google&logoColor=white" alt="Gemini">
</div>

<br>

**Factory Insight AI** là một ứng dụng web tinh vi được thiết kế để giám sát thiết bị nhà máy trong thời gian thực. Nó tận dụng AI để cung cấp phân tích bảo trì dự đoán, giúp ngăn ngừa sự cố và tối ưu hóa hoạt động. Ứng dụng có một trợ lý AI hiện đại, điều khiển bằng giọng nói và có khả năng cấu hình cao.

</div>

---

## ✨ Các Tính Năng Chính

-   **📊 Bảng Điều Khiển Thời Gian Thực**: Giám sát các chỉ số chính (nhiệt độ, áp suất, độ rung) cho nhiều thiết bị. Hỗ trợ cả chế độ `Mô phỏng` để thử nghiệm và chế độ `Dữ liệu trực tiếp`.
-   **🤖 Phân Tích Dự Đoán Bằng AI**: Sử dụng các mô hình AI có thể cấu hình (Google Gemini, OpenAI, Anthropic, v.v.) để phân tích dữ liệu thiết bị, dự đoán các sự cố tiềm ẩn và đưa ra các khuyến nghị có thể hành động.
-   **🗣️ Trợ Lý AI Điều Khiển Bằng Giọng Nói**: Tương tác trong một cuộc trò chuyện thoại thời gian thực, liên tục với trợ lý AI để nhận thông tin chi tiết.
-   **🖥️ Quản Lý Thiết Bị**: Giao diện toàn diện để thêm, chỉnh sửa và xóa các thiết bị cũng như các thông số giao thức truyền thông cụ thể của chúng.
-   **🔧 Cấu Hình Nhà Cung Cấp AI**: Bảng cài đặt để chuyển đổi giữa các mô hình ngôn ngữ lớn (LLM) khác nhau, bao gồm Google Gemini, OpenAI, Anthropic (Claude) và nhà cung cấp tùy chỉnh.
-   **🎨 Giao Diện/Trải Nghiệm Người Dùng Hiện Đại**: Giao diện mượt mà, đáp ứng với chế độ sáng/tối và thiết kế "glassmorphism".
-   **🔔 Hệ Thống Thông Báo**: Nhận cảnh báo thời gian thực khi trạng thái của thiết bị trở nên nguy cấp, với bảng thông báo để xem lại các sự kiện gần đây.

---

## 📸 Hình Ảnh Minh Họa

| Bảng Điều Khiển Chính (Chế độ tối) | Trợ Lý AI Bằng Giọng Nói | Bảng Cài Đặt |
| :---------------------------------: | :---------------------------------: | :---------------------------------: |
| *Hiển thị dữ liệu thời gian thực từ tất cả các thiết bị nhà máy được kết nối.* | *Tương tác với AI bằng giọng nói của bạn để vận hành rảnh tay.* | *Dễ dàng cấu hình và chuyển đổi giữa các nhà cung cấp AI khác nhau.* |
| `[Chèn ảnh chụp màn hình bảng điều khiển ở đây]` | `[Chèn ảnh chụp màn hình trợ lý giọng nói ở đây]` | `[Chèn ảnh chụp màn hình cài đặt ở đây]` |

---

## 🚀 Bắt Đầu (Để Phát Triển Cục Bộ)

Dự án này được thiết lập cho một môi trường web cụ thể. Để chạy, gỡ lỗi và phát triển cục bộ, bạn sẽ cần sử dụng một công cụ xây dựng hiện đại như [Vite](https://vitejs.dev/).

### 📋 Điều Kiện Tiên Quyết

-   [Node.js](https://nodejs.org/) (khuyến nghị v18.x trở lên)
-   [npm](https://www.npmjs.com/) (đi kèm với Node.js)

### 🛠️ Hướng Dẫn Cài Đặt

1.  **Sắp xếp cấu trúc dự án:**
    -   Tạo một thư mục mới có tên là `src` trong thư mục gốc của dự án.
    -   Di chuyển các tệp và thư mục sau vào thư mục `src` mới:
        -   `App.tsx`, `index.tsx`, `types.ts`, `constants.ts`
        -   `components/`, `services/`

2.  **Cài đặt các gói phụ thuộc:**
    Mở terminal của bạn trong thư mục gốc của dự án và chạy:
    ```bash
    npm install
    ```

3.  **Cấu hình biến môi trường:**
    Tạo một tệp có tên là `.env` trong thư mục gốc của dự án và thêm khóa API của bạn.
    ```env
    # Khóa API Google Gemini của bạn
    VITE_GEMINI_API_KEY="AIzaSy..."
    ```
    > **Lưu ý:** Tiền tố `VITE_` là bắt buộc để Vite hiển thị biến cho mã nguồn frontend của bạn.

4.  **Chạy máy chủ phát triển:**
    Bây giờ bạn đã sẵn sàng để chạy ứng dụng!
    ```bash
    npm run dev
    ```
    Thao tác này sẽ khởi động ứng dụng trên `http://localhost:5173`.

<br>
<details>
<summary>📄 Xem nội dung tệp cấu hình (package.json, vite.config.ts, v.v.)</summary>

#### `package.json`
Tạo một tệp có tên `package.json` trong thư mục gốc của dự án.
```json
{
  "name": "factory-insight-ai",
  "private": true,
  "version": "1.0.0",
  "main": "electron.cjs",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \"npm run dev\" \"electron .\"",
    "electron:build": "vite build && electron-builder"
  },
  "dependencies": {
    "@google/genai": "^1.19.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "recharts": "^3.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "concurrently": "^8.2.2",
    "electron": "^31.2.1",
    "electron-builder": "^24.13.3",
    "typescript": "^5.5.3",
    "vite": "^5.3.3"
  },
  "build": {
    "appId": "com.factory-insight.ai",
    "productName": "Factory Insight AI",
    "files": [ "dist/**/*", "electron.cjs" ],
    "directories": { "output": "release" },
    "win": { "target": "nsis" },
    "mac": { "target": "dmg" },
    "linux": { "target": "AppImage" }
  }
}
```

#### `vite.config.ts`
Tạo một tệp có tên `vite.config.ts` trong thư mục gốc.
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Thao tác này làm cho VITE_GEMINI_API_KEY từ tệp .env của bạn
    // có sẵn dưới dạng process.env.API_KEY trong mã của ứng dụng.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  }
})
```

#### `index.html`
Sửa đổi tệp `index.html` của bạn để hoạt động với Vite. Xóa hoàn toàn khối `<script type="importmap">...</script>` và thay đổi thẻ script cuối cùng để trỏ đến vị trí mới của `index.tsx`.
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    ... <!-- Giữ lại nội dung head hiện có như meta, title, links -->
  </head>
  <body class="bg-gray-100 dark:bg-gray-900 ...">
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script> <!-- Dòng này đã được cập nhật -->
  </body>
</html>
```
</details>

---

## 💻 Chuyển đổi thành Ứng dụng Desktop với Electron

Bạn có thể đóng gói ứng dụng này thành một ứng dụng desktop gốc bằng Electron.

<details>
<summary>📄 Xem nội dung tệp electron.cjs</summary>

Tạo một tệp có tên `electron.cjs` trong thư mục gốc. Tập lệnh này là điểm vào cho ứng dụng desktop của bạn.
```javascript
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
```
</details>

### Các Lệnh Có Sẵn

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Khởi động máy chủ phát triển Vite cho web. |
| `npm run electron:dev` | Chạy ứng dụng trong một cửa sổ Electron để phát triển. |
| `npm run build` | Xây dựng các tài sản web cho môi trường sản phẩm. |
| `npm run electron:build` | Đóng gói ứng dụng thành một tệp thực thi (ví dụ: `.exe`, `.dmg`). |
| `npm run preview` | Xem trước bản dựng sản phẩm một cách cục bộ. |

<br>

**Để xây dựng tệp thực thi:**
1.  **Xây dựng ứng dụng web:**
    ```bash
    npm run build
    ```
2.  **Đóng gói ứng dụng Electron:**
    ```bash
    npm run electron:build
    ```
    Tìm trình cài đặt và các tệp thực thi trong thư mục `release/` mới.
