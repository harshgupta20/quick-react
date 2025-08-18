import { run, writeFile, createFolder } from './utils.js';
import path from 'path';
import fs from 'fs';

export const setupVitest = (projectPath) => {
    run(`npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`, projectPath);
    
    // Update vite.config.js for Vitest
    const viteConfigPath = path.join(projectPath, "vite.config.js");
    let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");
    
    // Add test configuration
    const testConfig = `
/// <reference types="vitest" />
`;
    viteConfig = testConfig + viteConfig;
    viteConfig = viteConfig.replace(
        /export default defineConfig\(\{/,
        `export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },`
    );
    writeFile(viteConfigPath, viteConfig);

    // Create test setup file
    createFolder(path.join(projectPath, "src", "test"));
    const setupContent = `import '@testing-library/jest-dom';`;
    writeFile(path.join(projectPath, "src", "test", "setup.ts"), setupContent);

    // Create sample test
    const testContent = `import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
  });
});`;
    writeFile(path.join(projectPath, "src", "App.test.jsx"), testContent);
};

export const setupJest = (projectPath) => {
    run(`npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom`, projectPath);
    
    // Create Jest config
    const jestConfig = `export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  moduleNameMapping: {
    '\\\\.(css|less|scss)$': 'identity-obj-proxy',
  },
};`;
    writeFile(path.join(projectPath, "jest.config.js"), jestConfig);

    // Create test setup file
    createFolder(path.join(projectPath, "src", "test"));
    const setupContent = `import '@testing-library/jest-dom';`;
    writeFile(path.join(projectPath, "src", "test", "setup.js"), setupContent);
};

export const setupCypress = (projectPath) => {
    run(`npm install -D cypress`, projectPath);
    run(`npx cypress install`, projectPath);
    
    // Create cypress config
    const cypressConfig = `import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})`;
    writeFile(path.join(projectPath, "cypress.config.js"), cypressConfig);
};

export const setupTestingFramework = (testingFramework, projectPath) => {
    const testingMap = {
        "vitest": () => setupVitest(projectPath),
        "jest": () => setupJest(projectPath),
        "cypress": () => setupCypress(projectPath)
    };

    const setupFunction = testingMap[testingFramework];
    if (setupFunction) {
        setupFunction();
    }
};
