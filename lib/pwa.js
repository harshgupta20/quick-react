import { run, writeFile, readFile, createFolder, resolveViteConfig, isTypeScriptProject } from './utils.js';
import path from 'path';

export const installPWADependencies = (projectPath) => {
    run(`npm install vite-plugin-pwa workbox-window`, projectPath);
};

export const setupPWAConfig = (projectPath, projectName) => {
    const viteConfigPath = resolveViteConfig(projectPath);
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
    if(!/VitePWA\(/.test(viteConfig)) {
      viteConfig = viteConfig.replace(/plugins:\s*\[/, `plugins: [\n    ${pwaConfig},`);
      writeFile(viteConfigPath, viteConfig);
    }
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

export const createPWAHook = (projectPath) => {
    const hooksDir = path.join(projectPath, "src", "hooks");
    createFolder(hooksDir);
    
    const isTS = isTypeScriptProject(projectPath);
    const hookPath = path.join(hooksDir, `usePWA.${isTS ? "ts" : "js"}`);

    const hookTS = `import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault?.();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, installApp, isOnline: navigator.onLine };
};
`;

    const hookJS = `import { useEffect, useState } from 'react';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
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
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
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

    writeFile(hookPath, isTS ? hookTS : hookJS);
};

export const initializePWA = (projectPath, projectName) => {
    installPWADependencies(projectPath);
    setupPWAConfig(projectPath, projectName);
    createPWAAssets(projectPath, projectName);
    createPWAHook(projectPath);
    console.log("✅ PWA configuration complete!");
};
