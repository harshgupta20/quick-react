import path from "node:path";
import fs from "node:fs";

export const createMainTemplate = (projectPath, cssFramework) => {
    const mainFile = fs.existsSync(path.join(projectPath, "src/main.jsx"))
        ? "src/main.jsx"
        : "src/main.tsx";
    const mainPath = path.join(projectPath, mainFile);

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
};