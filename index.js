#!/usr/bin/env node

import inquirer from "inquirer";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const run = (cmd, cwd = process.cwd()) => {
    console.log(`\n📦 Running: ${cmd}`);
    execSync(cmd, { stdio: "inherit", cwd });
};


(async () => {
    // 1. Ask for language
    const { language } = await inquirer.prompt([
        {
            type: "list",
            name: "language",
            message: "Choose project language:",
            choices: [
                { name: "JavaScript", value: "js" },
                { name: "TypeScript", value: "ts" }
            ]
        }
    ]);

    // 2. Ask project name
    const { projectName } = await inquirer.prompt([
        { type: "input", name: "projectName", message: "Enter project name:" }
    ]);

    // 3. Ask for CSS framework
    const { cssFramework } = await inquirer.prompt([
        {
            type: "list",
            name: "cssFramework",
            message: "Choose a CSS framework:",
            choices: [
                "Tailwind",
                "Bootstrap (CDN)",
                "React Bootstrap",
                "MUI"
            ]
        }
    ]);

    // 4. Ask optional packages
    const { packages } = await inquirer.prompt([
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
                { name: "Moment.js", value: "moment" }
            ]
        }
    ]);

    // 5. Create Vite + React project with correct template
    const viteTemplate = language === "ts" ? "react-ts" : "react";
    run(`npm create vite@latest ${projectName} -- --template ${viteTemplate}`);
    const projectPath = path.join(process.cwd(), projectName);

    // 6. Install chosen CSS framework
    const mainFileExt = language === "ts" ? "tsx" : "jsx";

    if (cssFramework === "Tailwind") {
        run(`npm install tailwindcss @tailwindcss/vite`, projectPath);

        // Support both vite.config.js and vite.config.ts
        let viteConfigPath = path.join(projectPath, "vite.config.js");
        if (!fs.existsSync(viteConfigPath)) {
            viteConfigPath = path.join(projectPath, "vite.config.ts");
        }
        if (fs.existsSync(viteConfigPath)) {
            let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");
            viteConfig = `import tailwindcss from '@tailwindcss/vite'\n` + viteConfig;
            viteConfig = viteConfig.replace(/plugins:\s*\[/, "plugins: [\n    tailwindcss(),");
            fs.writeFileSync(viteConfigPath, viteConfig);
        }

        fs.writeFileSync(path.join(projectPath, "src", "index.css"), `@import "tailwindcss";\n`);

        const mainFile = fs.existsSync(path.join(projectPath, `src/main.${mainFileExt}`))
            ? `src/main.${mainFileExt}`
            : (language === "ts" ? "src/main.tsx" : "src/main.jsx");
        const mainPath = path.join(projectPath, mainFile);
        let mainContent = fs.readFileSync(mainPath, "utf-8");
        mainContent = mainContent.replace(/import\s+['"]\.\/index\.css['"];?/g, "");
        if (!mainContent.includes(`import './index.css'`)) {
            mainContent = `import './index.css';\n` + mainContent;
        }
        fs.writeFileSync(mainPath, mainContent);

    } else if (cssFramework === "Bootstrap (CDN)") {
        const indexHtmlPath = path.join(projectPath, "index.html");
        let indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");
        indexHtml = indexHtml.replace(
            /<head>/,
            `<head>\n    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">\n    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>`
        );
        fs.writeFileSync(indexHtmlPath, indexHtml);

    } else if (cssFramework === "React Bootstrap") {
        run(`npm install react-bootstrap bootstrap`, projectPath);
        const mainFile = fs.existsSync(path.join(projectPath, `src/main.${mainFileExt}`))
            ? `src/main.${mainFileExt}`
            : (language === "ts" ? "src/main.tsx" : "src/main.jsx");
        const mainPath = path.join(projectPath, mainFile);
        let mainContent = fs.readFileSync(mainPath, "utf-8");
        mainContent = mainContent
            .replace(/import\s+['"]\.\/index\.css['"];?/g, "")
            .replace(/import\s+['"]\.\/App\.css['"];?/g, "");
        mainContent = `import 'bootstrap/dist/css/bootstrap.min.css';\n` + mainContent;
        fs.writeFileSync(mainPath, mainContent);

    } else if (cssFramework === "MUI") {
        run(`npm install @mui/material @emotion/react @emotion/styled`, projectPath);
        const mainFile = fs.existsSync(path.join(projectPath, `src/main.${mainFileExt}`))
            ? `src/main.${mainFileExt}`
            : (language === "ts" ? "src/main.tsx" : "src/main.jsx");
        const mainPath = path.join(projectPath, mainFile);
        let mainContent = fs.readFileSync(mainPath, "utf-8");
        mainContent = mainContent
            .replace(/import\s+['"]\.\/index\.css['"];?/g, "")
            .replace(/import\s+['"]\.\/App\.css['"];?/g, "");
        fs.writeFileSync(mainPath, mainContent);
    }

    // 7. Install default + optional packages
    const defaultPackages = ["react-router-dom"];
    const allPackages = [...defaultPackages, ...packages];
    if (language === "js") {
        allPackages.push("prop-types");
    }
    if (allPackages.length > 0) {
        run(`npm install ${allPackages.join(" ")}`, projectPath);
    }
    if (language === "ts") {
        run("npm install -D typescript @types/react @types/react-dom @types/node", projectPath);
    }

    // 7. Create folder structure
    const folders = ["components", "pages", "hooks", "store", "utils", "assets"];
    folders.forEach((folder) => {
        fs.mkdirSync(path.join(projectPath, "src", folder), { recursive: true });
    });

    // 9. Axios setup if chosen
    if (packages.includes("axios")) {
        const axiosContent = `import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    headers: { "Content-Type": "application/json" },
    timeout: 10000
});

// ✅ Request Interceptor
api.interceptors.request.use(
    (config) => {
        // Example: Add token if available
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = \`Bearer \${token}\`;
        }
        return config;
    },
    (error) => {
            return Promise.reject(error);
        }
);

// ✅ Response Interceptor
api.interceptors.response.use(
    (response) => {
            return response.data; // Return only data for convenience
        },
    (error) => {
        if (error.response) {
            console.error("API Error:", error.response.data?.message || error.message);
            // Example: Handle unauthorized
            if (error.response.status === 401) {
            // Optionally redirect to login
                window.location.href = "/login";
            }
        } else if (error.request) {
            console.error("No response received from server.");
        } else {
            console.error("Request setup error:", error.message);
        }
        return Promise.reject(error);
    }
);
`;

        fs.writeFileSync(path.join(projectPath, "src", "utils", "axiosInstance.js"), axiosContent);
    }

    // 10. Clean up default CSS files (centralized)
    const appCssPath = path.join(projectPath, "src", "App.css");
    if (fs.existsSync(appCssPath)) fs.unlinkSync(appCssPath);

    const indexCssPath = path.join(projectPath, "src", "index.css");
    if (cssFramework !== "Tailwind" && fs.existsSync(indexCssPath)) {
        fs.unlinkSync(indexCssPath);
    }


    // 11. Replace App file content with correct extension and type safety
    const appFile = fs.existsSync(path.join(projectPath, `src/App.${mainFileExt}`))
        ? path.join(projectPath, `src/App.${mainFileExt}`)
        : path.join(projectPath, language === "ts" ? "src/App.tsx" : "src/App.jsx");

    let appContent = "";
    if (language === "ts") {
        appContent = `import React from "react";

type AppProps = {};

const App: React.FC<AppProps> = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        background: "#f9fafb",
        color: "#111",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "0.5rem",
          fontWeight: 600,
        }}
      >
        Welcome to{" "}
        <span style={{ color: "#2563eb" }}>${projectName}</span> 🚀
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555" }}>
        Your project is ready. Start building amazing things!
      </p>
    </div>
  );
};

export default App;
`;
    } else {
        appContent = `import React from "react";
import PropTypes from "prop-types";

function App(props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        background: "#f9fafb",
        color: "#111",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "0.5rem",
          fontWeight: 600,
        }}
      >
        Welcome to{" "}
        <span style={{ color: "#2563eb" }}>${projectName}</span> 🚀
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555" }}>
        Your project is ready. Start building amazing things!
      </p>
    </div>
  );
}

App.propTypes = {};

export default App;
`;
    }
    fs.writeFileSync(appFile, appContent);


    // 12. Default Router setup in main file
    const mainFileName = fs.existsSync(path.join(projectPath, `src/main.${mainFileExt}`))
        ? `src/main.${mainFileExt}`
        : (language === "ts" ? "src/main.tsx" : "src/main.jsx");
    const mainPath = path.join(projectPath, mainFileName);

    let cssImports = "";
    if (cssFramework === "React Bootstrap") {
        cssImports = `import 'bootstrap/dist/css/bootstrap.min.css';\n`;
    } else if (cssFramework === "Tailwind") {
        cssImports = `import './index.css';\n`;
    } else if (cssFramework === "Bootstrap (CDN)") {
        cssImports = ""; // CDN already added in index.html
    } else if (cssFramework === "MUI") {
        cssImports = ""; // no CSS import needed
    }

    const routerSetup = `${cssImports}import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);`;

    fs.writeFileSync(mainPath, routerSetup);


    console.log("\n✅ Setup complete!");
    console.log(`\nNext steps:\n  cd ${projectName}\n  npm run dev`);
})();
