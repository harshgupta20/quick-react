#!/usr/bin/env node
import { input, select, confirm, checkbox } from "@inquirer/prompts"
import { select as selectPro } from 'inquirer-select-pro';
import path from "path";
import { run, createFolder, deleteFile } from "./lib/utils.js";
import { initializePWA } from "./lib/pwa.js";
import { setupCSSFramework } from "./lib/css-frameworks.js";
import {
  createAxiosSetup,
  createAppComponent,
  setupRouterMain,
  createPWAReadme,
} from "./lib/templates.js";
import { setupRoutingFramework } from "./lib/router-setup.js";

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

(async () => {
  // 1. Collect user inputs
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter project name:",
    },
    {
      type: "list",
      name: "cssFramework",
      message: "Choose a CSS framework:",
      choices: ["Tailwind", "Bootstrap (CDN)", "React Bootstrap", "MUI"],
    },
    {
      type: "list",
      name: "routingFramework",
      message: "Choose a routing framework:",
      choices: ["React Router", "Tanstack Router"],
    },
    {
      type: "confirm",
      name: "isPWA",
      message: "Do you want to make this a Progressive Web App (PWA)?",
      default: false,
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
        { name: "ReduxJs/Toolkit", value: "@reduxjs/toolkit" },
        { name: "React Bindings (React-Redux)", value: "react-redux" }
      ],
    },
    {
      type: "checkbox",
      name: "devPackages",
      message: "Select dev packages to install:",
      choices: [{ name: "Jest", value: "jest" }],
    },
  ]);

  const { projectName, cssFramework, routingFramework, isPWA, packages, devPackages } = answers;
  const projectPath = path.join(process.cwd(), projectName);

  console.log(
    `\n🚀 Creating ${projectName}${isPWA ? " with PWA capabilities" : ""}...`
  );

  // 2. Create Vite project
  run(`npm create vite@latest ${projectName} -- --template react`);

  // 3. Create all necessary folder structure first
  const folders = ["components", "pages", "hooks", "store", "utils", "assets"];
  const routingConfig = {
    "Tanstack Router": {
      folders: ["routes"],
      packages: ["@tanstack/react-router", "@tanstack/react-router-devtools"],
      devPackages: ["@tanstack/router-plugin"]
    },
    "React Router": {
      folders: [],
      packages: ["react-router-dom"],
      devPackages: []
    }
  };
  const config = routingConfig[routingFramework] || { folders: [], packages: [], devPackages: [] };
  folders.push(...config.folders);
  folders.forEach((folder) => {
    createFolder(path.join(projectPath, "src", folder));
  });

  // 4. Install packages
  const allPackages = [...config.packages, ...packages];
  if (allPackages.length > 0) {
    run(`npm install ${allPackages.join(" ")}`, projectPath);
  }
  if (devPackages.length > 0 || config.devPackages.length > 0) {
    run(`npm install --save-dev ${[...devPackages, ...config.devPackages].join(" ")}`, projectPath);
  }

  // 5. Setup PWA if selected (after folder structure is created)
  if (isPWA) {
    initializePWA(projectPath, projectName);
  }

  // 6. Setup CSS framework
  setupCSSFramework(cssFramework, projectPath);

  // 7. Setup Axios if selected
  if (packages.includes("axios")) {
    createAxiosSetup(projectPath);
  }

  // 8. Clean up default boilerplate files
  deleteFile(path.join(projectPath, "src", "App.css"));
  if (cssFramework !== "Tailwind") {
    deleteFile(path.join(projectPath, "src", "index.css"));
  }

  // 9. Generate clean templates
  createAppComponent(projectPath, projectName, isPWA);
  setupRouterMain(projectPath, cssFramework);

  // 10. Create comprehensive README
  createPWAReadme(projectPath, projectName, cssFramework, packages, isPWA);

  // 11. Success message
  console.log("\n✅ Setup complete!");
  if (isPWA) {
    console.log(
      "📱 PWA features enabled - your app can be installed on mobile devices!"
    );
    console.log(
      "⚠️  Important: Replace placeholder SVG icons with proper PNG icons for production"
    );
  }
  console.log(
    `\nNext steps:\n  cd ${projectName}\n  npm install\n  npm run dev`
  );

  if (isPWA) {
    console.log(
      `\n📱 To test PWA:\n  npm run build\n  npm run preview\n  Open http://localhost:5173 and test install/offline features`
    );
  }

  if (devPackages.includes("jest")) {
    console.log(
      "Setting up Jest configuration... \n Add the following to your package.json:"
    );
    console.log(`\n  "scripts": {\n    "test": "jest"\n  }`);
  }
})();