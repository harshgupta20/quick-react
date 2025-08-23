import { writeFile, fileExists, createFolder } from './utils.js';
import path from 'path';

export const createAxiosSetup = (projectPath) => {
    const utilsDir = path.join(projectPath, "src", "utils");
    createFolder(utilsDir);
    
    const axiosContent = `import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    headers: { "Content-Type": "application/json" },
    timeout: 10000
});

// ✅ Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = \`Bearer \${token}\`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ✅ Response Interceptor
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response) {
            console.error("API Error:", error.response.data?.message || error.message);
            if (error.response.status === 401) {
                window.location.href = "/login";
            }
        } else if (error.request) {
            console.error("No response received from server.");
        } else {
            console.error("Request setup error:", error.message);
        }
        return Promise.reject(error);
    }
);`;

    writeFile(path.join(utilsDir, "axiosInstance.js"), axiosContent);
};

export const createAppComponent = (projectPath, projectName, isPWA, isTS) => {
    const appFile = path.join(projectPath, `src/App.${isTS? 'tsx':'jsx'}`);
      
    const appContent = `${isPWA ? `import { usePWA } from './hooks/usePWA';\n\n` : ''}export default function App() {
  ${isPWA ? `const { isInstallable, installApp, isOnline } = usePWA();\n\n  ` : ''}return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        background: "#f9fafb",
        color: "#111",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "0.5rem",
          fontWeight: 600,
        }}
      >
        Welcome to{" "}
        <span style={{ color: "#2563eb" }}>${projectName}</span> 🚀
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "2rem" }}>
        Your ${isPWA ? 'PWA is' : 'project is'} ready. Start building amazing things!
      </p>
      
      ${isPWA ? `<div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
        <div style={{ 
          padding: "0.5rem 1rem", 
          background: "#2563eb", 
          color: "white", 
          borderRadius: "0.5rem",
          fontSize: "0.9rem"
        }}>
          📱 PWA Enabled
        </div>
        
        <div style={{ 
          padding: "0.5rem 1rem", 
          background: isOnline ? "#10b981" : "#ef4444", 
          color: "white", 
          borderRadius: "0.5rem",
          fontSize: "0.9rem"
        }}>
          {isOnline ? "🟢 Online" : "🔴 Offline"}
        </div>
        
        {isInstallable && (
          <button
            onClick={installApp}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500"
            }}
          >
            📲 Install App
          </button>
        )}
      </div>` : ''}
    </div>
  );
}`;

    writeFile(appFile, appContent);
};

export const setupRouterMain = (projectPath, cssFramework, isTS) => {
    const mainPath = path.join(projectPath, `src/main.${isTS ? 'tsx' : 'jsx'}`);

    let cssImports = "";
    const cssImportMap = {
        "React Bootstrap": `import 'bootstrap/dist/css/bootstrap.min.css';\n`,
        "Tailwind": `import './index.css';\n`,
        "Bootstrap (CDN)": "",
        "MUI": ""
    };

    cssImports = cssImportMap[cssFramework] || "";

    const routerSetup = `${cssImports}import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')${isTS ? '!' : ''}).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);`;

    writeFile(mainPath, routerSetup);
};

export const createPWAReadme = (projectPath, projectName, cssFramework, packages, isPWA, isTS) => {
  const ext = isTS ? 'tsx' : 'jsx';
    const readmeContent = `# ${projectName}

A modern React application${isPWA ? ' with Progressive Web App (PWA) capabilities' : ''} built with Vite.

## 🚀 Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 18** - Latest React with modern hooks
- 🎨 **${cssFramework}** - Styling framework
- 🛣️ **React Router** - Client-side routing
${isPWA ? `- 📱 **PWA Ready** - Installable, offline-capable app
- 🔄 **Auto-updates** - Service worker with auto-update functionality
- 📊 **Caching Strategy** - Smart caching for better performance` : ''}
${packages.length > 0 ? `- 📦 **Additional Packages**: ${packages.join(', ')}` : ''}

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🛠️ Installation

1. Navigate to the project directory:
   \`\`\`bash
   cd ${projectName}
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

## 🏃‍♂️ Running the Application

### Development Mode
\`\`\`bash
npm run dev
\`\`\`
The app will be available at \`http://localhost:5173\`

### Production Build
\`\`\`bash
npm run build
\`\`\`

### Preview Production Build
\`\`\`bash
npm run preview
\`\`\`

${isPWA ? `## 📱 PWA Features

### Installation
- **Desktop**: Look for the install icon in the address bar or use the "Install App" button
- **Mobile**: Use "Add to Home Screen" option in your browser menu

### Offline Support
This app works offline thanks to service worker caching:
- Static assets are cached automatically
- API responses are cached with NetworkFirst strategy
- Fallback pages for offline scenarios

### Testing PWA Features

1. **Install Prompt Testing**:
   \`\`\`bash
   # Serve the built app locally
   npm run build
   npm run preview
   \`\`\`

2. **Service Worker Testing**:
   - Open DevTools → Application → Service Workers
   - Check if SW is registered and active

3. **Offline Testing**:
   - Build and serve the app
   - Open DevTools → Network → check "Offline"
   - Refresh the page - it should still work

### PWA Asset Replacement

⚠️ **Important**: Replace the placeholder SVG icons with proper PNG icons:

1. Replace these files in \`public/\` folder:
   - \`pwa-192x192.svg\` → \`pwa-192x192.png\`
   - \`pwa-512x512.svg\` → \`pwa-512x512.png\`
   - \`apple-touch-icon.svg\` → \`apple-touch-icon.png\`
   - \`favicon.svg\` → \`favicon.ico\`

2. Use tools like:
   - [PWA Asset Generator](https://www.pwabuilder.com/)
   - [Favicon Generator](https://www.favicon-generator.org/)
   - [App Icon Generator](https://appicon.co/)

### PWA Checklist

- ✅ Web App Manifest configured
- ✅ Service Worker registered
- ✅ HTTPS ready (required for PWA)
- ✅ Responsive design
- ⚠️ Replace placeholder icons with real ones
- ⚠️ Test on actual devices
- ⚠️ Test offline functionality

` : ''}## 📁 Project Structure

