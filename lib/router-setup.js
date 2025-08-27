import path from 'path';
import { fileExists, readFile, writeFile, resolveReactEntry, resolveViteConfig } from './utils.js';

// Content for the main.tsx/jsx for react router
const mainContentReactRouter = (
  cssImports, isTS
) => `${cssImports}import React from 'react';
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

// Content for the main.tsx/jsx for tanstack router
const mainContentTanstack = (cssImports, isTS) => { `${cssImports}import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
  
  // Create a new router instance
  const router = createRouter({ routeTree });
${isTS ? `

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
` : ''}

  ReactDOM.createRoot(document.getElementById('root')${isTS ? '!' : ''}).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
`;
};

/**
 * * ----------------------------- Tanstack Setup Start -----------------------------
 */

// Contents for the src/routes/__root.tsx/jsx
const ROOT = `
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
        <Link to="/" style={{ fontWeight: 'bold' }}>
          Home
        </Link>{' '}
        <Link to="/about" style={{ fontWeight: 'bold' }}>
          About
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
`;

// Contents for the src/routes/index.tsx/jsx
const INDEX = `
import { createFileRoute } from '@tanstack/react-router'
import App from "../App"

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-2">
      <App />
    </div>
  )
}
`;

// Contents for the src/routes/about.tsx/jsx
const ABOUT = `
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return <div className="p-2">Hello from About!</div>
}
`;

/**
 * Updates the project's `vite.config.js` or `vite.config.ts` to enable the TanStack Router plugin
 * if it is not already configured.
 *
 * - Adds the `tanstackRouter` import
 * - Inserts the plugin as the first entry in the `plugins` array
 * - Supports both JavaScript and TypeScript configurations
 *
 * @param {string} projectPath Absolute path to the project root
 */
const updateViteConfig = (projectPath) => {
    // Check if vite.config.ts exists, otherwise use vite.config.js
    const viteConfigPath = resolveViteConfig(projectPath);
    let viteConfig = readFile(viteConfigPath);
    
    // Add the import for tanstack router plugin
    if (!viteConfig.includes('@tanstack/router-plugin/vite')) {
        viteConfig = viteConfig.replace(
            "import { defineConfig } from 'vite'",
            "import { defineConfig } from 'vite'\nimport { tanstackRouter } from '@tanstack/router-plugin/vite'"
        );
    }
    
    // Add the plugin to the plugins array at index 0
    if (!viteConfig.includes('tanstackRouter(')) {
        viteConfig = viteConfig.replace(
            "plugins: [",
            "plugins: [\n    tanstackRouter({\n      target: 'react',\n      autoCodeSplitting: true,\n    }),"
        );
    }
    
    writeFile(viteConfigPath, viteConfig);
}

/**
 * Sets up TanStack Router file-based routing in a project.
 *
 * Actions:
 * - Creates `src/routes/__root.(tsx|jsx)`, `src/routes/index.(tsx|jsx)`, and `src/routes/about.(tsx|jsx)`
 * - Writes the React entry file with TanStack Router bootstrapping
 * - Updates `vite.config.js` to include the TanStack Router plugin
 *
 * @param {string} cssImports String of CSS import statements to prepend in the entry file
 * @param {"src/main.jsx"|"src/main.tsx"} mainFile Relative path to the app entry file used to infer TypeScript vs JavaScript
 * @param {string} mainPath Absolute path to the app entry file to write
 * @param {string} projectPath Absolute path to the project root
 * @returns {void}
 */
const setUpTanstackRouter = (mainFile, projectPath) => {
    const isProjectTs = mainFile.endsWith(".tsx"); // To check if the project uses typescript.
    const routesPath = path.join(projectPath, "src", "routes");
    
    // 1 Create route files in src/routes
    const ext = isProjectTs ? 'tsx' : 'jsx';
    [
      [`__root.${ext}`, ROOT],
      [`index.${ext}`, INDEX],
      [`about.${ext}`, ABOUT],
    ].forEach(([filename, contents]) => {
      writeFile(path.join(routesPath, filename), contents);
    });
}

/**
 * * ----------------------------- Tanstack Setup End -------------------------------
 */

/**
 * Configures routing for the scaffolded project based on the selected framework.
 *
 * - When `routingFramework` is "React Router": writes a minimal `<BrowserRouter>` setup into the entry file
 * - When `routingFramework` is "Tanstack Router": performs file-based routing setup and adjusts Vite config
 * - Otherwise: writes a default, no-routing entry file
 *
 * @param {string} projectPath Absolute path to the project root
 * @param {"React Router"|"Tanstack Router"|string} routingFramework Selected routing framework
 * @param {"React Bootstrap"|"Tailwind"|"Bootstrap (CDN)"|"MUI"|string} cssFramework Selected CSS framework for initial imports
 * @returns {void}
 */
export const setupRoutingFramework = (projectPath, routingFramework, cssFramework) => {
    
    // Check if the project is created with typescript
    const mainPath = resolveReactEntry(projectPath);
    const isTS = mainPath.endsWith('.tsx');
    const mainFile = isTS ? 'src/main.tsx' : 'src/main.jsx';

    let cssImports = "";
    const cssImportMap = {
      "React Bootstrap": `import 'bootstrap/dist/css/bootstrap.min.css';\n`,
      "Tailwind": `import './index.css';\n`,
      "Bootstrap (CDN)": "",
      "MUI": "",
    };

    cssImports = cssImportMap[cssFramework] || "";

    let mainContents = ""

    if(routingFramework === 'React Router') {
        mainContents = mainContentReactRouter(cssImports, isTS);
    }
    else {
      setUpTanstackRouter(mainFile, projectPath);
      // 1. Update the main.tsx/jsx
      mainContents = mainContentTanstack(cssImports, isTS);
      // 2. Update the vite.config. handles both js and ts configs
      updateViteConfig(projectPath);
    }

    writeFile(mainPath, mainContents);
    return;
};
