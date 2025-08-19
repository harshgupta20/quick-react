import path from "node:path";
import fs from "node:fs";
import { run } from "../utils.js";

export const setupMUI = (projectPath) => {
    run("npm install @mui/material @emotion/react @emotion/styled", projectPath);
    const mainFile = fs.existsSync(path.join(projectPath, "src/main.jsx"))
        ? "src/main.jsx"
        : "src/main.tsx";
    const mainPath = path.join(projectPath, mainFile);
    let mainContent = fs.readFileSync(mainPath, "utf-8");
    mainContent = mainContent
        .replace(/import\s+['"]\.\/index\.css['"];?/g, "")
        .replace(/import\s+['"]\.\/App\.css['"];?/g, "");
    fs.writeFileSync(mainPath, mainContent);
};