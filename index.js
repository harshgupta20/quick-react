#!/usr/bin/env node

import inquirer from "inquirer";
import checkboxSearch from 'inquirerjs-checkbox-search';
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const run = (cmd, cwd = process.cwd()) => {
    console.log(`\n📦 Running: ${cmd}`);
    execSync(cmd, { stdio: "inherit", cwd });
};

(async () => {
    // 1. Ask project name
    const { projectName } = await inquirer.prompt([
        { type: "input", name: "projectName", message: "Enter project name:" }
    ]);

    // 2. Ask for CSS framework
    const { cssFramework } = await inquirer.prompt([
        {
            type: "list",
            name: "cssFramework",
            message: "Choose a CSS framework:",
            choices: [
                "Tailwind",
                "Bootstrap (CDN)",
                "React Bootstrap",
                "MUI",
                "shadcn/ui"
            ]
        }
    ]);

    // 2.5. If shadcn/ui is chosen, show component search
    let selectedShadcnComponents = []
    let shadcnRegistry = []
    if (cssFramework === "shadcn/ui") {
      // Load components JSON (expects: { components: [{ name, value }, ...] })
      const raw = fs.readFileSync("./shadcn-components.json", "utf8");
      shadcnRegistry = (JSON.parse(raw).components) || [];

      // Prompt with searchable checkbox
      const components = await checkboxSearch({
          message: 'Which shadcn/ui components do you use?',
          choices: shadcnRegistry,
      });
      selectedShadcnComponents = components;
    }
    // 3. Ask optional packages
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

    // 4. Create Vite + React project
    
    run(`npm create vite@latest ${projectName} -- --template react`);
    const projectPath = path.join(process.cwd(), projectName);

    // 5. Install chosen CSS framework
    if (cssFramework === "Tailwind") {
        run(`npm install tailwindcss @tailwindcss/vite`, projectPath);

        const viteConfigPath = path.join(projectPath, "vite.config.js");
        let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");
        viteConfig = `import tailwindcss from '@tailwindcss/vite'\n` + viteConfig;
        viteConfig = viteConfig.replace(/plugins:\s*\[/, "plugins: [\n    tailwindcss(),");
        fs.writeFileSync(viteConfigPath, viteConfig);

        fs.writeFileSync(path.join(projectPath, "src", "index.css"), `@import "tailwindcss";\n`);

        const mainFile = fs.existsSync(path.join(projectPath, "src/main.jsx"))
            ? "src/main.jsx"
            : "src/main.tsx";
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
        const mainFile = fs.existsSync(path.join(projectPath, "src/main.jsx"))
            ? "src/main.jsx"
            : "src/main.tsx";
        const mainPath = path.join(projectPath, mainFile);
        let mainContent = fs.readFileSync(mainPath, "utf-8");
        mainContent = mainContent
            .replace(/import\s+['"]\.\/index\.css['"];?/g, "")
            .replace(/import\s+['"]\.\/App\.css['"];?/g, "");
        mainContent = `import 'bootstrap/dist/css/bootstrap.min.css';\n` + mainContent;
        fs.writeFileSync(mainPath, mainContent);

    } else if (cssFramework === "MUI") {
        run(`npm install @mui/material @emotion/react @emotion/styled`, projectPath);
        const mainFile = fs.existsSync(path.join(projectPath, "src/main.jsx"))
            ? "src/main.jsx"
            : "src/main.tsx";
        const mainPath = path.join(projectPath, mainFile);
        let mainContent = fs.readFileSync(mainPath, "utf-8");
        mainContent = mainContent
            .replace(/import\s+['"]\.\/index\.css['"];?/g, "")
            .replace(/import\s+['"]\.\/App\.css['"];?/g, "");
        fs.writeFileSync(mainPath, mainContent);
    } else if (cssFramework === "shadcn/ui") {
        // A. Install tailwind + vite plugin
        run(`npm install tailwindcss @tailwindcss/vite`, projectPath);

        // B. jsconfig.json with path alias
        const jsconfigPath = path.join(projectPath, "jsconfig.json");
        const jsconfig = {
            compilerOptions: {
                baseUrl: ".",
                paths: {
                    "@/*": ["./src/*"]
                }
            }
        };
        fs.writeFileSync(jsconfigPath, JSON.stringify(jsconfig, null, 2));

        // C. Update vite.config.js: alias + tailwindcss() plugin
        const viteConfigPath = path.join(projectPath, "vite.config.js");
        let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");
        if (!/import\s+tailwindcss\s+from\s+['"]@tailwindcss\/vite['"]/m.test(viteConfig)) {
            viteConfig = `import tailwindcss from '@tailwindcss/vite'\n` + viteConfig;
        }
        if (!/import\s+path\s+from\s+['"]path['"]/m.test(viteConfig)) {
            viteConfig = viteConfig.replace(/(import\s+.*?from\s+['"][^'"]+['"];?\s*)+/m, (m) => m + `import path from 'path'\n`);
        }
        // ensure tailwindcss() in plugins
        viteConfig = viteConfig.replace(/plugins:\s*\[/, (m) => `${m}\n    tailwindcss(),`);
        // ensure resolve.alias configured
        if (!/resolve:\s*\{/m.test(viteConfig)) {
            viteConfig = viteConfig.replace(/export\s+default\s+defineConfig\(\{/, (m) => `${m}\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "src"),\n    },\n  },`);
        } else if (!/alias:\s*\{/m.test(viteConfig)) {
            viteConfig = viteConfig.replace(/resolve:\s*\{/, (m) => `${m}\n    alias: {\n      "@": path.resolve(__dirname, "src"),\n    },`);
        } else if (!/['"]@['"]:\s*path\.resolve\(__dirname,\s*['"]src['"]\)/m.test(viteConfig)) {
            viteConfig = viteConfig.replace(/alias:\s*\{/, (m) => `${m}\n      "@": path.resolve(__dirname, "src"),`);
        }
        fs.writeFileSync(viteConfigPath, viteConfig);

        // D. Tailwind CSS entry
        fs.writeFileSync(path.join(projectPath, "src", "index.css"), `@import "tailwindcss";\n`);

        // E. Import CSS in main file
        const mainFile = fs.existsSync(path.join(projectPath, "src/main.jsx"))
            ? "src/main.jsx"
            : "src/main.tsx";
        const mainPath = path.join(projectPath, mainFile);
        let mainContent = fs.readFileSync(mainPath, "utf-8");
        mainContent = mainContent.replace(/import\s+['"]\.\/index\.css['"];?/g, "");
        if (!mainContent.includes(`import './index.css'`)) {
            mainContent = `import './index.css';\n` + mainContent;
        }
        fs.writeFileSync(mainPath, mainContent);

        // F. Initialize shadcn/ui
        run(`npx  shadcn@latest init`, projectPath);

        // G. Override aliases in components.json
        const componentsJsonPath = path.join(projectPath, "components.json");
        if (fs.existsSync(componentsJsonPath)) {
            const compJson = JSON.parse(fs.readFileSync(componentsJsonPath, "utf-8"));
            compJson.aliases = { components: "@/components", utils: "@/utils" };
            fs.writeFileSync(componentsJsonPath, JSON.stringify(compJson, null, 2));
        }

        // H. Install selected components using their values
        const installValues = selectedShadcnComponents
        .map((val) => val.split(":")[0]);

        if (installValues.length > 0) {
            run(`npx shadcn@latest add ${installValues.join(' ')}`, projectPath);

            // Run extra commands for selected components, if any
            const extraCommands = Array.from(new Set(
                (shadcnRegistry || [])
                    .filter((c) => selectedShadcnComponents.includes(c.value) && c.extraCommands)
                    .map((c) => c.extraCommands)
            ));

            for (const cmd of extraCommands) {
                run(cmd, projectPath);
            }
        }
    }

    // 6. Install default + optional packages
    const defaultPackages = ["react-router-dom"];
    const allPackages = [...defaultPackages, ...packages];
    if (allPackages.length > 0) {
        run(`npm install ${allPackages.join(" ")}`, projectPath);
    }

    // 7. Create folder structure
    const folders = ["components", "pages", "hooks", "store", "utils", "assets"];
    folders.forEach((folder) => {
        fs.mkdirSync(path.join(projectPath, "src", folder), { recursive: true });
    });

    // 8. Axios setup if chosen
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

    // 9. Clean up default CSS files (centralized)
    const appCssPath = path.join(projectPath, "src", "App.css");
    if (fs.existsSync(appCssPath)) fs.unlinkSync(appCssPath);

    const indexCssPath = path.join(projectPath, "src", "index.css");
    if (cssFramework !== "Tailwind" && cssFramework !== "shadcn/ui" && fs.existsSync(indexCssPath)) {
        fs.unlinkSync(indexCssPath);
    }

    // 10. Replace App.jsx content
    const appFile = fs.existsSync(path.join(projectPath, "src/App.jsx"))
        ? path.join(projectPath, "src/App.jsx")
        : path.join(projectPath, "src/App.tsx");

    let appContent = `export default function App() {
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
}`;
    fs.writeFileSync(appFile, appContent);

    // 11. Default Router setup in main.jsx
    const mainFile = fs.existsSync(path.join(projectPath, "src/main.jsx"))
        ? "src/main.jsx"
        : "src/main.tsx";
    const mainPath = path.join(projectPath, mainFile);

    let cssImports = "";
    if (cssFramework === "React Bootstrap") {
        cssImports = `import 'bootstrap/dist/css/bootstrap.min.css';\n`;
    } else if (cssFramework === "Tailwind" || cssFramework === "shadcn/ui") {
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
