import path from "node:path";
import fs from "node:fs";
import { run } from "../utils.js";

export const setupTailwind = (projectPath) => {
    run("npm install tailwindcss @tailwindcss/vite", projectPath);

    const viteConfigPath = path.join(projectPath, "vite.config.js");
    let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");
    viteConfig = `import tailwindcss from '@tailwindcss/vite'\n${viteConfig}`;
    viteConfig = viteConfig.replace(
        /plugins:\s*\[/,
        "plugins: [\n    tailwindcss(),"
    );
    fs.writeFileSync(viteConfigPath, viteConfig);

    fs.writeFileSync(
        path.join(projectPath, "src", "index.css"),
        `@import "tailwindcss";\n`
    );

    const mainFile = fs.existsSync(path.join(projectPath, "src/main.jsx"))
        ? "src/main.jsx"
        : "src/main.tsx";
    const mainPath = path.join(projectPath, mainFile);
    let mainContent = fs.readFileSync(mainPath, "utf-8");
    mainContent = mainContent.replace(/import\s+['"]\.\/index\.css['"];?/g, "");
    if (!mainContent.includes(`import './index.css'`)) {
        mainContent = `import './index.css';\n${mainContent}`;
    }
    fs.writeFileSync(mainPath, mainContent);
};