import { run, writeFile, readFile, createFolder } from './utils.js';
import path from 'path';

export const installPWADependencies = (projectPath) => {
    run(`npm install vite-plugin-pwa workbox-window`, projectPath);
};

export const setupPWAConfig = (projectPath, projectName, isTS) => {
    const viteConfigPath = path.join(projectPath, `vite.config.${isTS ? 'ts' : 'js'}`);
    let viteConfig = readFile(viteConfigPath);
    
    if (!viteConfig.includes("vite-plugin-pwa")) {
        viteConfig = `import { VitePWA } from 'vite-plugin-pwa'\n` + viteConfig;
    }
    
    const pwaConfig = `VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '${projectName}',
        short_name: '${projectName}',
        description: 'A Progressive Web App built with React and Vite',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\\/\\/api\\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          }
        ]
      }
    })`;
    
    viteConfig = viteConfig.replace(/plugins:\s*\[/, `plugins: [\n    ${pwaConfig},`);
    writeFile(viteConfigPath, viteConfig);
};

export const createPWAAssets = (projectPath, projectName) => {
    const publicPath = path.join(projectPath, "public");
    
    const createDummyIcon = (size) => {
        return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#2563eb"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="${Math.floor(size/6)}" font-family="Arial, sans-serif" font-weight="bold">${projectName.charAt(0).toUpperCase()}</text>
        </svg>`;
    };
    
    const icons = [
        { name: "pwa-192x192.svg", size: 192 },
        { name: "pwa-512x512.svg", size: 512 },
        { name: "apple-touch-icon.svg", size: 180 },
        { name: "favicon.svg", size: 32 }
    ];
    
    icons.forEach(({ name, size }) => {
        writeFile(path.join(publicPath, name), createDummyIcon(size));
    });
    
    console.log("📱 PWA placeholder assets created");
};

export const createPWAHook = (projectPath, isTS) => {
    const hooksDir = path.join(projectPath, "src", "hooks");
    createFolder(hooksDir);
    
    const hookContent = `import { useEffect, useState } from 'react';
${isTS ? 
`
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface UsePWAResult {
  isInstallable: boolean;
  installApp: () => Promise<void>;
  isOnline: boolean;
}
`: ''}
export const usePWA = ()${isTS ? ': UsePWAResult' : ''} => {
  const [deferredPrompt, setDeferredPrompt] = useState${isTS ? '<BeforeInstallPromptEvent | null>':''}(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('❌ SW registration failed: ', registrationError);
        });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e${isTS ? ': Event':''}) => {
      e.preventDefault();
      setDeferredPrompt(e ${isTS ? 'as BeforeInstallPromptEvent':''});
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ User accepted the install prompt');
    } else {
      console.log('❌ User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { 
    isInstallable, 
    installApp,
    isOnline: navigator.onLine 
  };
};`;

  writeFile(path.join(hooksDir, `usePWA.${isTS ? "ts" : "js"}`), hookContent);
};

export const initializePWA = (projectPath, projectName, isTS) => {
    installPWADependencies(projectPath);
    setupPWAConfig(projectPath, projectName, isTS);
    createPWAAssets(projectPath, projectName);
    createPWAHook(projectPath, isTS);
    console.log("✅ PWA configuration complete!");
};
