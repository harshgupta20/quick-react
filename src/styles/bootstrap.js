import path from "node:path";
import fs from "node:fs";
import { run } from "../utils.js";

export const setupBootstrapCDN = (projectPath) => {
    const indexHtmlPath = path.join(projectPath, "index.html");
    let indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");
    indexHtml = indexHtml.replace(
        /<head>/,
        `<head>\n    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">\n    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>`
    );
    fs.writeFileSync(indexHtmlPath, indexHtml);
};

export const setupReactBootstrap = (projectPath) => {
    run("npm install react-bootstrap bootstrap", projectPath);
    const mainFile = fs.existsSync(path.join(projectPath, "src/main.jsx"))
        ? "src/main.jsx"
        : "src/main.tsx";
    const mainPath = path.join(projectPath, mainFile);
    let mainContent = fs.readFileSync(mainPath, "utf-8");
    mainContent = mainContent
        .replace(/import\s+['"]\.\/index\.css['"];?/g, "")
        .replace(/import\s+['"]\.\/App\.css['"];?/g, "");
    mainContent = `import 'bootstrap/dist/css/bootstrap.min.css';\n${mainContent}`;
    fs.writeFileSync(mainPath, mainContent);
};