#!/usr/bin/env node
import inquirer from "inquirer";
import path from "path";
import { run, createFolder, deleteFile } from './lib/utils.js';
import { initializePWA } from './lib/pwa.js';
import { setupCSSFramework } from './lib/css-frameworks.js';
import { createAxiosSetup, createAppComponent, setupRouterMain, createPWAReadme } from './lib/templates.js';
import { setupTestingFramework } from './lib/testing.js';
import { setupDevTools } from './lib/dev-tools.js';

(async () => {
    // 1. Collect user inputs
    const answers = await inquirer.prompt([
        { 
            type: "input", 
            name: "projectName", 
            message: "Enter project name:" 
        },
        {
            type: "list",
            name: "cssFramework",
            message: "Choose a CSS framework:",
            choices: ["Tailwind", "Bootstrap (CDN)", "React Bootstrap", "MUI"]
        },
        {
            type: "confirm",
            name: "isPWA",
            message: "Do you want to make this a Progressive Web App (PWA)?",
            default: false
        },
        {
            type: "list",
            name: "testingFramework",
            message: "Choose a testing framework:",
            choices: [
                { name: "None", value: "none" },
                { name: "Vitest + React Testing Library", value: "vitest" },
                { name: "Jest + React Testing Library", value: "jest" },
                { name: "Cypress (E2E)", value: "cypress" }
            ]
        },
        {
            type: "checkbox",
            name: "packages",
            message: "Select optional packages:",
            choices: [
                { name: "Axios", value: "axios" },
                { name: "React Icons", value: "react-icons" },
                { name: "React Hook Form", value: "react-hook-form" },
                { name: "Yup", value: "yup" },
                { name: "Formik", value: "formik" },
                { name: "Moment.js", value: "moment" },
                { name: "Zustand (State Management)", value: "zustand" },
                { name: "TanStack Query", value: "@tanstack/react-query" },
                { name: "Framer Motion", value: "framer-motion" },
                { name: "React Helmet (SEO)", value: "react-helmet-async" }
            ]
        },
        {
            type: "checkbox",
            name: "devTools",
            message: "Select development tools:",
            choices: [
                { name: "ESLint + Prettier", value: "eslint-prettier" },
                { name: "Husky (Git Hooks)", value: "husky" },
                { name: "Commitizen (Conventional Commits)", value: "commitizen" }
            ]
        }
    ]);

    const { projectName, cssFramework, isPWA, testingFramework, packages, devTools } = answers;
    const projectPath = path.join(process.cwd(), projectName);

    console.log(`\n🚀 Creating ${projectName}${isPWA ? ' with PWA capabilities' : ''}...`);

    // 2. Create Vite project
    run(`npm create vite@latest ${projectName} -- --template react`);

    // 3. Setup CSS framework
    setupCSSFramework(cssFramework, projectPath);

    // 4. Setup testing framework
    if (testingFramework !== "none") {
        setupTestingFramework(testingFramework, projectPath);
    }

    // 5. Install PWA functionality
    if (isPWA) {
        initializePWA(projectPath, projectName);
    }

    // 6. Install packages with legacy peer deps for compatibility
    const defaultPackages = ["react-router-dom"];
    const allPackages = [...defaultPackages, ...packages];
    if (allPackages.length > 0) {
        run(`npm install ${allPackages.join(" ")} --legacy-peer-deps`, projectPath);
    }

    // 7. Setup development tools
    if (devTools.length > 0) {
        setupDevTools(devTools, projectPath, testingFramework);
    }

    // 8. Create folder structure
    const folders = ["components", "pages", "hooks", "store", "utils", "assets"];
    folders.forEach((folder) => {
        createFolder(path.join(projectPath, "src", folder));
    });

    // 9. Setup Axios if selected
    if (packages.includes("axios")) {
        createAxiosSetup(projectPath);
    }

    // 10. Clean up default boilerplate files
    deleteFile(path.join(projectPath, "src", "App.css"));
    if (cssFramework !== "Tailwind") {
        deleteFile(path.join(projectPath, "src", "index.css"));
    }

    // 11. Generate clean templates
    createAppComponent(projectPath, projectName, isPWA);
    setupRouterMain(projectPath, cssFramework);
    
    // 12. Create comprehensive README
    createPWAReadme(projectPath, projectName, cssFramework, packages, isPWA);

    // 13. Enhanced success message
    console.log("\n✅ Setup complete!");
    console.log(`\n🎉 Your ${projectName} project is ready!`);
    console.log(`\n📁 Project includes:`);
    
    if (testingFramework !== "none") {
        const testingName = testingFramework === "vitest" ? "Vitest" : 
                           testingFramework === "jest" ? "Jest" : "Cypress";
        console.log(`   • ${testingName} testing setup`);
    }
    
    if (devTools.includes("eslint-prettier")) {
        console.log(`   • ESLint + Prettier configuration`);
    }
    
    if (devTools.includes("husky")) {
        console.log(`   • Husky git hooks`);
    }
    
    if (devTools.includes("commitizen")) {
        console.log(`   • Commitizen for conventional commits`);
    }
    
    if (packages.length > 0) {
        console.log(`   • Additional packages: ${packages.join(", ")}`);
    }
    
    if (isPWA) {
        console.log("   • PWA features enabled - your app can be installed on mobile devices!");
        console.log("   ⚠️  Important: Replace placeholder SVG icons with proper PNG icons for production");
    }

    console.log(`\n🚀 Next steps:`);
    console.log(`   cd ${projectName}`);
    console.log(`   npm install`);
    console.log(`   npm run dev`);
    
    if (testingFramework === "vitest") {
        console.log(`   npm test (run tests)`);
    } else if (testingFramework === "jest") {
        console.log(`   npm test (run tests)`);
    } else if (testingFramework === "cypress") {
        console.log(`   npm run test:e2e (run E2E tests)`);
    }
    
    if (devTools.includes("eslint-prettier")) {
        console.log(`   npm run lint (check code quality)`);
    }
    
    if (isPWA) {
        console.log(`\n📱 To test PWA:\n  npm run build\n  npm run preview\n  Open http://localhost:4173 and test install/offline features`);
    }
})();
