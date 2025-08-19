import { setupTailwind } from "./tailwind.js";
import { setupBootstrapCDN, setupReactBootstrap } from "./bootstrap.js";
import { setupMUI } from "./mui.js";

export const setupCSSFramework = (cssFramework, projectPath) => {
    switch (cssFramework) {
        case "Tailwind":
            setupTailwind(projectPath);
            break;
        case "Bootstrap (CDN)":
            setupBootstrapCDN(projectPath);
            break;
        case "React Bootstrap":
            setupReactBootstrap(projectPath);
            break;
        case "MUI":
            setupMUI(projectPath);
            break;
    }
};