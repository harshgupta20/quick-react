#!/usr/bin/env node

import { getProjectName, getCSSFramework, getOptionalPackages } from "./src/prompts.js";
import { setupCSSFramework } from "./src/styles/index.js";
import { 
    createViteProject, 
    installPackages, 
    createFolderStructure, 
    createAxiosInstance, 
    cleanupDefaultFiles 
} from "./src/projectSetup.js";
import { createAppTemplate, createMainTemplate } from "./src/templates/index.js";

(async () => {
    const projectName = await getProjectName();
    const cssFramework = await getCSSFramework();
    const packages = await getOptionalPackages();

    const projectPath = createViteProject(projectName);

    setupCSSFramework(cssFramework, projectPath);

    const defaultPackages = ["react-router-dom"];
    const allPackages = [...defaultPackages, ...packages];
    installPackages(allPackages, projectPath);

    createFolderStructure(projectPath);

    if (packages.includes("axios")) {
        createAxiosInstance(projectPath);
    }

    cleanupDefaultFiles(projectPath, cssFramework);

    createAppTemplate(projectName, projectPath);
    createMainTemplate(projectPath, cssFramework);

    console.log("\n✅ Setup complete!");
    console.log(`\nNext steps:\n  cd ${projectName}\n  npm run dev`);
})();