\`\`\`
${projectName}/
├── public/
${isPWA ? `│   ├── pwa-192x192.svg    # Replace with PNG
│   ├── pwa-512x512.svg    # Replace with PNG
│   └── apple-touch-icon.svg # Replace with PNG
` : ''}├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
${isPWA ? `│   │   └── usePWA.js      # PWA functionality hook
` : ''}│   ├── store/            # State management
│   ├── utils/            # Utility functions
${packages.includes('axios') ? `│   │   └── axiosInstance.js # Axios configuration
` : ''}│   ├── assets/          # Static assets
│   ├── App.${ext}           # Main App component
│   └── main.${ext}           # Entry point
├── vite.config.${isTS ? 'ts' : 'js'}        # Vite configuration
└── package.json
\`\`\`

## 🎨 Styling

This project uses **${cssFramework}** for styling:

${cssFramework === 'Tailwind' ? `- Classes are available globally
- Configuration in \`vite.config.js\`
- Customize in \`src/index.css\`` : 
cssFramework === 'Bootstrap (CDN)' ? `- Bootstrap 5.3.3 loaded via CDN
- All Bootstrap classes available globally
- No additional configuration needed` :
cssFramework === 'React Bootstrap' ? `- React Bootstrap components installed
- Import components: \`import { Button, Container } from 'react-bootstrap'\`
- Bootstrap CSS included automatically` :
cssFramework === 'MUI' ? `- Material-UI components installed
- Import components: \`import { Button, Container } from '@mui/material'\`
- Emotion for CSS-in-JS styling` : ''}

${packages.includes('axios') ? `## 🌐 API Integration

Axios is pre-configured in \`src/utils/axiosInstance.js\`:

\`\`\`javascript
import { api } from './utils/axiosInstance';

// GET request
const data = await api.get('/users');

// POST request
const response = await api.post('/users', { name: 'John' });
\`\`\`

### Environment Variables
Create a \`.env\` file:
\`\`\`
VITE_API_URL=https://your-api-url.com
\`\`\`

` : ''}## 🔧 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint (if configured)

## 🚀 Deployment

### Vercel
\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

### Netlify
\`\`\`bash
npm run build
# Upload dist/ folder to Netlify
\`\`\`

${isPWA ? `### PWA Deployment Checklist
- ✅ Build with \`npm run build\`
- ✅ Serve over HTTPS
- ✅ Test service worker registration
- ✅ Verify manifest.json is accessible
- ✅ Test install prompt on mobile/desktop
- ✅ Replace placeholder icons with real ones

` : ''}## 🎯 Next Steps

${isPWA ? `1. **Replace PWA Icons**: Replace SVG placeholders with proper PNG icons
2. **Test PWA Features**: Test installation and offline functionality
3. **Customize Caching**: Modify caching strategy in vite.config.js
4. **Add Components**: Start building your app components
5. **Configure API**: Set up your API endpoints
6. **Deploy**: Deploy to a PWA-compatible hosting service` : `1. **Add Components**: Start building your app components
2. **Set up Routing**: Add more routes in main.${ext}
3. **Configure API**: Set up your API endpoints if using Axios
4. **Add State Management**: Implement Redux/Zustand if needed
5. **Deploy**: Deploy to your preferred hosting service`}

---

Built using React + Vite${isPWA ? ' + PWA' : ''}
`;

    writeFile(path.join(projectPath, "README.md"), readmeContent);
};
