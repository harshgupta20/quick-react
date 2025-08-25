#!/usr/bin/env node
import inquirer from "inquirer"
import path from "path"
import { run, createFolder, deleteFile } from "./lib/utils.js"
import { initializePWA } from "./lib/pwa.js"
import { setupCSSFramework } from "./lib/css-frameworks.js"
import {
  createAxiosSetup,
  createAppComponent,
  setupRouterMain,
  createPWAReadme,
} from "./lib/templates.js"
;(async () => {
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
        { name: "React Bindings (React-Redux)", value: "react-redux" },
      ],
    },
    {
      type: "list",
      name: "stateManagement",
      message: "Choose a State Management Tool:",
      choices: [
        { name: "None", value: "" },
        { name: "ReduxJs/Toolkit", value: "@reduxjs/toolkit react-redux" },
        { name: "Zustand", value: "zustand" },
        { name: "MobX", value: "mobx" },
        { name: "Recoil", value: "recoil" },
      ],
    },
    {
      type: "checkbox",
      name: "devPackages",
      message: "Select dev packages to install:",
      choices: [{ name: "Jest", value: "jest" }],
    },
  ])

  const {
    projectName,
    cssFramework,
    isPWA,
    packages,
    stateManagement,
    devPackages,
  } = answers
  const projectPath = path.join(process.cwd(), projectName)

  console.log(
    `\n🚀 Creating ${projectName}${isPWA ? " with PWA capabilities" : ""}...`
  )

  // 2. Create Vite project
  run(`npm create vite@latest ${projectName} -- --template react`)

  // 3. Create all necessary folder structure first
  const folders = ["components", "pages", "hooks", "store", "utils", "assets"]
  folders.forEach((folder) => {
    createFolder(path.join(projectPath, "src", folder))
  })

  // 4. Install packages
  const defaultPackages = ["react-router-dom"]
  const allPackages = [...defaultPackages, ...packages]

  // Add state management package if selected
  if (stateManagement) {
    allPackages.push(...stateManagement.split(" "))
  }

  if (allPackages.length > 0) {
    run(`npm install ${allPackages.join(" ")}`, projectPath)
  }

  if (devPackages.length > 0) {
    run(`npm install --save-dev ${devPackages.join(" ")}`, projectPath)
  }

  // 5. Setup PWA if selected (after folder structure is created)
  if (isPWA) {
    initializePWA(projectPath, projectName)
  }

  // 6. Setup CSS framework
  setupCSSFramework(cssFramework, projectPath)

  // 7. Setup Axios if selected
  if (packages.includes("axios")) {
    createAxiosSetup(projectPath)
  }

  // 8. Clean up default boilerplate files
  deleteFile(path.join(projectPath, "src", "App.css"))
  if (cssFramework !== "Tailwind") {
    deleteFile(path.join(projectPath, "src", "index.css"))
  }

  // 9. Generate clean templates
  createAppComponent(projectPath, projectName, isPWA)
  setupRouterMain(projectPath, cssFramework)

  // 10. Create comprehensive README
  createPWAReadme(projectPath, projectName, cssFramework, packages, isPWA)

  // 11. Success message
  console.log("\n✅ Setup complete!")
  if (isPWA) {
    console.log(
      "📱 PWA features enabled - your app can be installed on mobile devices!"
    )
    console.log(
      "⚠️  Important: Replace placeholder SVG icons with proper PNG icons for production"
    )
  }
  console.log(
    `\nNext steps:\n  cd ${projectName}\n  npm install\n  npm run dev`
  )

  if (isPWA) {
    console.log(
      `\n📱 To test PWA:\n  npm run build\n  npm run preview\n  Open http://localhost:5173 and test install/offline features`
    )
  }

  if (devPackages.includes("jest")) {
    console.log(
      "Setting up Jest configuration... \n Add the following to your package.json:"
    )
    console.log(`\n  "scripts": {\n    "test": "jest"\n  }`)
  }
})()
