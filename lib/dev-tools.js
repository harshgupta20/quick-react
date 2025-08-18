import { run, writeFile, readFile } from './utils.js';
import path from 'path';
import fs from 'fs';

export const setupESLintPrettier = (projectPath) => {
    run(`npm install -D eslint @eslint/js eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh prettier eslint-config-prettier eslint-plugin-prettier`, projectPath);
    
    // Create ESLint config
    const eslintConfig = `import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]`;
    writeFile(path.join(projectPath, "eslint.config.js"), eslintConfig);

    // Create Prettier config
    const prettierConfig = `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}`;
    writeFile(path.join(projectPath, ".prettierrc"), prettierConfig);

    // Create .prettierignore
    const prettierIgnore = `dist
node_modules
*.log
.DS_Store`;
    writeFile(path.join(projectPath, ".prettierignore"), prettierIgnore);
};

export const setupHusky = (projectPath) => {
    run(`npm install -D husky lint-staged`, projectPath);
    run(`npx husky install`, projectPath);
    run(`npx husky add .husky/pre-commit "npx lint-staged"`, projectPath);

    // Create lint-staged config in package.json
    const packageJsonPath = path.join(projectPath, "package.json");
    let packageJson = JSON.parse(readFile(packageJsonPath));
    packageJson["lint-staged"] = {
        "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
        "*.{css,scss,md}": ["prettier --write"]
    };
    writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

export const setupCommitizen = (projectPath) => {
    run(`npm install -D commitizen cz-conventional-changelog`, projectPath);
    
    const packageJsonPath = path.join(projectPath, "package.json");
    let packageJson = JSON.parse(readFile(packageJsonPath));
    packageJson.config = {
        commitizen: {
            path: "cz-conventional-changelog"
        }
    };
    writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

export const updatePackageScripts = (projectPath, testingFramework, devTools) => {
    const packageJsonPath = path.join(projectPath, "package.json");
    let packageJson = JSON.parse(readFile(packageJsonPath));
    
    // Add testing scripts based on framework chosen
    if (testingFramework === "vitest") {
        packageJson.scripts.test = "vitest";
        packageJson.scripts["test:ui"] = "vitest --ui";
        packageJson.scripts["test:coverage"] = "vitest --coverage";
    } else if (testingFramework === "jest") {
        packageJson.scripts.test = "jest";
        packageJson.scripts["test:watch"] = "jest --watch";
        packageJson.scripts["test:coverage"] = "jest --coverage";
    } else if (testingFramework === "cypress") {
        packageJson.scripts["test:e2e"] = "cypress open";
        packageJson.scripts["test:e2e:headless"] = "cypress run";
    }

    // Add linting scripts if ESLint is chosen
    if (devTools.includes("eslint-prettier")) {
        packageJson.scripts.lint = "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0";
        packageJson.scripts["lint:fix"] = "eslint . --ext js,jsx --fix";
        packageJson.scripts.format = 'prettier --write "src/**/*.{js,jsx,css,md}"';
    }

    // Add commit script if commitizen is chosen
    if (devTools.includes("commitizen")) {
        packageJson.scripts.commit = "cz";
    }

    writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

export const setupDevTools = (devTools, projectPath, testingFramework) => {
    if (devTools.includes("eslint-prettier")) {
        setupESLintPrettier(projectPath);
    }

    if (devTools.includes("husky")) {
        setupHusky(projectPath);
    }

    if (devTools.includes("commitizen")) {
        setupCommitizen(projectPath);
    }

    // Update package.json scripts
    updatePackageScripts(projectPath, testingFramework, devTools);
};
