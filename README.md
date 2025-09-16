# Factory Insight AI - Predictive Maintenance Dashboard

This is a sophisticated web application designed to monitor factory equipment in real-time. It leverages AI to provide predictive maintenance analysis, helping to prevent failures and optimize operations. The application features a modern, voice-controlled AI assistant and is highly configurable.

## Key Features

-   **Real-Time Dashboard**: Monitor key metrics (temperature, pressure, vibration) for multiple devices. Supports both a `Simulation` mode for testing and a `Live Data` mode.
-   **AI-Powered Predictive Analysis**: Uses configurable AI models (Google Gemini, OpenAI, Anthropic, and more) to analyze device data, predict potential failures, and provide actionable recommendations.
-   **Voice-Controlled AI Assistant**: Engage in a continuous, real-time voice conversation with an AI assistant to get insights and information.
-   **Device Management**: A comprehensive interface to add, edit, and delete devices and their specific communication protocol parameters.
-   **Configurable AI Providers**: A settings panel to switch between different large language models (LLMs), including Google Gemini, OpenAI, Anthropic (Claude), and a custom provider.
-   **Modern UI/UX**: Features a sleek, responsive interface with light/dark modes and a "glassmorphism" design.
-   **Notification System**: Get real-time alerts when a device's status becomes critical, with a notification panel to review recent events.

## Screenshots

Here are a few glimpses of the application's interface.

**Main Dashboard (Dark Mode)**
*Displays real-time data from all connected factory equipment.*


**AI Voice Assistant**
*Interact with the AI using your voice for hands-free operation.*


**Settings Panel**
*Easily configure and switch between different AI providers like Gemini, OpenAI, and more.*


## Project Setup (For Local Development)

The current project files are set up for a specific web environment. To run, debug, and develop locally, you'll need to use a modern build tool like [Vite](https://vitejs.dev/). The following steps will guide you through setting up a standard local development environment.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   [npm](https://www.npmjs.com/) (which comes with Node.js)

### 1. Project Structure

First, let's organize the project files into a standard structure.

1.  Create a new folder named `src` in the root of your project.
2.  Move the following files and folders into the new `src` folder:
    -   `App.tsx`
    -   `components/`
    -   `constants.ts`
    -   `index.tsx`
    -   `services/`
    -   `types.ts`

### 2. Create `package.json`

In the root of your project, create a file named `package.json` and add the following content. This file defines your project's dependencies and scripts.

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
    "files": [
      "dist/**/*",
      "electron.cjs"
    ],
    "directories": {
      "output": "release"
    },
    "win": {
      "target": "nsis"
    },
    "mac": {
      "target": "dmg"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

### 3. Install Dependencies

Open your terminal in the project's root directory and run:

```bash
npm install
```

### 4. Create Vite Configuration

Create a file named `vite.config.ts` in the root directory. This configures the Vite server and tells it how to handle environment variables.

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This makes VITE_GEMINI_API_KEY from your .env file
    // available as process.env.API_KEY in your app's code.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  }
})
```

### 5. Update `index.html`

Modify your `index.html` file to work with Vite. Remove the `<script type="importmap">...</script>` block entirely and change the final script tag to point to the new location of `index.tsx`.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    ... <!-- Keep existing head content like meta, title, links -->
  </head>
  <body class="bg-gray-100 dark:bg-gray-900 ...">
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script> <!-- This line is updated -->
  </body>
</html>
```

### 6. Environment Variables

The application requires API keys. Create a file named `.env` in the root of the project.

**.env file example:**

```env
# Your Google Gemini API Key
VITE_GEMINI_API_KEY="AIzaSy..."
```

*Note: The `VITE_` prefix is required by Vite to expose the variable to your frontend code.*

### 7. Run the Development Server

You are now ready to run the app!

```bash
npm run dev
```

This will start the application on `http://localhost:5173`.

---

## Converting to a Desktop App with Electron

You can package this application as a native desktop app using Electron.

### 1. Create the Main Electron File

Create a file named `electron.cjs` in the root directory. This script is the entry point for your desktop app.

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
    // In development, load from the Vite dev server
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // In production, load the built HTML file
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

### 2. Run in Development Mode

To run the application inside an Electron window during development, use:

```bash
npm run electron:dev
```

---

## Packaging as an Executable (.exe)

`electron-builder` is used to package the app into a distributable format for Windows (`.exe`), macOS (`.dmg`), etc.

### 1. Build the Web App

First, create a production-ready build of the static web assets.

```bash
npm run build
```

This command creates a `dist` folder with the optimized frontend code.

### 2. Package the Electron App

Now, run the command to build the executable for your current operating system.

```bash
npm run electron:build
```

### 3. Find the Executable

Once finished, you will find the installer and executable files in a new `release/` directory.