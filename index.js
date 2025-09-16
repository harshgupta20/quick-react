#!/usr/bin/env node
import { input, select, confirm, checkbox } from "@inquirer/prompts"
import { select as selectPro } from 'inquirer-select-pro';
import path from "path";
import { run, createFolder, deleteFile } from './lib/utils.js';
import { initializePWA } from './lib/pwa.js';
import { setupCSSFramework } from './lib/css-frameworks.js';
import { createAxiosSetup, createAppComponent, createPWAReadme } from './lib/templates.js';
import { setupRoutingFramework } from "./lib/router-setup.js";
import { initializeGit } from "./lib/setup-git.js";
import { setupFirebase } from "./lib/firebase.js";

const getExtraPackages = async (input) => {
    if (!input) return []; //if no input, return empty array

    const res = await fetch(
        `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(input)}`
    );

    const data = await res.json();
    if (!data.objects) return []; //if no results, return empty array

    return data.objects.map((pkg) => ({
        name: `${pkg.package.name} \x1b[2m${pkg.package.description || ''}\x1b[0m`, //x1b[2m makes text dim, \x1b[0m resets it]
        value: pkg.package.name,
    }))
};

const GITHUB_REPO_URL = "https://github.com/harshgupta20/quickstart-react/issues"; 

(async () => {
    // 1. Collect user inputs
    const projectName = await input({ message: "Enter project name:", required: true });
    const language = await select({
        message: "Choose project language:",
        choices: ["TypeScript", "JavaScript"]
    })
    const cssFramework = await select({
        message: "Choose a CSS framework:",
        choices: ["Tailwind", "Bootstrap (CDN)", "React Bootstrap", "MUI"]
    });
    const routingFramework = await select({
        message: "Choose a routing framework:",
        choices: ["React Router", "Tanstack Router",]
    })
    const isPWA = await confirm({ message: "Do you want to make this a Progressive Web App (PWA)?", default: false });

    let packages = await checkbox({
        message: "Select optional packages:",
        choices: [
            { name: "Axios", value: "axios" },
            { name: "React Icons", value: "react-icons" },
            { name: "React Hook Form", value: "react-hook-form" },
            { name: "Yup", value: "yup" },
            { name: "Formik", value: "formik" },
            { name: "Moment.js", value: "moment" },
            { name: "Firebase (Firestore utils + env)", value: "firebase" }
        ]
    });

    // Fallback: some terminals or clients may not toggle checkboxes reliably.
    // If Firebase wasn't picked above, ask a simple confirm so the user can't miss it.
    if (!packages.includes('firebase')) {
        try {
            const firebaseConfirm = await confirm({ message: 'Would you like to add Firebase (Firestore utils + env)?', default: false });
            if (firebaseConfirm) {
                packages = [...packages, 'firebase'];
            }
        } catch (e) {
            // ignore confirm errors and continue
        }
    }

    const extraPackages = await selectPro({
        message: 'Search extra packages to add',
        multiple: true,
        clearInputWhenSelected: true,
        pageSize: 10,
        options: getExtraPackages,
        theme: {
            style: {
                renderSelectedOptions: (selectedOptions) => {
                    return selectedOptions.map(option => option.value).join(', ');
                }
            }
        }
    });

    let selectedExtraPackages = [];
    if (extraPackages.length > 0) {
        selectedExtraPackages = await checkbox({
            message: "These extra packages will be installed:",
            choices: extraPackages.map(pkg => ({
                name: pkg,
                value: pkg,
                checked: true,
            })),
        })
    }

    const projectPath = path.join(process.cwd(), projectName);
    const isTS = language == "TypeScript";

    console.log(`\n🚀 Creating ${projectName}${isPWA ? ' with PWA capabilities' : ''}...`);

    // 2. Create Vite project
    run(`npm create vite@latest ${projectName} -- --template ${isTS ? "react-ts" : "react"}`);

    // 3. Create all necessary folder structure first
    const folders = ["components", "pages", "hooks", "store", "utils", "assets"];

    // Create the routes folder (for tanstack router) and the necessary packages for Router setup
    const routingConfig = {
        "Tanstack Router": {
            folders: ["routes"],
            packages: ["@tanstack/react-router", "@tanstack/react-router-devtools"],
            devPackages: ["@tanstack/router-plugin"]
        },
        "React Router": {
            folders: [],
            packages: ["react-router"],
            devPackages: []
        }
    };

    const config = routingConfig[routingFramework] || { folders: [], packages: [], devPackages: [] };
    folders.push(...config.folders);
    const routingPackages = config.packages;
    folders.forEach((folder) => {
        createFolder(path.join(projectPath, "src", folder));
    });

    // 4. Install packages
    const firebasePkg = packages.includes("firebase") ? ["firebase"] : [];
    const allPackages = [...routingPackages, ...packages.filter(p => p !== 'firebase'), ...selectedExtraPackages, ...firebasePkg];
    if (allPackages.length > 0) {
        run(`npm install ${allPackages.join(" ")}`, projectPath);
        if (config.devPackages.length > 0) {
            run(`npm i -D ${config.devPackages.join(" ")}`, projectPath);
        }
    }

    // 5. Setup PWA if selected (after folder structure is created)
    if (isPWA) {
        initializePWA(projectPath, projectName, isTS);
    }

    // 6. Setup CSS framework
    setupCSSFramework(cssFramework, projectPath, isTS);

    // 7. Setup Axios if selected
    if (packages.includes("axios")) {
        createAxiosSetup(projectPath, isTS);
    }

    // 7b. Setup Firebase if selected
    if (packages.includes("firebase")) {
        setupFirebase(projectPath, isTS);
    }

    // 8. Clean up default boilerplate files
    deleteFile(path.join(projectPath, "src", "App.css"));
    if (cssFramework !== "Tailwind") {
        deleteFile(path.join(projectPath, "src", "index.css"));
    }

    // 9. Generate clean templates
    createAppComponent(projectPath, projectName, isPWA, isTS);
    setupRoutingFramework(projectPath, routingFramework, cssFramework, isTS);

    // 10. Create comprehensive README
    createPWAReadme(projectPath, projectName, cssFramework, packages, isPWA, isTS);

    // 11. Initialize Git repository
    initializeGit(projectPath);

    // 12. Success message
    console.log("\n✅ Setup complete!");
    if (isPWA) {
        console.log("📱 PWA features enabled - your app can be installed on mobile devices!");
        console.log("⚠️  Important: Replace placeholder SVG icons with proper PNG icons for production");
    }
    console.log(`\nNext steps:\n  cd ${projectName}\n  npm install\n  npm run dev`);

    if (isPWA) {
        console.log(`\n📱 To test PWA:\n  npm run build\n  npm run preview\n  Open http://localhost:5173 and test install/offline features`);
    }
    
    console.log(`\n🙌 Found a bug or want to improve this project?\nSubmit a PR or open an issue here: ${GITHUB_REPO_URL}\n`);
    console.log("\nHappy coding! 🎉");
})();
