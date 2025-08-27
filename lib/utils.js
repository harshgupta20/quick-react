import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const run = (cmd, cwd = process.cwd()) => {
    console.log(`\n📦 Running: ${cmd}`);
    execSync(cmd, { stdio: "inherit", cwd });
};

export const writeFile = (filePath, content) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
};

export const readFile = (filePath) => {
    return fs.readFileSync(filePath, "utf-8");
};

export const fileExists = (filePath) => {
    return fs.existsSync(filePath);
};

export const createFolder = (folderPath) => {
    fs.mkdirSync(folderPath, { recursive: true });
};

export const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// TS aware helpers
export function isTypeScriptProject(projectPath) {
    return fs.existsSync(path.join(projectPath, "tsconfig.json"));
}

export function resolveViteConfig(projectPath) {
    const ts = path.join(projectPath, "vite.config.ts");
    const js = path.join(projectPath, "vite.config.js");
    return fs.existsSync(ts) ? ts : js;
}

export function resolveReactEntry(projectPath) {
    const tsx = path.join(projectPath, "src", "main.tsx");
    const jsx = path.join(projectPath, "src", "main.jsx");
    return fs.existsSync(tsx) ? tsx : jsx;
}

export function resolveAppComponent(projectPath) {
    const tsx = path.join(projectPath, "src", "App.tsx");
    const jsx = path.join(projectPath, "src", "App.jsx");
    return fs.existsSync(tsx) ? tsx : jsx;
}
