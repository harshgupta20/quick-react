import { run, writeFile, readFile, fileExists } from './utils.js';
import path from 'path';

export const setupTailwind = (projectPath, isTS) => {
    run(`npm install tailwindcss @tailwindcss/vite`, projectPath);

    const viteConfigPath = path.join(projectPath, `vite.config.${isTS ? 'ts' : 'js'}`);
    let viteConfig = readFile(viteConfigPath);
    viteConfig = `import tailwindcss from '@tailwindcss/vite'\n` + viteConfig;
    viteConfig = viteConfig.replace(/plugins:\s*\[/, "plugins: [\n    tailwindcss(),");
    writeFile(viteConfigPath, viteConfig);

    writeFile(path.join(projectPath, "src", "index.css"), `@import "tailwindcss";\n`);

    const mainPath = path.join(projectPath, `src/main.${isTS ? 'tsx' : 'jsx'}`);
    let mainContent = readFile(mainPath);
    mainContent = mainContent.replace(/import\s+['"]\.\/index\.css['"];?/g, "");
    if (!mainContent.includes(`import './index.css'`)) {
        mainContent = `import './index.css';\n` + mainContent;
    }
    writeFile(mainPath, mainContent);
};

export const setupBootstrapCDN = (projectPath) => {
    const indexHtmlPath = path.join(projectPath, "index.html");
    let indexHtml = readFile(indexHtmlPath);
    indexHtml = indexHtml.replace(
        /<head>/,
        `<head>\n    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">\n    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>`
    );
    writeFile(indexHtmlPath, indexHtml);
};

export const setupReactBootstrap = (projectPath, isTS) => {
    run(`npm install react-bootstrap bootstrap`, projectPath);
    const mainPath = path.join(projectPath, `src/main.${isTS ? 'tsx' : 'jsx'}`);
    let mainContent = readFile(mainPath);
    mainContent = mainContent
        .replace(/import\s+['"]\.\/index\.css['"];?/g, "")
        .replace(/import\s+['"]\.\/App\.css['"];?/g, "");
    mainContent = `import 'bootstrap/dist/css/bootstrap.min.css';\n` + mainContent;
    writeFile(mainPath, mainContent);
};

export const setupMUI = (projectPath, isTS) => {
    run(`npm install @mui/material @emotion/react @emotion/styled`, projectPath);
    const mainPath = path.join(projectPath, `src/main.${isTS ? 'tsx' : 'jsx'}`);
    let mainContent = readFile(mainPath);
    mainContent = mainContent
        .replace(/import\s+['"]\.\/index\.css['"];?/g, "")
        .replace(/import\s+['"]\.\/App\.css['"];?/g, "");
    writeFile(mainPath, mainContent);
};

export const setupCSSFramework = (cssFramework, projectPath, isTS) => {
    const frameworkMap = {
        "Tailwind": () => setupTailwind(projectPath, isTS),
        "Bootstrap (CDN)": () => setupBootstrapCDN(projectPath),
        "React Bootstrap": () => setupReactBootstrap(projectPath, isTS),
        "MUI": () => setupMUI(projectPath, isTS)
    };

    const setupFunction = frameworkMap[cssFramework];
    if (setupFunction) {
        setupFunction();
    }
};
