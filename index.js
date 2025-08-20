#!/usr/bin/env node
import inquirer from "inquirer";
import path from "path";
import { run, createFolder, deleteFile } from './lib/utils.js';
import { initializePWA } from './lib/pwa.js';
import { frameworks, optionalPackages, setupCSSFramework } from './lib/css-frameworks.js';
import { createAxiosSetup, createAppComponent, setupRouterMain, createPWAReadme, createI18nSetup, setupShadcn } from './lib/templates.js';

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
                { name: "i18next (internationalization)", value: "i18n" },
                { name: "shadcn/ui", value: "shadcn" }
            ]
        }
    ]);

    const { projectName, cssFramework, isPWA, packages } = answers;
    const projectPath = path.join(process.cwd(), projectName);

    console.log(`\n🚀 Creating ${projectName}${isPWA ? ' with PWA capabilities' : ''}...`);

    // 2. Create Vite project
    run(`npm create vite@latest ${projectName} -- --template react`);

    // 3. Create all necessary folder structure first
    const folders = ["components", "pages", "hooks", "store", "utils", "assets"];
    folders.forEach((folder) => {
        createFolder(path.join(projectPath, "src", folder));
    });

    // 4. Install packages
    const defaultPackages = ["react-router-dom"];
    const additionalPackages = [];
    if (packages.includes("i18n")) {
        additionalPackages.push("react-i18next", "i18next", "i18next-browser-languagedetector");
    }
    if (packages.includes("shadcn")) {
        additionalPackages.push("lucide-react");
    }
    const allPackages = [...defaultPackages, ...packages, ...additionalPackages];
    if (allPackages.length > 0) {
        run(`npm install ${allPackages.join(" ")}`, projectPath);
    }

    // 5. Setup PWA if selected
    if (isPWA) {
        initializePWA(projectPath, projectName);
    }

    // 6. Setup CSS framework
    setupCSSFramework(cssFramework, projectPath);

    // 7. Setup Axios if selected
    if (packages.includes("axios")) {
        createAxiosSetup(projectPath);
    }

    // 8. Setup i18next if selected
    if (packages.includes("i18n")) {
        createI18nSetup(projectPath);
    }

    // 9. Setup shadcn/ui if selected
    if (packages.includes("shadcn")) {
        setupShadcn(projectPath);
    }

    // 10. Clean up default boilerplate files
    deleteFile(path.join(projectPath, "src", "App.css"));
    if (cssFramework !== "Tailwind") {
        deleteFile(path.join(projectPath, "src", "index.css"));
    }

    // 11. Generate clean templates
    createAppComponent(projectPath, projectName, isPWA, cssFramework, packages);
    setupRouterMain(projectPath, cssFramework);
    
    // 12. Create comprehensive README
    createPWAReadme(projectPath, projectName, cssFramework, packages, isPWA);

    // 13. Success message
    console.log("\n✅ Setup complete!");
    if (isPWA) {
        console.log("📱 PWA features enabled - your app can be installed on mobile devices!");
        console.log("⚠️  Important: Replace placeholder SVG icons with proper PNG icons for production");
    }
    if (packages.includes("i18n")) {
        console.log("🌐 Internationalization enabled with react-i18next. Check src/i18n.js for configuration.");
    }
    if (packages.includes("shadcn")) {
        console.log("🎨 Shadcn/ui components installed. Use 'npx shadcn-ui@latest add <component>' to add more components.");
    }
    console.log(`\nNext steps:\n  cd ${projectName}\n  npm install\n  npm run dev`);
    
    if (isPWA) {
        console.log(`\n📱 To test PWA:\n  npm run build\n  npm run preview\n  Open http://localhost:4173 and test install/offline features`);
    }
})();

